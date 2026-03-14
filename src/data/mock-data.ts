import { v4 as uuidv4 } from 'uuid';

/* ─── CSAT ─────────────────────────────────────────────────── */
export function generateCSAT() {
  const storeCodes = ['A041','A092','A039','A004','A012','A020','A022','A023','A024','A042',
    'A044','A048','A052','A055','A060','A065','A070','A075','A080','A085',
    'A090','A095','A100','A105','A110','A115','A120','A125','A130','A135'];
  return storeCodes.map((code) => ({
    id: uuidv4(),
    'Store Code': code,
    CSAT: parseFloat((0.4 + Math.random() * 0.6).toFixed(4)),
  }));
}

/* ─── Volume Budget - SE Targets ───────────────────────────── */
const STORE_NAMES: Record<string, string> = {
  A476:'Madanapalle', A012:'Faridabad-Crown Mall', A020:'Delhi-Rohini', A022:'Ghazibad-Pacific Mall',
  A023:'Greater Noida', A024:'Ghazibad-Aditya Mall', A042:'Delhi-Saket', A044:'Delhi-Rajouri',
  A048:'Noida-Sector 18', A052:'Gurgaon-MG Road', A055:'Bengaluru-HSR', A060:'Bengaluru-MG',
  A065:'Hyderabad-Hitec', A070:'Chennai-Velachery', A075:'Pune-Phoenix', A080:'Mumbai-Andheri',
  A085:'Mumbai-Bandra', A090:'Kolkata-Salt Lake', A095:'Ahmedabad-SG Hwy', A100:'Jaipur-MI Road'
};
const FIRST_NAMES = ['Rahul','Priya','Amit','Sneha','Vikram','Pooja','Arjun','Neha','Karan','Anita','Sanjay','Raman','Mohd','Rana','Prakash','Santosh','Prashant'];
const LAST_NAMES = ['Sharma','Patel','Gupta','Singh','Kumar','Verma','Joshi','Mehta','Reddy','Nair','Paul','Naik'];
const PRIMARY_GROUPS = ['Communication','Home Appliances & Kitchen Appl','Computers Peripherals','Home Entertainment','Own Label','Accessories'];

function randomName() {
  return `${FIRST_NAMES[Math.floor(Math.random()*FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random()*LAST_NAMES.length)]}`;
}

export function generateVolumeBudgetSE() {
  const rows: ReturnType<typeof Object>[] = [];
  const codes = Object.keys(STORE_NAMES);
  for (let i = 0; i < 50; i++) {
    const code = codes[i % codes.length];
    rows.push({
      id: uuidv4(),
      'Store Code': code,
      'Store Name': STORE_NAMES[code],
      'Sales executive EMP ID': 30000 + Math.floor(Math.random() * 40000),
      'Sales executive Name': randomName(),
      'Primary Group': PRIMARY_GROUPS[Math.floor(Math.random() * PRIMARY_GROUPS.length)],
      'Air Conditioners': Math.floor(Math.random() * 20),
      'Washing Machines': Math.floor(Math.random() * 15),
      'Refrigerators': Math.floor(Math.random() * 15),
      'iPhones': Math.floor(Math.random() * 30),
      'Smart Phones (OS Based)': Math.floor(Math.random() * 50),
      'Macbook': Math.floor(Math.random() * 5),
      'Windows PC': Math.floor(Math.random() * 10),
      'TV LCD': Math.floor(Math.random() * 15),
    });
  }
  return rows;
}

/* ─── Volume Budget - DM Details ───────────────────────────── */
export function generateVolumeBudgetDM() {
  const rows: ReturnType<typeof Object>[] = [];
  const codes = Object.keys(STORE_NAMES);
  for (let i = 0; i < 40; i++) {
    const code = codes[i % codes.length];
    rows.push({
      id: uuidv4(),
      'Store Code': code,
      'Store Name': STORE_NAMES[code],
      Group: PRIMARY_GROUPS[Math.floor(Math.random() * PRIMARY_GROUPS.length)],
      'DM EMP ID': 10000 + Math.floor(Math.random() * 60000),
      'DM Name': randomName(),
    });
  }
  return rows;
}

/* ─── Main Template Transformed ─────────────────────────────── */
const INCENTIVE_TYPES = ['Group_Main','Group_OL','Group_Acc','Group_Services'];
const GROUP_NAMES_LIST = ['Kitchen Appliances','Home Appliances','Entertainment','Computers Peripherals','Communication','Own Label','Accessories'];
const CATEGORIES_LIST = ['Refrigerator Direct Cool <300L','Washing Machine Front Load','Air Conditioner Split','iPhone 15 series','Windows Laptop','TV 55 inch','Mixer Grinder'];
const JOB_ROLES = ['SE','DM','SM'];

export function generateMainTemplate() {
  const rows: ReturnType<typeof Object>[] = [];
  for (let i = 0; i < 60; i++) {
    rows.push({
      id: uuidv4(),
      IncentiveType: INCENTIVE_TYPES[Math.floor(Math.random() * INCENTIVE_TYPES.length)],
      GroupName: GROUP_NAMES_LIST[Math.floor(Math.random() * GROUP_NAMES_LIST.length)],
      'CategoryDescription_IncentiveBucket': CATEGORIES_LIST[Math.floor(Math.random() * CATEGORIES_LIST.length)],
      'Inclusion_CategoryName': 'ALL',
      'Exclusion_CategoryName': 'NA',
      'Inclusion_ClassName': CATEGORIES_LIST[Math.floor(Math.random() * CATEGORIES_LIST.length)],
      'Exclusion_ClassName': 'NA',
      'Inclusion_BrandName': 'ALL',
      'Exclusion_BrandName': ['NA','Liebherr','Whirlpool'][Math.floor(Math.random() * 3)],
      JobRole: JOB_ROLES[Math.floor(Math.random() * JOB_ROLES.length)],
      AchieveAmountPerQuantity: Math.floor(5 + Math.random() * 95),
    });
  }
  return rows;
}

/* ─── SM MO Mapping ─────────────────────────────────────────── */
export function generateSMMOMapping_SM() {
  const rows: ReturnType<typeof Object>[] = [];
  const codes = Object.keys(STORE_NAMES);
  codes.forEach((code) => {
    rows.push({
      id: uuidv4(),
      'Store Key': code,
      'Store Name': STORE_NAMES[code],
      'SM1 EC': 1000 + Math.floor(Math.random() * 65000),
      'SM1 Name': randomName(),
    });
  });
  return rows;
}

export function generateSMMOMapping_MO() {
  const rows: ReturnType<typeof Object>[] = [];
  const codes = Object.keys(STORE_NAMES).slice(0, 12);
  codes.forEach((code) => {
    rows.push({
      id: uuidv4(),
      'Store Key': code,
      'Store Name': STORE_NAMES[code],
      'MO EC': 20000 + Math.floor(Math.random() * 45000),
      'MO Name': randomName(),
    });
  });
  return rows;
}

/* ─── VAS SKU ───────────────────────────────────────────────── */
const SERVICE_CLASSIFICATIONS = ['InWarranty','OutOfWarranty','AMC'];
const SERVICE_PRODUCTS = ['OSG EW','ZipCare Maintain','ZipCare Protect','1-Year-EW','2-Year-EW'];
const VAS_CATEGORIES = ['Phones Fixed','TV','Laptop','AC','Refrigerator','WM','Kitchen App'];
const VAS_YEARS = ['1 Year','2 Year','3 Year'];

export function generateVASSKU() {
  const rows: ReturnType<typeof Object>[] = [];
  for (let i = 0; i < 50; i++) {
    rows.push({
      id: uuidv4(),
      SKU: 190000 + Math.floor(Math.random() * 10000),
      Service_Classification: SERVICE_CLASSIFICATIONS[Math.floor(Math.random() * SERVICE_CLASSIFICATIONS.length)],
      Service_Product_Classification: SERVICE_PRODUCTS[Math.floor(Math.random() * SERVICE_PRODUCTS.length)],
      Eligible_For_Incentive_Payout: Math.random() > 0.3 ? 'Y' : 'N',
      'Special Addition': Math.random() > 0.8 ? 'Y' : 'N',
      Categ: VAS_CATEGORIES[Math.floor(Math.random() * VAS_CATEGORIES.length)],
      Year: VAS_YEARS[Math.floor(Math.random() * VAS_YEARS.length)],
      Brand: `${SERVICE_PRODUCTS[Math.floor(Math.random() * SERVICE_PRODUCTS.length)]} Desc`,
    });
  }
  return rows;
}

/* ─── Volume Budget Mapped (Output) ─────────────────────────── */
export function generateVolumeBudgetMapped() {
  const rows: ReturnType<typeof Object>[] = [];
  const codes = Object.keys(STORE_NAMES);
  for (let i = 0; i < 60; i++) {
    const code = codes[i % codes.length];
    const group = PRIMARY_GROUPS[Math.floor(Math.random() * PRIMARY_GROUPS.length)];
    rows.push({
      id: uuidv4(),
      'Store Code': code,
      'Store Name': STORE_NAMES[code],
      'Sales executive EMP ID': 30000 + Math.floor(Math.random() * 40000),
      'Sales executive Name': randomName(),
      'Primary Group': group,
      'DM EMP ID': 10000 + Math.floor(Math.random() * 60000),
      'DM Name': randomName(),
      'SM Employee ID': 1000 + Math.floor(Math.random() * 65000),
      'SM Employee Name': randomName(),
      'Primary Flag': Math.random() > 0.5 ? 'Y' : 'N',
      GroupDesc: group,
      Category: ['Air Conditioners','Washing Machines','Refrigerators','TV LCD','iPhones','Smart Phones','Macbook','Windows PC'][Math.floor(Math.random() * 8)],
      Brand: ['All','Samsung','LG','Whirlpool','Sony','Apple','HP','Dell'][Math.floor(Math.random() * 8)],
      'Target Qty': Math.floor(Math.random() * 50),
      'Error Msg': Math.random() > 0.7 ? 'SM Name & EMP Missing' : '',
    });
  }
  return rows;
}

/* ─── Employee Master ──────────────────────────────────────── */
const DESIGNATIONS = ['Store Manager','Assistant Manager','Sales Executive','Cashier','Department Manager','Visual Merchandiser','KYBM'];

export function generateEmployeeMaster() {
  const rows: ReturnType<typeof Object>[] = [];
  const codes = Object.keys(STORE_NAMES);
  for (let i = 0; i < 50; i++) {
    const code = codes[i % codes.length];
    rows.push({
      id: uuidv4(),
      'EmpId': 10000 + Math.floor(Math.random() * 60000),
      'EmpName': randomName(),
      'Store Code': code,
      'Store Name': STORE_NAMES[code],
      Designation: DESIGNATIONS[Math.floor(Math.random() * DESIGNATIONS.length)],
      'Joining Date': `${2018 + Math.floor(Math.random() * 8)}-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}`,
    });
  }
  return rows;
}

/* ─── Table definitions ────────────────────────────────────── */
export type DataPageId = 'csat' | 'volume-budget' | 'main-template' | 'sm-mo-mapping' | 'vas-sku' | 'employee-master';

export const DATA_PAGE_LABELS: Record<DataPageId, string> = {
  'csat': 'CSAT',
  'volume-budget': 'Volume Budget',
  'main-template': 'Main Template',
  'sm-mo-mapping': 'SM MO Mapping',
  'vas-sku': 'VAS SKU',
  'employee-master': 'Employee Master',
};

/* ─── Upload templates ─────────────────────────────────────── */
export const UPLOAD_TEMPLATES = [
  { name: 'csat', label: 'CSAT', expectedColumns: ['Store Code', 'CSAT'] },
  { name: 'volume_budget', label: 'Volume Budget', expectedColumns: ['Store Code', 'Store Name', 'Sales executive EMP ID', 'Sales executive Name', 'Primary Group'] },
  { name: 'main_template', label: 'Main Template', expectedColumns: ['IncentiveType', 'GroupName', 'CategoryDescription_IncentiveBucket', 'JobRole', 'AchieveAmountPerQuantity'] },
  { name: 'vas_sku', label: 'VAS SKU', expectedColumns: ['SKU', 'Service_Classification', 'Service_Product_Classification', 'Categ'] },
  { name: 'sm_mo_mapping', label: 'SM MO Mapping', expectedColumns: ['Store Key', 'Store Name', 'SM1 EC', 'SM1 Name'] },
  { name: 'employee_master', label: 'Employee Master', expectedColumns: ['EmpId', 'EmpName', 'Store Code', 'Designation'] },

  { name: 'persona', label: 'Persona', expectedColumns: ['StoreCode', 'EmpId', 'PersonaType', 'Score'] },
];

/* ─── Months ───────────────────────────────────────────────── */
export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export function getYears() {
  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => current - 2 + i);
}
