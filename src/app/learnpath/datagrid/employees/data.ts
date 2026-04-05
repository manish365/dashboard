// ─── Employee Grid Types & Data ───────────────────────────────────────────────

export type Department = "Engineering" | "Design" | "Marketing" | "Sales" | "Finance" | "HR" | "Operations" | "Legal";
export type EmpStatus = "Active" | "On Leave" | "Probation" | "Terminated" | "Contract";
export type Perf = "Exceeds" | "Meets" | "Below" | "N/A";
export type Location = "New York" | "London" | "Singapore" | "Berlin" | "Sydney" | "Toronto" | "Bangalore" | "Dubai";

export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarColor: string;
    initials: string;
    department: Department;
    role: string;
    location: Location;
    salary: number;
    startDate: Date;
    lastReview: Date;
    performance: Perf;
    status: EmpStatus;
    projects: number;
    satisfaction: number; // 1-10
    overtimeHrs: number;
    spark: number[];
    manager: string;
}

export interface EmpFilters {
    search: string;
    department: string;
    status: string;
    performance: string;
    location: string;
    salMin: string;
    salMax: string;
    projMin: string;
    projMax: string;
    startAfter: string;
}
export const EMP_DEFAULT_FILTERS: EmpFilters = {
    search: "", department: "", status: "Active", performance: "",
    location: "", salMin: "", salMax: "", projMin: "", projMax: "", startAfter: "",
};

// ─── Seed data ────────────────────────────────────────────────────────────────
const FIRST = ["Alex", "Blake", "Charlie", "Dana", "Evan", "Fiona", "George", "Hana", "Ivan", "Julia", "Kai", "Luna", "Marcus", "Nina", "Oscar", "Priya", "Quinn", "Ravi", "Sara", "Tyler", "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zoe", "Aiden", "Bella", "Caden", "Diana"];
const LAST = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Anderson", "Taylor", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Lee", "Walker", "Hall", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Adams", "Baker"];
const DEPTS: Department[] = ["Engineering", "Design", "Marketing", "Sales", "Finance", "HR", "Operations", "Legal"];
const ROLES: Record<Department, string[]> = {
    Engineering: ["Frontend Dev", "Backend Dev", "DevOps Eng", "QA Engineer", "Tech Lead", "Architect"],
    Design: ["UI Designer", "UX Researcher", "Brand Designer", "Motion Designer", "Design Lead"],
    Marketing: ["Content Writer", "SEO Specialist", "Growth Hacker", "Brand Manager", "Campaigns Lead"],
    Sales: ["AE", "SDR", "Sales Manager", "Enterprise AE", "VP Sales"],
    Finance: ["Analyst", "Controller", "CFO Staff", "Accountant", "Finance Manager"],
    HR: ["Recruiter", "HR Business Partner", "Comp & Benefits", "L&D Specialist", "HRBP Lead"],
    Operations: ["Ops Analyst", "Process Engineer", "Supply Chain", "Logistics Manager", "COO Staff"],
    Legal: ["Paralegal", "Contract Lawyer", "Compliance", "Legal Counsel", "General Counsel"],
};
const LOCS: Location[] = ["New York", "London", "Singapore", "Berlin", "Sydney", "Toronto", "Bangalore", "Dubai"];
const PERFS: Perf[] = ["Exceeds", "Meets", "Meets", "Below", "N/A"];
const STATUSES: EmpStatus[] = ["Active", "Active", "Active", "On Leave", "Probation", "Contract", "Terminated"];
const MANAGERS = ["Sarah Chen", "Mike Rodriguez", "Anna Kovacs", "James Park", "Lisa Turner", "David Okafor", "Rachel Singh", "Tom Walker"];
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#f43f5e", "#14b8a6", "#e879f9", "#fb923c", "#22c55e", "#a78bfa", "#06b6d4", "#fbbf24"];
const SAL_BASE: Record<Department, number> = { Engineering: 110000, Design: 90000, Marketing: 75000, Sales: 85000, Finance: 95000, HR: 70000, Operations: 80000, Legal: 100000 };
const SPARK_BASE = [8, 14, 11, 18, 9, 16, 12, 20, 7, 15];

export const EMP_DATA: Employee[] = Array.from({ length: 2400 }, (_, i) => {
    const first = FIRST[i % FIRST.length];
    const last = LAST[i % LAST.length];
    const dept = DEPTS[i % DEPTS.length];
    const roles = ROLES[dept];
    const role = roles[i % roles.length];
    const loc = LOCS[i % LOCS.length];
    const perf = PERFS[i % PERFS.length];
    const status = STATUSES[i % STATUSES.length];
    const salVariance = ((i * 7919) % 40000) - 20000;
    const salary = SAL_BASE[dept] + salVariance;
    const startYear = 2018 + (i % 7);
    const startMonth = i % 12;
    const startDay = (i % 28) + 1;
    const startDate = new Date(startYear, startMonth, startDay);
    const reviewDate = new Date(2025, (startMonth + 6) % 12, 15);
    const projects = 1 + (i % 8);
    const satisfaction = 4 + (i % 7);
    const overtimeHrs = (i * 3) % 40;
    const spark = SPARK_BASE.map((v, j) => Math.max(3, v + ((i + j * 3) % 9) - 4));
    const manager = MANAGERS[i % MANAGERS.length];
    return {
        id: `EMP-${String(10001 + i).padStart(5, "0")}`,
        firstName: first,
        lastName: last,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@corp.io`,
        avatarColor: COLORS[i % COLORS.length],
        initials: first[0] + last[0],
        department: dept,
        role,
        location: loc,
        salary,
        startDate,
        lastReview: reviewDate,
        performance: perf,
        status,
        projects,
        satisfaction,
        overtimeHrs,
        spark,
        manager,
    };
});
