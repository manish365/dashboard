'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/providers/toast-context';

interface ProductTileProps {
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  category: string;
  buttonText: string;
}

export default function ProductTile({
  title = 'Premium Wireless Earbuds',
  price = 199.99,
  currency = '$',
  imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
  category = 'Electronics',
  buttonText = 'Add to Cart',
}: ProductTileProps) {
  const { showToast } = useToast();

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 border-opacity-50" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-900 border-b" style={{ borderColor: 'var(--border-color)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imageUrl} 
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90"
          onError={(e) => {
             e.currentTarget.src = 'https://via.placeholder.com/600x600?text=No+Image';
          }}
        />
        <div className="absolute top-3 left-3 rounded-md bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm border border-white/10">
          {category}
        </div>
      </div>
      
      {/* Content Container */}
      <div className="flex flex-1 flex-col p-5">
        <h4 className="line-clamp-2 text-sm font-bold leading-snug" style={{ color: 'var(--text-color)' }}>
          {title}
        </h4>
        <div className="mt-2 text-lg font-black" style={{ color: 'var(--neon-green)' }}>
          {currency}{price}
        </div>
        
        <div className="mt-auto pt-5">
          <button 
            onClick={() => showToast(`Added ${title} to cart successfully.`, 'success')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-[0.98]"
          >
            <ShoppingCart className="h-4 w-4" />
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
