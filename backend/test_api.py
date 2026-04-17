import requests
import json

url = "http://localhost:8000/api/v1/recommend"

payload = {
    "user_profile": {
        "user_id": "U123",
        "weight_kg": 85.0,
        "height_cm": 180.0,
        "age": 30,
        "gender": "male",
        "goal": "fat_loss",
        "dietary_restrictions": ["dairy_free"]
    },
    "wearable_data": {
        "sleep_hours": 4.5,
        "hrv": 35,
        "active_cals": 400
    }
}

headers = {"Content-Type": "application/json"}

try:
    print("Sending mock payload to Orchestrator API...")
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    print("\n--- Success ---")
    print(json.dumps(response.json(), indent=2))
except requests.exceptions.RequestException as e:
    print("\n--- Error ---")
    print(f"Request failed: {e}")
    if e.response is not None:
        print(e.response.text)
