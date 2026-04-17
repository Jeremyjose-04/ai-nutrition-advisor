import random

def fetch_wearable_time_series(user_id: str, hrv: int, sleep_hours: float) -> dict:
    """
    Mock ML Client: Simulates querying an LSTM time-series model.
    In production, this would make a gRPC call to a Triton Inference Server.
    """
    fatigue_index = "LOW"
    modifier = 1.0
    
    if sleep_hours < 5.0 or hrv < 40:
        fatigue_index = "HIGH"
        modifier = 0.90 # 10% reduction in optimal strain capacity
        
    return {
        "user_id": user_id,
        "fatigue_index_predicted": fatigue_index,
        "recovery_score": round(100 * (sleep_hours / 8.0) * (hrv / 60.0), 1),
        "suggested_tdee_modifier": modifier
    }

def get_ncf_recommendations(user_id: str, target_cals: int,  tags: list[str]) -> list[dict]:
    """
    Mock ML Client: Simulates querying a Neural Collaborative Filtering two-tower model + Milvus DB.
    """
    # Mock food database mapped to embeddings
    mock_db = [
        {"meal_id": "M_101", "name": "Steak & Sweet Potato", "calories": 650, "p": 45, "f": 25, "c": 60, "tags": ["paleo", "high_protein"]},
        {"meal_id": "M_102", "name": "Salmon Quinoa Bowl", "calories": 550, "p": 35, "f": 22, "c": 50, "tags": ["pescatarian", "recovery"]},
        {"meal_id": "M_103", "name": "Chicken & Rice", "calories": 500, "p": 40, "f": 10, "c": 62, "tags": ["classic", "lean"]},
        {"meal_id": "M_104", "name": "Avocado Toast with Egg", "calories": 400, "p": 20, "f": 24, "c": 30, "tags": ["vegetarian", "breakfast"]},
    ]
    
    # Filter by user's caloric constraint broadly (allow 100 cal variance)
    possible_meals = [m for m in mock_db if abs(m["calories"] - (target_cals * 0.33)) < 150]
    
    # Normally, PyTorch would rank these using cosine similarity of the user/meal embeddings
    # We will simulate a score returned by the dot product
    for m in possible_meals:
        m["match_score"] = round(random.uniform(0.70, 0.99), 2)
        
    # Sort by the highest mock ML confidence score
    possible_meals.sort(key=lambda x: x["match_score"], reverse=True)
    
    return possible_meals[:2]
