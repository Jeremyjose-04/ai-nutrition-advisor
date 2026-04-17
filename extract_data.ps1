$csvDir = "c:\Users\josej\OneDrive\Desktop\ai nutrition advisor\nutritiondata_extracted\FINAL FOOD DATASET"
$allData = @()
for($i=1; $i -le 5; $i++) {
  $path = Join-Path $csvDir "FOOD-DATA-GROUP$i.csv"
  $csv = Import-Csv $path
  $allData += $csv
}
Write-Host "Total: $($allData.Count)"

# Output as JSON-like format for parsing
$output = @()
foreach($row in $allData) {
  $name = $row.food -replace "'", "\'"
  $cal = $row.'Caloric Value'
  $fat = $row.Fat
  $satFat = $row.'Saturated Fats'
  $protein = $row.Protein
  $carbs = $row.Carbohydrates
  $sugars = $row.Sugars
  $fiber = $row.'Dietary Fiber'
  $chol = $row.Cholesterol
  $sodium = $row.Sodium
  $water = $row.Water
  $vitA = $row.'Vitamin A'
  $vitB12 = $row.'Vitamin B12'
  $vitC = $row.'Vitamin C'
  $vitD = $row.'Vitamin D'
  $vitE = $row.'Vitamin E'
  $vitK = $row.'Vitamin K'
  $calcium = $row.Calcium
  $iron = $row.Iron
  $magnesium = $row.Magnesium
  $potassium = $row.Potassium
  $zinc = $row.Zinc
  $nd = $row.'Nutrition Density'
  $output += "$name|$cal|$fat|$satFat|$protein|$carbs|$sugars|$fiber|$chol|$sodium|$water|$vitA|$vitB12|$vitC|$vitD|$vitE|$vitK|$calcium|$iron|$magnesium|$potassium|$zinc|$nd"
}
$output | Out-File -FilePath "c:\Users\josej\OneDrive\Desktop\ai nutrition advisor\nutrition_raw.txt" -Encoding UTF8
Write-Host "Done! Wrote $($output.Count) lines"
