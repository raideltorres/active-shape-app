/**
 * Get a single nutrient value from recipe nutrition data (per serving).
 * @param {object} nutrition - Recipe nutrition object with nutrients array
 * @param {string} nutrientName - e.g. 'Calories', 'Protein', 'Fat'
 * @returns {string} Formatted amount or ''
 */
export function getNutrientFromNutritionData(nutrition, nutrientName) {
  if (nutrition?.nutrients && nutrientName) {
    const found = nutrition.nutrients.find((item) => item.name === nutrientName);
    if (found) return `${Math.floor(found.amount)}`;
  }
  return '';
}

/**
 * Get net carbs from nutrition (Net Carbohydrates or Carbs - Fiber).
 * @param {object} nutrition - Recipe nutrition object
 * @returns {string} Formatted amount or ''
 */
export function getNetCarbsFromNutritionData(nutrition) {
  if (!nutrition?.nutrients) return '';
  const netCarbs = nutrition.nutrients.find((item) => item.name === 'Net Carbohydrates');
  if (netCarbs) return `${Math.floor(netCarbs.amount)}`;
  const totalCarbs = nutrition.nutrients.find((item) => item.name === 'Carbohydrates');
  const fiber = nutrition.nutrients.find((item) => item.name === 'Fiber');
  if (totalCarbs) {
    const value = totalCarbs.amount - (fiber?.amount || 0);
    return `${Math.floor(value)}`;
  }
  return '';
}
