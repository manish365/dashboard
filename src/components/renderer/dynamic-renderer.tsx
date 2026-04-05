'use client';

import React from 'react';
import { PageSchema, ComponentInstance } from '@/lib/builder/types';
import { COMPONENT_REGISTRY } from '@/lib/builder/registry';

interface DynamicRendererProps {
  schema: PageSchema;
}

export default function DynamicRenderer({ schema }: DynamicRendererProps) {
  const renderComponent = (instance: ComponentInstance) => {
    const registryEntry = COMPONENT_REGISTRY[instance.type];
    
    if (!registryEntry) {
      return (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-500">
          Unknown component type: <strong>{instance.type}</strong>
        </div>
      );
    }

    const { component: Component } = registryEntry;
    
    // Grid spanning logic
    const gridSpan = instance.layout?.w ? `col-span-${instance.layout.w}` : 'col-span-12';
    
    return (
      <div key={instance.id} className={schema.layout === 'grid' ? gridSpan : 'w-full'}>
        <Component {...instance.props} />
      </div>
    );
  };

  const getLayoutClass = () => {
    switch (schema.layout) {
      case 'grid':
        return `grid grid-cols-${schema.columns || 12} gap-6`;
      case 'horizontal':
        return 'flex flex-row gap-6 overflow-x-auto pb-4';
      case 'stacked':
      default:
        return 'flex flex-col gap-6';
    }
  };

  return (
    <div className="w-full">
      {schema.components.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/5 opacity-40">
          <p className="text-sm">Canvas is empty. Add components to begin.</p>
        </div>
      ) : (
        <div className={getLayoutClass()}>
          {schema.components.map(renderComponent)}
        </div>
      )}
    </div>
  );
}
