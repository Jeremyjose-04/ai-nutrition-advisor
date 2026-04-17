from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

class WearableData(BaseModel):
    sleep_hours: float = Field(..., description="Hours of sleep recorded the previous night")
    hrv: int = Field(..., description="Heart Rate Variability in ms")
    active_cals: int = Field(..., description="Active calories burned yesterday")

class UserProfile(BaseModel):
    user_id: str
    weight_kg: float
    height_cm: float
    age: int
    gender: str
    goal: str = Field(..., description="'fat_loss', 'maintenance', or 'muscle_gain'")
    dietary_restrictions: List[str] = Field(default=[])

class RecommendationRequest(BaseModel):
    user_profile: UserProfile
    wearable_data: WearableData

class Meal(BaseModel):
    meal_id: str
    name: str
    macros: Dict[str, float]
    match_score: float

class StructuredNutritionResponse(BaseModel):
    user_id: str
    rationale: str = Field(description="Empathetic explanation of the meal plan based on Wearable and Goal data.")
    daily_macros: Dict[str, float] = Field(description="EXACT values returned from the optimize_macros tool.")
    recommended_meals: List[Meal] = Field(description="EXACT meal IDs and names returned from the recommender tool.")
    health_warnings: List[str] = Field(default=[], description="Any flagged issues like extreme deficit warnings.")

# --- Party System Schemas ---

class MetricsUpdate(BaseModel):
    user_id: str
    steps: int
    calories: int
    sleep_score: int
    date: str # YYYY-MM-DD

class PartyMemberInfo(BaseModel):
    user_id: str
    name: str
    steps: int = 0
    calories: int = 0
    sleep_score: int = 0

class PartyCreate(BaseModel):
    user_id: str
    party_name: str

class PartyJoin(BaseModel):
    user_id: str
    party_code: str

class PartyInfo(BaseModel):
    id: int
    name: str
    code: str
    members: List[PartyMemberInfo]
    created_at: datetime

    class Config:
        from_attributes = True
