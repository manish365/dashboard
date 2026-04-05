'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DynamicRenderer from '@/components/renderer/dynamic-renderer';
import { PageSchema } from '@/lib/builder/types';
import { useToast } from '@/providers/toast-context';
import { ArrowLeft, Share2, Download } from 'lucide-react';
import Link from 'next/link';

// Mock schema storage (In a real app, this would be an API call)
const MOCK_SCHEMAS: Record<string, any> = {
  'sales-dashboard': {
    "id": "sales-dashboard-123",
    "pageName": "Sales Analysis Dashboard",
    "slug": "sales-dashboard",
    "layout": "grid",
    "columns": 12,
    "components": [
      {
        "id": "kpi-1",
        "type": "KpiCard",
        "props": { "title": "Gross Revenue", "value": "$1.2M", "trend": 14, "color": "emerald" },
        "layout": { "w": 3 }
      },
      {
        "id": "kpi-2",
        "type": "KpiCard",
        "props": { "title": "Active Stores", "value": "48", "trend": -2, "color": "blue" },
        "layout": { "w": 3 }
      },
      {
        "id": "kpi-3",
        "type": "KpiCard",
        "props": { "title": "Avg Basket Value", "value": "$840", "trend": 5, "color": "purple" },
        "layout": { "w": 3 }
      },
      {
        "id": "kpi-4",
        "type": "KpiCard",
        "props": { "title": "Customer CSAT", "value": "4.8/5", "trend": 0.5, "color": "amber" },
        "layout": { "w": 3 }
      },
      {
        "id": "info-1",
        "type": "InfoTile",
        "props": {
          "label": "Q1 Performance Insight",
          "description": "Sales have exceeded targets by 15% due to the new loyalty program rollout."
        },
        "layout": { "w": 12 }
      },
      {
        "id": "table-1",
        "type": "DataTable",
        "props": {
          "title": "Top Performing Stores",
          "columns": [
            { "key": "store", "label": "Store Name" },
            { "key": "revenue", "label": "Revenue" },
            { "key": "growth", "label": "Growth" }
          ],
          "data": [
            { "store": "Mumbai Flagship", "revenue": "$450K", "growth": "18%" },
            { "store": "Delhi Central", "revenue": "$320K", "growth": "12%" },
            { "store": "Bangalore Tech Park", "revenue": "$280K", "growth": "22%" }
          ]
        },
        "layout": { "w": 12 }
      }
    ]
  }
};

export default function GeneratedPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [schema, setSchema] = useState<PageSchema | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Simulate API fetch
    const data = MOCK_SCHEMAS[slug];
    if (data) {
      setSchema(data);
    }
  }, [slug]);

  if (!schema) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>404</h1>
        <p className="text-sm opacity-60 mb-8" style={{ color: 'var(--text-color)' }}>Oops! This dynamic page doesn&apos;t exist yet.</p>
        <Link href="/builder" className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-500">
           Go to Builder
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-4">
          <Link href="/builder" className="group rounded-full border p-2 hover:bg-white/5" style={{ borderColor: 'var(--border-color)' }}>
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" style={{ color: 'var(--text-color)' }} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-color)' }}>{schema.pageName}</h1>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-40" style={{ color: 'var(--text-color)' }}>
               Live Generated Dashboard
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => showToast('Link copied to clipboard!', 'info')}
             className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-all hover:bg-white/5"
             style={{ color: 'var(--text-color)', borderColor: 'var(--border-color)' }}
           >
              <Share2 className="h-4 w-4" /> Share
           </button>
           <button 
             className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500"
             onClick={() => showToast('Report download started...', 'success')}
           >
              <Download className="h-4 w-4" /> Download Report
           </button>
        </div>
      </div>

      <DynamicRenderer schema={schema} />
    </div>
  );
}
