// ─── Types ────────────────────────────────────────────────────────────────────

export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Status = "Approved" | "Pending" | "Review" | "Blocked" | "Completed";
export type Team = "Alpha" | "Beta" | "Gamma" | "Delta" | "Epsilon";

export interface Invoice {
    index: number;
    id: string;
    company: string;
    initials: string;
    avatarColor: string;
    project: string;
    team: Team;
    priority: Priority;
    status: Status;
    budget: number;
    hours: number;
    start: Date;
    deadline: Date;
    pct: number;
    spark: number[];
    pinned?: boolean;
}

export interface Filters {
    id: string;
    company: string;
    project: string;
    team: string;
    status: string;
    priority: string;
    bmin: string;
    bmax: string;
    hmin: string;
    hmax: string;
    pmin: string;
    pmax: string;
    startAfter: string;
    deadlineBefore: string;
}

export const DEFAULT_FILTERS: Filters = {
    id: "", company: "", project: "",
    team: "", status: "Approved", priority: "",
    bmin: "50000", bmax: "500000",
    hmin: "", hmax: "", pmin: "", pmax: "",
    startAfter: "", deadlineBefore: "2026-03-31",
};

// ─── Raw data ─────────────────────────────────────────────────────────────────

const COMPANIES = ["NovaTech Solutions", "Apex Digital", "Clearfield Corp", "Meridian Group", "Synapse AI",
    "BluePeak Ltd", "Orion Systems", "CloudPath Inc", "Vertex Analytics", "Pinnacle Consulting",
    "DataStream Co", "Helix Technologies", "Quantum Leap Inc", "Atlas Enterprise", "Nexus Platforms"];
const PROJECTS = ["Cloud Migration", "ERP Integration", "Mobile App Redesign", "AI Dashboard", "Data Pipeline",
    "Payment Gateway", "CRM Overhaul", "DevOps Automation", "Analytics Platform", "Brand Refresh",
    "API Modernization", "Security Audit", "E-commerce Portal", "IoT Infrastructure", "ML Model Pipeline"];
const TEAMS: Team[] = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"];
const PRIORITIES: Priority[] = ["Critical", "High", "Medium", "Medium", "Low", "Low"];
const STATUSES: Status[] = ["Approved", "Approved", "Pending", "Pending", "Review", "Blocked", "Completed"];
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#f43f5e", "#14b8a6", "#e879f9",
    "#fb923c", "#22c55e", "#a78bfa", "#06b6d4", "#fbbf24", "#4ade80", "#60a5fa"];
const BUDGETS = [75000, 120000, 200000, 350000, 85000, 160000, 420000, 95000, 275000, 480000, 110000, 330000, 55000, 190000, 240000];
const HOURS = [320, 540, 890, 1200, 450, 780, 1560, 290, 985, 1340, 620, 1100, 180, 760, 830];
const PCTS = [95, 62, 34, 100, 18, 77, 42, 88, 55, 23, 100, 67, 11, 84, 49];
const SPARK_BASE = [12, 18, 8, 22, 15, 20, 10, 24, 6, 16, 19, 9, 21, 14, 17];

function seedDate(i: number, offsetMonths: number): Date {
    const base = 2025;
    const month = (i * 3 + offsetMonths) % 12;
    const day = ((i * 7) % 28) + 1;
    return new Date(base, month, day);
}

export const INVOICE_DATA: Invoice[] = Array.from({ length: 2400 }, (_, i) => {
    const company = COMPANIES[i % COMPANIES.length];
    const words = company.split(" ");
    const initials = words.slice(0, 2).map((w) => w[0]).join("");
    const spark = SPARK_BASE.slice(0, 8).map((v, j) =>
        Math.max(4, v + ((i + j) % 7) - 3)
    );
    return {
        index: i,
        id: `INV-${String(20241 + i).padStart(5, "0")}`,
        company,
        initials,
        avatarColor: COLORS[i % COLORS.length],
        project: PROJECTS[i % PROJECTS.length],
        team: TEAMS[i % TEAMS.length],
        priority: PRIORITIES[i % PRIORITIES.length],
        status: STATUSES[i % STATUSES.length],
        budget: BUDGETS[i % BUDGETS.length],
        hours: HOURS[i % HOURS.length],
        start: seedDate(i, 0),
        deadline: seedDate(i, 6),
        pct: PCTS[i % PCTS.length],
        spark,
        pinned: i === 3,
    };
});
