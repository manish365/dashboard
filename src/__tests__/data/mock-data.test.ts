import { describe, it, expect } from 'vitest';
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
  MONTHS,
  getYears,
  DATA_PAGE_LABELS,
  UPLOAD_TEMPLATES,
} from '@/data/mock-data';

describe('Mock Data Generators', () => {
  it('generateCSAT returns array with Store Code and CSAT', () => {
    const data = generateCSAT();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('Store Code');
    expect(data[0]).toHaveProperty('CSAT');
    expect(data[0].CSAT).toBeGreaterThanOrEqual(0.4);
    expect(data[0].CSAT).toBeLessThanOrEqual(1);
  });

  it('generateVolumeBudgetSE returns 50 rows with product columns', () => {
    const data = generateVolumeBudgetSE();
    expect(data.length).toBe(50);
    expect(data[0]).toHaveProperty('Air Conditioners');
    expect(data[0]).toHaveProperty('Washing Machines');
    expect(data[0]).toHaveProperty('Refrigerators');
    expect(data[0]).toHaveProperty('iPhones');
    expect(data[0]).toHaveProperty('Smart Phones (OS Based)');
    expect(data[0]).toHaveProperty('Macbook');
    expect(data[0]).toHaveProperty('Windows PC');
    expect(data[0]).toHaveProperty('TV LCD');
    expect(data[0]).toHaveProperty('Sales executive EMP ID');
    expect(data[0]).toHaveProperty('Sales executive Name');
    expect(data[0]).toHaveProperty('Primary Group');
  });

  it('generateVolumeBudgetDM returns 40 rows', () => {
    const data = generateVolumeBudgetDM();
    expect(data.length).toBe(40);
    expect(data[0]).toHaveProperty('DM EMP ID');
    expect(data[0]).toHaveProperty('DM Name');
    expect(data[0]).toHaveProperty('Group');
  });

  it('generateVolumeBudgetMapped returns 60 rows with SM/DM fields', () => {
    const data = generateVolumeBudgetMapped();
    expect(data.length).toBe(60);
    expect(data[0]).toHaveProperty('SM Employee ID');
    expect(data[0]).toHaveProperty('SM Employee Name');
    expect(data[0]).toHaveProperty('Primary Flag');
    expect(data[0]).toHaveProperty('Target Qty');
    expect(data[0]).toHaveProperty('Error Msg');
  });

  it('generateMainTemplate returns 60 rows with incentive fields', () => {
    const data = generateMainTemplate();
    expect(data.length).toBe(60);
    expect(data[0]).toHaveProperty('IncentiveType');
    expect(data[0]).toHaveProperty('GroupName');
    expect(data[0]).toHaveProperty('JobRole');
    expect(data[0]).toHaveProperty('AchieveAmountPerQuantity');
  });

  it('generateSMMOMapping_SM returns rows with SM1 fields', () => {
    const data = generateSMMOMapping_SM();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('SM1 EC');
    expect(data[0]).toHaveProperty('SM1 Name');
    expect(data[0]).toHaveProperty('Store Key');
  });

  it('generateSMMOMapping_MO returns rows with MO fields', () => {
    const data = generateSMMOMapping_MO();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('MO EC');
    expect(data[0]).toHaveProperty('MO Name');
  });

  it('generateVASSKU returns 50 rows with service fields', () => {
    const data = generateVASSKU();
    expect(data.length).toBe(50);
    expect(data[0]).toHaveProperty('SKU');
    expect(data[0]).toHaveProperty('Service_Classification');
    expect(data[0]).toHaveProperty('Service_Product_Classification');
    expect(data[0]).toHaveProperty('Eligible_For_Incentive_Payout');
    expect(data[0]).toHaveProperty('Special Addition');
    expect(data[0]).toHaveProperty('Categ');
    expect(data[0]).toHaveProperty('Year');
  });

  it('generateEmployeeMaster returns 50 rows with employee fields', () => {
    const data = generateEmployeeMaster();
    expect(data.length).toBe(50);
    expect(data[0]).toHaveProperty('EmpId');
    expect(data[0]).toHaveProperty('EmpName');
    expect(data[0]).toHaveProperty('Designation');
    expect(data[0]).toHaveProperty('Joining Date');
  });
});

describe('MONTHS and getYears', () => {
  it('MONTHS has 12 entries', () => {
    expect(MONTHS.length).toBe(12);
    expect(MONTHS[0]).toEqual({ value: 1, label: 'January' });
    expect(MONTHS[11]).toEqual({ value: 12, label: 'December' });
  });

  it('getYears returns 5 years centered around current', () => {
    const years = getYears();
    expect(years.length).toBe(5);
    const current = new Date().getFullYear();
    expect(years).toContain(current);
    expect(years).toContain(current - 2);
    expect(years).toContain(current + 2);
  });
});

describe('DATA_PAGE_LABELS', () => {
  it('has labels for all page IDs', () => {
    expect(DATA_PAGE_LABELS['csat']).toBe('CSAT');
    expect(DATA_PAGE_LABELS['volume-budget']).toBe('Volume Budget');
    expect(DATA_PAGE_LABELS['main-template']).toBe('Main Template');
    expect(DATA_PAGE_LABELS['sm-mo-mapping']).toBe('SM MO Mapping');
    expect(DATA_PAGE_LABELS['vas-sku']).toBe('VAS SKU');
    expect(DATA_PAGE_LABELS['employee-master']).toBe('Employee Master');
  });
});

describe('UPLOAD_TEMPLATES', () => {
  it('has templates with expected fields', () => {
    expect(UPLOAD_TEMPLATES.length).toBeGreaterThan(0);
    UPLOAD_TEMPLATES.forEach((t) => {
      expect(t).toHaveProperty('name');
      expect(t).toHaveProperty('label');
      expect(t).toHaveProperty('expectedColumns');
      expect(Array.isArray(t.expectedColumns)).toBe(true);
    });
  });

  it('has a CSAT template', () => {
    const csat = UPLOAD_TEMPLATES.find((t) => t.name === 'csat');
    expect(csat).toBeDefined();
    expect(csat!.expectedColumns).toContain('Store Code');
  });
});
