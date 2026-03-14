// Master lists for autocomplete and reference pages

export const STORES = [
  { code: 'A001', name: 'Croma Mumbai LG', city: 'Mumbai', region: 'West' },
  { code: 'A002', name: 'Croma Delhi Select City', city: 'Delhi', region: 'North' },
  { code: 'A105', name: 'Croma Bangalore Indiranagar', city: 'Bangalore', region: 'South' },
  { code: 'B202', name: 'Croma Pune Phoenix', city: 'Pune', region: 'West' },
  { code: 'C301', name: 'Croma Hyderabad Gachibowli', city: 'Hyderabad', region: 'South' },
  { code: 'D401', name: 'Croma Kolkata Salt Lake', city: 'Kolkata', region: 'East' },
  { code: 'E501', name: 'Croma Ahmedabad Alpha', city: 'Ahmedabad', region: 'West' },
  { code: 'F601', name: 'Croma Chennai VR Mall', city: 'Chennai', region: 'South' },
];

export const GROUPS = [
  { name: 'Home Appliances', categories: ['Washing Machines', 'Refrigerators', 'Air Conditioners', 'Microwaves'] },
  { name: 'Smart Phones', categories: ['iPhones', 'Android Phones', 'Gaming Phones'] },
  { name: 'Computing', categories: ['Laptops', 'Desktops', 'Monitors', 'Peripherals'] },
  { name: 'Entertainment', categories: ['TV LCD', 'Audio Systems', 'Gaming Consoles'] },
];

export const BRANDS = ['Apple', 'Samsung', 'LG', 'Sony', 'Dell', 'HP', 'Whirlpool', 'Bosch', 'OnePlus', 'Google'];

export const CLASSES = ['Premium', 'Economy', 'Flagship', 'Budget', 'Mid-range'];

export const JOB_ROLES = ['Store Manager', 'Dept Manager', 'Sales Executive', 'Customer Service', 'Cashier'];

export const EMPLOYEES = [
  { id: 'EMP001', name: 'Amit Sharma', role: 'Store Manager', store: 'A001' },
  { id: 'EMP002', name: 'Priya Patel', role: 'Dept Manager', store: 'A001' },
  { id: 'EMP003', name: 'Rahul Verma', role: 'Sales Executive', store: 'A002' },
  { id: 'EMP004', name: 'Sneha Reddy', role: 'Store Manager', store: 'A105' },
  { id: 'EMP005', name: 'Vikram Singh', role: 'Sales Executive', store: 'B202' },
];

export const INCENTIVE_TYPES = ['Volume Based', 'Revenue Based', 'Product Specific', 'Fixed Component'];
