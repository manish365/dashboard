'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/providers/toast-context';

interface ProductTileProps {
  title: string; price: number; currency: string;
  imageUrl: string; category: string; buttonText: string;
}

export default function ProductTile({
  title = 'Premium Wireless Earbuds', price = 199.99, currency = '$',
  imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
  category = 'Electronics', buttonText = 'Add to Cart',
}: ProductTileProps) {
  const { showToast } = useToast();

  return (
    <div className="theme-card-bg group flex h-full flex-col overflow-hidden rounded-2xl border transition-all hover:-translate-y-1">
      <div className="theme-border relative aspect-square w-full overflow-hidden theme-footer-bg border-b">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90"
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/600x600?text=No+Image'; }} />
        <div className="absolute top-3 left-3 rounded-md bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider theme-text border theme-border">
          {category}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h4 className="theme-text line-clamp-2 text-sm font-bold leading-snug">{title}</h4>
        <div className="theme-text-neon mt-2 text-lg font-black">{currency}{price}</div>
        <div className="mt-auto pt-5">
          <button onClick={() => showToast(`Added ${title} to cart successfully.`, 'success')}
            className="theme-btn-neon flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-[0.98]">
            <ShoppingCart className="h-4 w-4" />
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
