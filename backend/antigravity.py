class Tool:
    def __init__(self, name, func, description=""):
        self.name = name
        self.func = func
        self.description = description

class Memory:
    pass

class Orchestrator:
    def __init__(self, agent_persona="", model="", tools=None, system_prompt="", output_schema=None):
        self.tools = tools or []
        self.output_schema = output_schema

    def run(self, prompt=""):
        # Return a matched schema mock response
        return {
            "user_id": "usr_mock_123",
            "rationale": "Given your high HRV and solid sleep score, your nervous system is primed for higher volume today. I've programmed a slight calorie surplus.",
            "daily_macros": {
                "protein": 180.0,
                "carbs": 250.0,
                "fat": 75.0
            },
            "recommended_meals": [
                {
                    "meal_id": "m_1",
                    "name": "Grilled Chicken and Quinoa",
                    "macros": {"protein": 50.0, "carbs": 60.0, "fat": 15.0},
                    "match_score": 0.94
                }
            ],
            "health_warnings": []
        }
