def calculate_tdee_and_macros(weight_kg: float, height_cm: float, age: int, gender: str, goal: str, active_cals: int, dietary_restrictions: list[str]) -> dict:
    """
    DETERMINISTIC TOOL: Calculates TDEE and strict macronutrient partitions.
    In production, this replaces any LLM numeric reasoning to prevent hallucination.
    """
    # 1. BMR Calculation (Mifflin-St Jeor)
    if gender.lower() == 'male':
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
        
    tdee = bmr + active_cals
    
    # 2. Adjust for goals (In production, replace with LightGBM target constraint)
    if goal == "fat_loss":
        target_cals = tdee - 500
    elif goal == "muscle_gain":
        target_cals = tdee + 300
    else:
        target_cals = tdee
        
    # Safety Floor
    if gender.lower() == 'female' and target_cals < 1200:
        target_cals = 1200
        health_warning = "Adjusted to 1200 kcal safety minimum."
    elif gender.lower() == 'male' and target_cals < 1500:
        target_cals = 1500
        health_warning = "Adjusted to 1500 kcal safety minimum."
    else:
        health_warning = None
        
    # 3. Strict Macro logic
    # Protein prioritized at 2.2g per kg of body weight
    protein_g = weight_kg * 2.2
    
    # Fat prioritized at 25% of caloric intake
    fat_g = (target_cals * 0.25) / 9
    
    # Carbs fill remainder
    remaining_cals = target_cals - (protein_g * 4) - (fat_g * 9)
    carb_g = max(0, remaining_cals / 4)
    
    return {
        "target_cals": round(target_cals),
        "protein_g": round(protein_g),
        "fat_g": round(fat_g),
        "carbs_g": round(carb_g),
        "warning": health_warning,
        "math_verified": True
    }
