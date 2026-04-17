from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import traceback
import random
import string
from datetime import datetime

from api import schemas, models, database
from api.database import engine, get_db
from core.agents.nutrition_coach import create_nutrition_agent

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart AI Nutrition Advisor - Orchestration Layer")

# Allow all origins for the MVP
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate the Agent globally to retain context if we use Redis memory
agent = create_nutrition_agent()

@app.post("/api/v1/auth/login", response_model=schemas.UserLoginResponse)
async def login_user(req: schemas.UserLoginRequest, db: Session = Depends(get_db)):
    """
    Called by the frontend after Firebase Google Sign-In.
    Upserts the user into the database securely.
    """
    user = db.query(models.User).filter(models.User.id == req.uid).first()
    if not user:
        user = models.User(id=req.uid, name=req.name)
        db.add(user)
        db.commit()
    else:
        user.name = req.name # Update name if changed
        db.commit()
    
    return {"status": "success", "uid": req.uid}

@app.post("/api/v1/recommend", response_model=schemas.StructuredNutritionResponse)
async def generate_recommendations(req: schemas.RecommendationRequest):
    """
    Main endpoint for the frontend. 
    Accepts user profile and wearable data, and hands off to the Antigravity Orchestrator.
    """
    try:
        # 1. Structure the natural language prompt with rigid context constraints
        prompt = (
            f"Generate a daily nutrition plan for user '{req.user_profile.user_id}'.\n\n"
            f"--- Context ---\n"
            f"Weight: {req.user_profile.weight_kg}kg, Height: {req.user_profile.height_cm}cm, "
            f"Age: {req.user_profile.age}, Gender: {req.user_profile.gender}\n"
            f"Goal: {req.user_profile.goal}\n"
            f"Dietary Restrictions: {req.user_profile.dietary_restrictions}\n"
            f"\n--- Wearable Sync Data (Yesterday) ---\n"
            f"Sleep: {req.wearable_data.sleep_hours} hours\n"
            f"HRV: {req.wearable_data.hrv} ms\n"
            f"Active Calories Burned: {req.wearable_data.active_cals} kcal\n\n"
            f"First check the wearable data, then lock in the deterministic macros, then find recommended meals. "
            f"Explain your reasoning based on the wearable data in exactly 2 sentences."
        )
        
        # 2. Execute Orchestrator Run 
        # (Assuming .run() synchronously triggers the Tool chain -> LLM -> JSON parsing block)
        # Note: Depending on the specific actual antigravity SDK integration, this is a mock representation
        response_json = agent.run(prompt=prompt)
        
        # In a real environment, response_json would already be validated to match StructuredNutritionResponse
        return response_json
        
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Orchestration Failed: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "ok", "agent_status": "ready"}

# --- Party System Endpoints ---

@app.post("/api/v1/metrics")
async def update_metrics(req: schemas.MetricsUpdate, db: Session = Depends(get_db)):
    # Ensure user exists
    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not user:
        user = models.User(id=req.user_id, name="User " + req.user_id[-4:])
        db.add(user)
        db.commit()

    metric = db.query(models.DailyMetrics).filter(
        models.DailyMetrics.user_id == req.user_id,
        models.DailyMetrics.date == req.date
    ).first()

    if not metric:
        metric = models.DailyMetrics(user_id=req.user_id, date=req.date)
        db.add(metric)

    metric.steps = req.steps
    metric.calories = req.calories
    metric.sleep_score = req.sleep_score
    db.commit()
    return {"status": "success"}

@app.post("/api/v1/parties", response_model=schemas.PartyInfo)
async def create_party(req: schemas.PartyCreate, db: Session = Depends(get_db)):
    # Generate unique 6-digit code
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    party = models.Party(name=req.party_name, code=code)
    db.add(party)
    db.commit()
    db.refresh(party)

    # Add creator as member
    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not user:
        user = models.User(id=req.user_id, name="Organizer")
        db.add(user)
    
    party.members.append(user)
    db.commit()
    
    return party

@app.post("/api/v1/parties/join", response_model=schemas.PartyInfo)
async def join_party(req: schemas.PartyJoin, db: Session = Depends(get_db)):
    party = db.query(models.Party).filter(models.Party.code == req.party_code).first()
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")

    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not user:
        user = models.User(id=req.user_id, name="Player")
        db.add(user)
    
    if user not in party.members:
        party.members.append(user)
        db.commit()
    
    return party

@app.get("/api/v1/parties/{code}", response_model=schemas.PartyInfo)
async def get_party(code: str, db: Session = Depends(get_db)):
    party = db.query(models.Party).filter(models.Party.code == code).first()
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    
    # Process members to include latest metrics
    today = datetime.now().strftime("%Y-%m-%d")
    members_info = []
    for m in party.members:
        metrics = db.query(models.DailyMetrics).filter(
            models.DailyMetrics.user_id == m.id,
            models.DailyMetrics.date == today
        ).first()
        members_info.append(schemas.PartyMemberInfo(
            user_id=m.id,
            name=m.name,
            steps=metrics.steps if metrics else 0,
            calories=metrics.calories if metrics else 0,
            sleep_score=metrics.sleep_score if metrics else 0
        ))
    
    return {
        "id": party.id,
        "name": party.name,
        "code": party.code,
        "created_at": party.created_at,
        "members": members_info
    }
