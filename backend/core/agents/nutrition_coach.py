from pydantic import ValidationError
from antigravity import Orchestrator, Tool, Memory
import json
from api.schemas import StructuredNutritionResponse
from core.tools.macro_math import calculate_tdee_and_macros
from core.tools.mock_ml_clients import fetch_wearable_time_series, get_ncf_recommendations

def create_nutrition_agent():
    """
    Initializes the Antigravity Orchestrator with strictly bounded tools.
    """
    
    # 1. Define the deterministic and ML tools
    tools = [
        Tool(
            name="fetch_wearable_time_series",
            func=fetch_wearable_time_series,
            description="Fetches the user's fatigue index, recovery score, and suggested TDEE modifier from the LSTM model. Inputs: user_id, hrv, sleep_hours."
        ),
        Tool(
            name="calculate_tdee_and_macros",
            func=calculate_tdee_and_macros,
            description="MANDATORY TOOL: Returns exact protein, fat, carb requirements and target calories. Inputs: weight_kg, height_cm, age, gender, goal, active_cals, dietary_restrictions. YOU MUST NEVER DO MATH YOURSELF."
        ),
        Tool(
            name="get_ncf_recommendations",
            func=get_ncf_recommendations,
            description="MANDATORY TOOL: Returns ML-approved meals bridging user embeddings and target macros. Inputs: user_id, target_cals, tags."
        )
    ]
    
    # 2. System Architecture Restrictions for the Agent
    system_prompt = (
        "You are the reasoning layer for the Smart AI Nutrition Advisor. "
        "You act as a bridge between cold deterministic machine learning outputs and the user. "
        "STRICT RULES:\n"
        "1. You NEVER calculate nutrition facts yourself. You MUST use 'calculate_tdee_and_macros'.\n"
        "2. You NEVER invent meals. You MUST use 'get_ncf_recommendations'.\n"
        "3. You MUST call 'fetch_wearable_time_series' first to understand the user's fatigue.\n"
        "4. Combine the results of these 3 tools to write a short, 2-sentence 'rationale' explaining WHY the plan was built this way based on the wearable data.\n"
        "5. Keep the output explicitly to the JSON schema requested."
    )
    
    # 3. Create Orchestrator Object (assuming an OpenAI/GPT-4 or Gemini integration via core)
    orchestrator = Orchestrator(
        agent_persona="System Architect Nutritionist",
        model="gpt-4o",  # or gemini-1.5-pro in production
        tools=tools,
        system_prompt=system_prompt,
        output_schema=StructuredNutritionResponse
    )
    
    return orchestrator
