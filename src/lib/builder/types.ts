export type ComponentCategory = 'layout' | 'data-display' | 'form' | 'navigation' | 'feedback';

export interface PropSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'array' | 'object' | 'color';
  label: string;
  defaultValue: any;
  options?: { label: string; value: any }[]; // For type 'select'
  description?: string;
}

export interface ComponentMetadata {
  type: string;
  name: string;
  description: string;
  category: ComponentCategory;
  icon?: string;
  props: PropSchema[];
  defaultProps: Record<string, any>;
}

export interface ComponentInstance {
  id: string;
  type: string;
  props: Record<string, any>;
  layout?: {
    w?: number; // width in grid columns (1-12)
    h?: number; // relative height or rows
    order?: number;
  };
}

export interface PageSchema {
  id: string;
  pageName: string;
  slug: string;
  layout: 'grid' | 'stacked' | 'horizontal';
  columns?: number; // Default 12 for grid
  components: ComponentInstance[];
}

export interface ComponentRegistry {
  [type: string]: {
    component: React.ComponentType<any>;
    metadata: ComponentMetadata;
  };
}
