/**
 * Delivery fee calculator for Nigerian states.
 * Prices are in kobo (multiply naira by 100).
 *
 * Zone A (₦3,000) – Northern states close to base (Kaduna):
 *   Kaduna, Kano, Katsina, Abuja (FCT), Nasarawa, Plateau, Niger, Bauchi, Jigawa
 *
 * Zone B (₦5,000) – Middle-belt & other Northern states:
 *   Benue, Kogi, Kwara, Taraba, Adamawa, Gombe, Borno, Yobe, Zamfara, Sokoto, Kebbi
 *
 * Zone C (₦8,000) – Southern states:
 *   Lagos, Ogun, Oyo, Osun, Ondo, Ekiti, Edo, Delta, Bayelsa, Rivers,
 *   Akwa Ibom, Cross River, Abia, Imo, Anambra, Enugu, Ebonyi
 */

const ZONE_A_STATES = [
  'kaduna',
  'kano',
  'katsina',
  'abuja federal capital territory',
  'federal capital territory',
  'fct',
  'nasarawa',
  'plateau',
  'niger',
  'bauchi',
  'jigawa',
];

const ZONE_B_STATES = [
  'benue',
  'kogi',
  'kwara',
  'taraba',
  'adamawa',
  'gombe',
  'borno',
  'yobe',
  'zamfara',
  'sokoto',
  'kebbi',
];

const ZONE_C_STATES = [
  'lagos',
  'ogun',
  'oyo',
  'osun',
  'ondo',
  'ekiti',
  'edo',
  'delta',
  'bayelsa',
  'rivers',
  'akwa ibom',
  'cross river',
  'abia',
  'imo',
  'anambra',
  'enugu',
  'ebonyi',
];

// Fees in kobo
const ZONE_A_FEE = 300000; // ₦3,000
const ZONE_B_FEE = 500000; // ₦5,000
const ZONE_C_FEE = 800000; // ₦8,000
const DEFAULT_FEE = 500000; // ₦5,000 fallback

/**
 * Get the delivery fee (in kobo) based on the state name.
 * Handles variations like "Kaduna", "Kaduna State", "Federal Capital Territory", etc.
 */
export const getDeliveryFee = (state: string): number => {
  if (!state) return DEFAULT_FEE;

  const normalized = state
    .toLowerCase()
    .replace(/\s*state$/i, '')
    .trim();

  if (ZONE_A_STATES.some((s) => normalized.includes(s) || s.includes(normalized))) {
    return ZONE_A_FEE;
  }

  if (ZONE_B_STATES.some((s) => normalized.includes(s) || s.includes(normalized))) {
    return ZONE_B_FEE;
  }

  if (ZONE_C_STATES.some((s) => normalized.includes(s) || s.includes(normalized))) {
    return ZONE_C_FEE;
  }

  return DEFAULT_FEE;
};

/**
 * Get the delivery zone label for display purposes.
 */
export const getDeliveryZone = (state: string): string => {
  if (!state) return '';

  const normalized = state
    .toLowerCase()
    .replace(/\s*state$/i, '')
    .trim();

  if (ZONE_A_STATES.some((s) => normalized.includes(s) || s.includes(normalized))) {
    return 'Zone A (Northern - Near base)';
  }

  if (ZONE_B_STATES.some((s) => normalized.includes(s) || s.includes(normalized))) {
    return 'Zone B (Middle belt / Far North)';
  }

  if (ZONE_C_STATES.some((s) => normalized.includes(s) || s.includes(normalized))) {
    return 'Zone C (Southern)';
  }

  return 'Standard';
};
