'use client';

import { useState } from 'react';
import { DataExplorerMain } from '@/components/data-explorer/DataExplorerMain';
import { SearchBar } from '@/components/data-explorer/SearchBar';

export default function DataExplorerPage() {
  const [initialConfig, setInitialConfig] = useState<any>(null);

  const handleSearch = (config: any) => {
    setInitialConfig(config);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-[1600px] py-1">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
              SQL & Data Explorer
            </h1>
            <p className="mt-3 text-lg text-slate-400 max-w-2xl mx-auto">
              Explore your relational data with visual tools or raw SQL. High-performance, low-latency, enterprise-ready.
            </p>
          </div>

          <div className="mb-14 max-w-4xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          <DataExplorerMain initialConfig={initialConfig} />
        </div>
      </div>
    </div>

  );
}
