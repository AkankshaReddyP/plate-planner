/**
 * Plate Planner data contracts, v1.
 * Pure interfaces only: no Firebase imports, no runtime authorization.
 * Monetary/food measurements use explicit units; timestamps are ISO-8601 UTC strings.
 */
export type ISODate = string; // YYYY-MM-DD in member's local timezone
export type ISOInstant = string; // e.g. 2026-11-13T20:00:00.000Z
export type FamilyRole = 'owner' | 'helper' | 'viewer';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type MealPlanStatus = 'pending' | 'logged' | 'skipped';
export type ApprovalStatus = 'draft' | 'clinician_reviewed';
export type FoodState = 'raw' | 'cooked' | 'ready_to_eat';
export type NutrientKey = 'caloriesKcal' | 'proteinG' | 'carbohydrateG' | 'fibreG' | 'fatG';
export type Nutrients = Readonly<Record<NutrientKey, number>>;

export interface Family {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly displayName: string;
  readonly createdAt: ISOInstant;
  readonly createdBy: string;
}

export interface FamilyMember {
  readonly uid: string;
  readonly role: FamilyRole;
  readonly status: 'invited' | 'active' | 'revoked';
  readonly addedAt: ISOInstant;
  readonly addedBy: string;
}
export interface Profile {
  readonly id: string;
  readonly userUid: string;
  readonly displayName: string;
  readonly timezone: string; // IANA, e.g. Asia/Kolkata
  readonly heightCm?: number;
  readonly birthYear?: number;
  readonly conditions?: readonly string[]; // opt-in, no diagnosis inferred
  readonly updatedAt: ISOInstant;
  readonly updatedBy: string;
}
export interface TargetVersion {
  readonly id: string;
  readonly profileId: string;
  readonly effectiveFrom: ISODate;
  readonly effectiveTo?: ISODate;
  readonly perDay: Partial<Nutrients>;
  readonly perMeal?: Partial<Record<MealType, Partial<Nutrients>>>;
  readonly approvalStatus: ApprovalStatus;
  readonly source: 'user_entered' | 'clinician_provided';
  readonly clinicianReference?: string; // reference only; do not imply verified physician identity
  readonly recordedBy: string;
  readonly createdAt: ISOInstant;
  readonly version: number;
}
export interface FoodReference {
  readonly id: string;
  readonly name: string;
  readonly state: FoodState;
  readonly nutrientsPer100g: Nutrients;
  readonly catalogVersion: string;
  readonly sourceName: string;
  readonly sourceReference?: string;
  readonly verified: boolean;
}

// Canonical Firestore reference document at foodCatalog/{foodId}.
// Historical meal items use FoodReference snapshots instead of live lookups.
export interface CatalogFood extends FoodReference {
  readonly category: 'protein' | 'carbohydrate' | 'vegetable' | 'fruit' | 'dairy' | 'fat' | 'other';
  readonly nameTe?: string;
  readonly servingUnit: 'g';
  readonly typicalServingG?: number;
  readonly version: number;
  readonly isActive: boolean;
  readonly updatedAt: ISOInstant;
  readonly updatedBy: string;
}

export interface MealItem {
  readonly food: FoodReference; // immutable snapshot; food ID alone is not sufficient
  readonly plannedGrams: number;
}
export interface MealPlan {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly familyId: string;
  readonly profileId: string;
  readonly localDate: ISODate;
  readonly mealType: MealType;
  readonly timezone: string;
  readonly items: readonly MealItem[];
  readonly plannedTotals: Nutrients;
  readonly targetVersionId?: string;
  readonly nutritionEngineVersion: string;
  readonly status: MealPlanStatus;
  readonly createdBy: string;
  readonly createdAt: ISOInstant;
  readonly updatedAt: ISOInstant;
  readonly revision: number;
}
export interface ConsumptionItem {
  readonly foodId: string;
  readonly actualGrams: number;
}
export interface MealLog {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly familyId: string;
  readonly mealPlanId: string;
  readonly profileId: string;
  readonly localDate: ISODate;
  readonly consumption: readonly ConsumptionItem[];
  readonly consumedTotals: Nutrients;
  readonly nutritionEngineVersion: string;
  readonly createdBy: string;
  readonly loggedAt: ISOInstant;
  readonly correctedFromLogId?: string;
  readonly note?: string;
}
export interface Measurement {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly familyId: string;
  readonly profileId: string;
  readonly type: 'weight' | 'glucose';
  readonly value: number;
  readonly unit: 'kg' | 'mg/dL' | 'mmol/L';
  readonly measuredAt: ISOInstant;
  readonly recordedBy: string;
  readonly source: 'manual';
  readonly note?: string;
}
