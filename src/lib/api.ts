import {
  generateCSAT,
  generateVolumeBudgetSE,
  generateVolumeBudgetDM,
  generateVolumeBudgetMapped,
  generateMainTemplate,
  generateSMMOMapping_SM,
  generateSMMOMapping_MO,
  generateVASSKU,
  generateEmployeeMaster,
} from '@/data/mock-data';

// ─── Generator Registry ──────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GENERATORS: Record<string, () => any[]> = {
  'csat': generateCSAT,
  'volume-budget_se-targets': generateVolumeBudgetSE,
  'volume-budget_dm-details': generateVolumeBudgetDM,
  'volume-budget_mapped-output': generateVolumeBudgetMapped,
  'volume-budget': generateVolumeBudgetSE,
  'main-template': generateMainTemplate,
  'sm-mo-mapping_sm': generateSMMOMapping_SM,
  'sm-mo-mapping_mo': generateSMMOMapping_MO,
  'sm-mo-mapping': generateSMMOMapping_SM,
  'vas-sku': generateVASSKU,
  'employee-master': generateEmployeeMaster,
};

function resolveKey(pageId: string, tab?: string): string {
  return tab ? `${pageId}_${tab}` : pageId;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DATA_CACHE: Record<string, any[]> = {};

// ─── Simulated API Calls ─────────────────────────────────────

/**
 * GET /api/data/:pageId?tab=...&month=...&year=...
 * Returns data for a specific page / tab / period. Simulates 300ms network delay.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchPageData(pageId: string, month: number, year: number, tab?: string): Promise<any[]> {
  const cacheKey = `${resolveKey(pageId, tab)}_${month}_${year}`;

  await delay(300);

  if (DATA_CACHE[cacheKey]) {
    return DATA_CACHE[cacheKey];
  }

  const generatorKey = resolveKey(pageId, tab);
  const generator = GENERATORS[generatorKey] || GENERATORS[pageId];
  if (!generator) {
    throw new Error(`No data generator found for "${generatorKey}"`);
  }

  const data = generator();
  DATA_CACHE[cacheKey] = data;
  return data;
}

/**
 * POST /api/data/:pageId  { tab, month, year, data }
 * Persists data for a specific page / tab / period. Simulates 500ms network delay.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function savePageData(pageId: string, month: number, year: number, data: any[], tab?: string): Promise<{ success: boolean; savedAt: string; rowCount: number }> {
  const cacheKey = `${resolveKey(pageId, tab)}_${month}_${year}`;

  await delay(500);

  DATA_CACHE[cacheKey] = [...data];

  return {
    success: true,
    savedAt: new Date().toISOString(),
    rowCount: data.length,
  };
}

// ─── Helpers ─────────────────────────────────────────────────
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
