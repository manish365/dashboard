import { PageSchema, ComponentInstance } from './types';
import { COMPONENT_REGISTRY } from './registry';

const formatPropValue = (value: any): string => {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return `{${value}}`;
  }
  if (Array.isArray(value) || typeof value === 'object') {
    return `{${JSON.stringify(value)}}`;
  }
  return `"${value}"`;
};

const kebabToPascal = (str: string) => {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
};

const getComponentImportPath = (type: string) => {
  // Simple heuristic for our current folder structure
  // KpiCard -> kpi-card
  const kebabName = type.replace(/([a-z0-Z])([A-Z])/g, '$1-$2').toLowerCase();
  return `@/components/widgets/${kebabName}`;
};

export const generateReactCode = (schema: PageSchema): string => {
  // 1. Identify unique components used
  const uniqueTypes = Array.from(new Set(schema.components.map(c => c.type)));
  
  // 2. Generate Imports
  const imports = uniqueTypes.map(type => {
    return `import ${type} from '${getComponentImportPath(type)}';`;
  }).join('\n');

  // 3. Generate Layout Class Wrapper based on schema.layout
  let wrapperClass = '';
  switch (schema.layout) {
    case 'grid':
      wrapperClass = `className="grid grid-cols-${schema.columns || 12} gap-6"`;
      break;
    case 'horizontal':
      wrapperClass = `className="flex flex-row gap-6 overflow-x-auto pb-4"`;
      break;
    case 'stacked':
    default:
      wrapperClass = `className="flex flex-col gap-6"`;
      break;
  }

  // 4. Generate JSX for each component
  const componentsJsx = schema.components.map((comp) => {
    // Determine span class
    let wrapperSpan = '';
    if (schema.layout === 'grid') {
      wrapperSpan = `className="col-span-${comp.layout?.w || 12}"`;
    } else {
      wrapperSpan = `className="w-full"`;
    }

    // Format props
    const propsString = Object.entries(comp.props)
      .map(([key, value]) => {
        // Skip default props that might be empty or undefined to clean up code
        if (value === undefined || value === '') return '';
        return `${key}=${formatPropValue(value)}`;
      })
      .filter(Boolean)
      .join(' ');

    return `
      {/* ${comp.type} Instance */}
      <div ${wrapperSpan}>
        <${comp.type} ${propsString} />
      </div>`;
  }).join('\n');

  // 5. Assemble the final file content
  const code = `import React from 'react';
${imports}

export default function ${kebabToPascal(schema.slug)}() {
  return (
    <div className="p-6">
      <div className="mb-6 border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>${schema.pageName}</h1>
      </div>

      <div ${wrapperClass}>
        ${componentsJsx}
      </div>
    </div>
  );
}
`;

  return code;
};
