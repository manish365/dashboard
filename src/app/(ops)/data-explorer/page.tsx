'use client';

import { useState } from 'react';
import { DataExplorerMain } from '@/components/data-explorer/DataExplorerMain';

export default function DataExplorerPage() {
  const [initialConfig] = useState<any>(null);

  return (
    <div className="de-page-bg min-h-screen">
      <div className="mx-auto max-w-[1920px]">
        <DataExplorerMain initialConfig={initialConfig} />
      </div>
    </div>
  );
}
