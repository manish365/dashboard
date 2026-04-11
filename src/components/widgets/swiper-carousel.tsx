'use client';

import React from 'react';

interface SwiperCarouselProps {
  title: string;
  imagesJson: string;
}

export default function SwiperCarousel({
  title = 'Featured Images',
  imagesJson = '[{"url":"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600","caption":"Running Shoes"},{"url":"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600","caption":"Headphones"}]',
}: SwiperCarouselProps) {
  let images: any[] = [];
  try { images = JSON.parse(imagesJson); if (!Array.isArray(images)) images = []; } catch { images = []; }

  return (
    <div className="theme-card-bg rounded-2xl border p-6">
      <h3 className="theme-text mb-4 text-base font-bold">{title}</h3>
      {/* scrollbarWidth/msOverflowStyle have no CSS class equivalent — kept as style */}
      <div className="flex w-full gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {images.map((item: any, i: number) => (
          <div key={i} className="group relative flex-none w-64 h-40 overflow-hidden rounded-xl bg-slate-800 snap-center transition-transform hover:scale-[1.02]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.caption} className="w-full h-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
              <span className="text-sm font-bold text-white shadow-sm">{item.caption}</span>
            </div>
          </div>
        ))}
        {images.length === 0 && (
          <div className="theme-border flex w-full h-40 items-center justify-center rounded-xl border border-dashed opacity-50">
            <span className="theme-text text-sm">No images provided</span>
          </div>
        )}
      </div>
    </div>
  );
}
