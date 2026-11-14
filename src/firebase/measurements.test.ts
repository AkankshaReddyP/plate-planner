import { describe, expect, it } from 'vitest';
import { cmToImperialHeight, imperialHeightToCm, kgToPounds, poundsToKg, parseHeight, parseWeight, roundTo } from './measurements';

describe('height entry and conversions', () => {
  it('converts 5 ft 8 in to 172.72 cm', () => {
    expect(imperialHeightToCm(5, 8)).toBeCloseTo(172.72, 8);
    expect(parseHeight({unit:'ft', cm:'', feet:'5', inches:'8'})).toBeCloseTo(172.72, 8);
  });
  it('converts from centimeters to feet and inches', () => {
    expect(cmToImperialHeight(172.72)).toEqual({ feet:5, inches:8 });
    expect(cmToImperialHeight(182.88)).toEqual({ feet:6, inches:0 });
  });
  it('supports metric values and rejects invalid or missing imperial units', () => {
    expect(parseHeight({unit:'cm', cm:'170', feet:'', inches:''})).toBe(170);
    for (const [feet, inches] of [['', '8'], ['5', ''], ['5', '12'], ['-1', '0'], ['5.5', '3'], ['5', '-0.1']]) {
      expect(parseHeight({unit:'ft', cm:'', feet, inches})).toBeNull();
    }
    expect(parseHeight({unit:'cm', cm:'', feet:'5', inches:'8'})).toBeNull();
    expect(parseHeight({unit:'cm', cm:'300', feet:'', inches:''})).toBeNull();
  });
});
describe('weight entry and conversions', () => {
  it('converts pounds to kilograms and back', () => {
    expect(poundsToKg(220.462262)).toBeCloseTo(100, 5);
    expect(kgToPounds(100)).toBeCloseTo(220.462262, 5);
    expect(roundTo(parseWeight({unit:'lb', value:'154.324'})!, 2)).toBe(70);
    expect(parseWeight({unit:'kg', value:'70'})).toBe(70);
  });
  it('rejects empty or implausible measurements', () => {
    expect(parseWeight({unit:'lb', value:''})).toBeNull();
    expect(parseWeight({unit:'lb', value:'0'})).toBeNull();
    expect(parseWeight({unit:'kg', value:'900'})).toBeNull();
    expect(parseWeight({unit:'kg', value:'hello'})).toBeNull();
  });
});
