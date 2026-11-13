export type Nutrition = Readonly<{calories:number;protein:number;carbs:number;fibre:number}>;
export type Food = Readonly<{id:string;name:string;per100g:Nutrition}>;
export type Portion = Readonly<{foodId:string;grams:number}>;
export function calculateMeal(portions:readonly Portion[],catalog:readonly Food[]):Nutrition {
 const byId = new Map(catalog.map(food=>[food.id,food]));
 const result = {calories:0,protein:0,carbs:0,fibre:0};
 for(const {foodId,grams} of portions) {
  if(!Number.isFinite(grams)||grams<0) throw new Error('Invalid portion grams');
  const food=byId.get(foodId);
  if(!food) throw new Error('Unknown food ID');
  for(const key of ['calories','protein','carbs','fibre'] as const) {
   const value=food.per100g[key];
   if(!Number.isFinite(value)||value<0) throw new Error('Invalid food nutrient data');
   result[key]+=grams/100*value;
  }
 }
 return result;
}
