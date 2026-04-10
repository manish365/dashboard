'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Calendar, DollarSign, MapPin, User, Loader2 } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpCard, KpBadge } from '@/components/kestopur/ui';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    kpFetch(`/wp-admin/orders/${orderId}`)
      .then(r => setOrder(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const fmtCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n || 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--neon-green)' }} />
    </div>
  );

  if (!order) return (
    <div className="space-y-4">
      <Link href="/kestopur/orders" className="inline-flex items-center gap-1.5 text-sm hover:opacity-80" style={{ color: 'var(--circle)' }}>
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>
      <div className="text-center py-20" style={{ color: 'var(--old-price)' }}>
        <Package className="h-12 w-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--circle)' }} />
        <p>Order not found or backend unavailable.</p>
        <p className="text-xs mt-1" style={{ color: 'var(--circle)' }}>Order ID: {orderId}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/kestopur/orders" className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--circle)' }}>
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Order {order.orderNumber}</h1>
          <p className="text-sm mt-0.5 flex items-center gap-1" style={{ color: 'var(--old-price)' }}>
            <Calendar className="h-3.5 w-3.5" /> {fmt(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <KpBadge label={order.orderStatus} variant={order.orderStatus} />
          <KpBadge label={order.paymentStatus || 'unknown'} variant={order.paymentStatus} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <KpCard>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <span className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>Order Items</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {(order.items || []).length === 0 ? (
                <p className="px-5 py-8 text-center text-sm" style={{ color: 'var(--old-price)' }}>No items data available.</p>
              ) : (order.items || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--foot-color)' }}>
                    <Package className="h-5 w-5" style={{ color: 'var(--circle)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-color)' }}>{item.name || item.productName || 'Product'}</p>
                    <p className="text-xs" style={{ color: 'var(--old-price)' }}>Qty: {item.quantity || 1}</p>
                  </div>
                  <p className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--text-color)' }}>{fmtCurrency(item.price || item.total || 0)}</p>
                </div>
              ))}
            </div>
          </KpCard>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <KpCard>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <span className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>Order Summary</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Subtotal', value: fmtCurrency(order.subtotal || order.finalAmount) },
                { label: 'Discount', value: fmtCurrency(order.discount || 0) },
                { label: 'Shipping', value: fmtCurrency(order.shippingCost || 0) },
                { label: 'Tax', value: fmtCurrency(order.tax || 0) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span style={{ color: 'var(--old-price)' }}>{label}</span>
                  <span style={{ color: 'var(--text-color)' }}>{value}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-bold" style={{ borderColor: 'var(--border-color)' }}>
                <span style={{ color: 'var(--text-color)' }}>Total</span>
                <span style={{ color: 'var(--neon-green)' }}>{fmtCurrency(order.finalAmount)}</span>
              </div>
            </div>
          </KpCard>

          {/* Customer */}
          <KpCard>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <span className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>Customer</span>
            </div>
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--circle)' }} />
                <span className="text-sm" style={{ color: 'var(--old-price)' }}>{order.customerId || 'N/A'}</span>
              </div>
              {order.shippingAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--circle)' }} />
                  <span className="text-sm" style={{ color: 'var(--old-price)' }}>{typeof order.shippingAddress === 'string' ? order.shippingAddress : JSON.stringify(order.shippingAddress)}</span>
                </div>
              )}
            </div>
          </KpCard>
        </div>
      </div>
    </div>
  );
}
