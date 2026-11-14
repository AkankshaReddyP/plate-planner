/** Pure measurement conversions. Persist only centimeters and kilograms. */
export const CM_PER_INCH = 2.54;
export const KG_PER_POUND = 0.45359237;
export const roundTo = (n: number, places: number) => Number(n.toFixed(places));
export function imperialHeightToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * CM_PER_INCH;
}
export function cmToImperialHeight(cm: number): { feet: number; inches: number } {
  const totalInches = roundTo(cm / CM_PER_INCH, 1);
  const feet = Math.floor(totalInches / 12);
  return { feet, inches: roundTo(totalInches - feet * 12, 1) };
}
export const poundsToKg = (pounds: number): number => pounds * KG_PER_POUND;
export const kgToPounds = (kg: number): number => kg / KG_PER_POUND;
export function validHeightCm(cm: number): boolean {
  return Number.isFinite(cm) && cm >= 50 && cm <= 250;
}
export function validWeightKg(kg: number): boolean {
  return Number.isFinite(kg) && kg >= 20 && kg <= 400;
}
export function parseHeight(input: { unit: 'cm' | 'ft'; cm: string; feet: string; inches: string }): number | null {
  if (input.unit === 'cm') {
    if (input.cm.trim() === '') return null;
    const value = Number(input.cm);
    return validHeightCm(value) ? value : null;
  }
  if (input.feet.trim() === '' || input.inches.trim() === '') return null;
  const feet = Number(input.feet), inches = Number(input.inches);
  if (!Number.isInteger(feet) || feet < 0 || !Number.isFinite(inches) || inches < 0 || inches >= 12) return null;
  const cm = imperialHeightToCm(feet, inches);
  return validHeightCm(cm) ? cm : null;
}
export function parseWeight(input: { unit: 'kg' | 'lb'; value: string }): number | null {
  if (input.value.trim() === '') return null;
  const raw = Number(input.value);
  if (!Number.isFinite(raw)) return null;
  const kg = input.unit === 'lb' ? poundsToKg(raw) : raw;
  return validWeightKg(kg) ? kg : null;
}
