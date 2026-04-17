import csv
import json

keywords = {
    1: ["acai", "smoothie bowl", "berry bowl"],
    2: ["salmon", "quinoa"],
    3: ["buddha bowl", "chicken bowl", "chicken and rice"],
    4: ["yogurt parfait", "parfait", "yogurt"],
    5: ["avocado toast", "avocado sandwich"],
    6: ["turkey meatball", "meatball pasta"],
    7: ["steak bowl", "steak", "keto"],
    8: ["tropical smoothie", "smoothie bowl", "mango smoothie"],
    9: ["mediterranean wrap", "chicken wrap", "hummus wrap"],
    10: ["protein shake", "protein smoothie", "whey"]
}

matches = {k: None for k in keywords.keys()}

def find_matches(filepath, name_col, ing_col, instr_col):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                recipe_name = row.get(name_col, '').lower()
                for k, kws in keywords.items():
                    if matches[k] is None:
                        for kw in kws:
                            if kw in recipe_name:
                                matches[k] = {
                                    'name': row.get(name_col, ''),
                                    'ingredients': row.get(ing_col, ''),
                                    'instructions': row.get(instr_col, '')
                                }
                                break
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

find_matches('recipe/recipes.csv', 'recipe_name', 'ingredients', 'directions')
find_matches('food.csv', 'RecipeName', 'Ingredients', 'Instructions')

with open('matched_recipes.json', 'w', encoding='utf-8') as f:
    json.dump(matches, f, indent=2)

print("Done writing to matched_recipes.json")
