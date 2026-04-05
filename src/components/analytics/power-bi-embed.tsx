'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ExternalLink, RefreshCw, Maximize2, ShieldCheck } from 'lucide-react';

interface PowerBIEmbedProps {
  reportUrl?: string;
  title?: string;
  height?: string;
}

export default function PowerBIEmbed({ 
  reportUrl = 'https://playground.powerbi.com/sampleReportEmbed', 
  title = 'Analytics Dashboard',
  height = 'calc(100vh - 220px)'
}: PowerBIEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsLoading(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setIsLoading(false);
    }, 1500);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Enterprise SSO URL preparation
  const ssoUrl = reportUrl.includes('?') 
    ? `${reportUrl}&autoAuth=true` 
    : `${reportUrl}?autoAuth=true`;

  return (
    <div className="flex flex-col gap-4">
      {/* Dashboard Toolbar */}
      <div className="flex items-center justify-between rounded-xl border p-3 backdrop-blur-md"
        style={{ background: 'var(--navbar-carousel-color)', borderColor: 'var(--header-border)' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--neon-green)]/10 text-[var(--neon-green)]"
            style={{ color: 'var(--neon-green)' }}>
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>{title}</h2>
            <p className="text-[10px] flex items-center gap-1" style={{ color: 'var(--old-price)' }}>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Connection · SECURE ENCRYPTED DATA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-50"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-color)' }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:bg-slate-700 active:scale-95"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-color)' }}>
            <Maximize2 className="h-3.5 w-3.5" />
            Full Screen
          </button>
          <a 
            href={ssoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80 active:scale-95 shadow-lg shadow-indigo-600/20"
            style={{ background: 'var(--neon-green)', color: 'var(--text-color-black)' }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in Power BI
          </a>
        </div>
      </div>

      {/* Embed Container */}
      <div className="relative overflow-hidden rounded-2xl border bg-slate-900/40 shadow-2xl" 
        style={{ height, borderColor: 'var(--header-border)', background: 'var(--croma-wall)' }}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--neon-green)' }} />
            <p className="mt-4 text-sm font-medium" style={{ color: 'var(--text-color)' }}>Loading Power BI Report...</p>
            <p className="mt-1 text-[10px]" style={{ color: 'var(--old-price)' }}>Authenticating with Azure AD</p>
          </div>
        )}
        
        <iframe
          title={title}
          className="h-full w-full border-none"
          src={ssoUrl}
          allowFullScreen={true}
          onLoad={() => setIsLoading(false)}
        />
        
        {/* Mock Watermark / Security Footer */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="rounded-full bg-black/40 backdrop-blur-md border border-white/5 px-3 py-1 text-[9px] text-white/40">
            CONFIDENTIAL · INTERNAL USE ONLY
          </div>
          <div className="rounded-full bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 px-3 py-1 text-[9px] text-indigo-300/60 font-mono">
            ID: PBI-7742-CRMA-2026
          </div>
        </div>
      </div>
    </div>
  );
}
