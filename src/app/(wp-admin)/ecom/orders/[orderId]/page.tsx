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
    kpFetch(`/orders/${orderId}`)
      .then(r => setOrder(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [orderId]);

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const fmtCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n || 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin theme-text-neon" />
    </div>
  );

  if (!order) return (
    <div className="space-y-4">
      <Link href="/kestopur/orders" className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 theme-text-subtle">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>
      <div className="text-center py-20 theme-text-muted">
        <Package className="h-12 w-12 mx-auto mb-3 opacity-20 theme-text-subtle" />
        <p>Order not found or backend unavailable.</p>
        <p className="text-xs mt-1 theme-text-subtle">Order ID: {orderId}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/kestopur/orders" className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity theme-text-subtle">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold theme-text">Order {order.orderNumber}</h1>
          <p className="text-sm mt-0.5 flex items-center gap-1 theme-text-muted">
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
            <div className="px-5 py-4 border-b theme-border">
              <span className="font-semibold text-sm theme-text">Order Items</span>
            </div>
            <div className="divide-y theme-border">
              {(order.items || []).length === 0 ? (
                <p className="px-5 py-8 text-center text-sm theme-text-muted">No items data available.</p>
              ) : (order.items || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 theme-footer-bg">
                    <Package className="h-5 w-5 theme-text-subtle" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate theme-text">{item.name || item.productName || 'Product'}</p>
                    <p className="text-xs theme-text-muted">Qty: {item.quantity || 1}</p>
                  </div>
                  <p className="text-sm font-semibold flex-shrink-0 theme-text">{fmtCurrency(item.price || item.total || 0)}</p>
                </div>
              ))}
            </div>
          </KpCard>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <KpCard>
            <div className="px-5 py-4 border-b theme-border">
              <span className="font-semibold text-sm theme-text">Order Summary</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Subtotal', value: fmtCurrency(order.subtotal || order.finalAmount) },
                { label: 'Discount', value: fmtCurrency(order.discount || 0) },
                { label: 'Shipping', value: fmtCurrency(order.shippingCost || 0) },
                { label: 'Tax', value: fmtCurrency(order.tax || 0) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="theme-text-muted">{label}</span>
                  <span className="theme-text">{value}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-bold theme-border">
                <span className="theme-text">Total</span>
                <span className="theme-text-neon">{fmtCurrency(order.finalAmount)}</span>
              </div>
            </div>
          </KpCard>

          {/* Customer */}
          <KpCard>
            <div className="px-5 py-4 border-b theme-border">
              <span className="font-semibold text-sm theme-text">Customer</span>
            </div>
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 flex-shrink-0 theme-text-subtle" />
                <span className="text-sm theme-text-muted">{order.customerId || 'N/A'}</span>
              </div>
              {order.shippingAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 theme-text-subtle" />
                  <span className="text-sm theme-text-muted">{typeof order.shippingAddress === 'string' ? order.shippingAddress : JSON.stringify(order.shippingAddress)}</span>
                </div>
              )}
            </div>
          </KpCard>
        </div>
      </div>
    </div>
  );
}
