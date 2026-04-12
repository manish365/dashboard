'use client';
import Link from 'next/link';
import { Headphones, RotateCcw, RefreshCw, Ticket, Star } from 'lucide-react';
import { KpPageHeader, KpCard } from '@/components/kestopur/ui';

const SECTIONS = [
  { href: '/kestopur/customer-service/returns', label: 'Returns', desc: 'Manage product return requests', icon: RotateCcw, tagCls: 'theme-tag-warning', textCls: 'theme-text-warning' },
  { href: '/kestopur/customer-service/refunds', label: 'Refunds', desc: 'Process customer refunds', icon: RefreshCw, tagCls: 'theme-tag-info', textCls: 'theme-text-info' },
  { href: '/kestopur/customer-service/tickets', label: 'Support Tickets', desc: 'Handle customer support requests', icon: Ticket, tagCls: 'theme-tag-purple', textCls: 'theme-text-purple' },
  { href: '/kestopur/customer-service/reviews', label: 'Product Reviews', desc: 'Moderate product reviews', icon: Star, tagCls: 'theme-tag-orange', textCls: 'theme-text-orange' },
];

export default function CustomerServicePage() {
  return (
    <div className="space-y-6">
      <KpPageHeader title="Customer Service" subtitle="Manage returns, refunds, tickets, and reviews" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map(({ href, label, desc, icon: Icon, tagCls, textCls }) => (
          <Link key={href} href={href}>
            <div className="rounded-xl border p-6 transition-all hover:border-[var(--neon-green)]/30 cursor-pointer group theme-card-bg">
              <div className={`rounded-xl p-3 w-fit mb-4 ${tagCls}`}>
                <Icon className={`h-6 w-6 ${textCls}`} />
              </div>
              <h3 className="font-semibold theme-text">{label}</h3>
              <p className="text-sm mt-1 theme-text-muted">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
