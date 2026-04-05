'use client';

import { ComponentRegistry, ComponentMetadata } from './types';
import KpiCard from '@/components/widgets/kpi-card';
import InfoTile from '@/components/widgets/info-tile';
import DataTable from '@/components/widgets/data-table';
import SliderInput from '@/components/widgets/slider-input';
import AccordionGroup from '@/components/widgets/accordion-group';
import TabGroup from '@/components/widgets/tab-group';
import VisualChart from '@/components/widgets/visual-chart';
import RoadmapTimeline from '@/components/widgets/roadmap-timeline';
import SwiperCarousel from '@/components/widgets/swiper-carousel';
import ProductTile from '@/components/widgets/product-tile';
import { ChartBar, Table, Info, CreditCard, SlidersHorizontal, ListCollapse, FolderOpen, BarChart3, Route, Image as ImageIcon, ShoppingBag } from 'lucide-react';

export const COMPONENT_REGISTRY: ComponentRegistry = {
  KpiCard: {
    component: KpiCard,
    metadata: {
      type: 'KpiCard',
      name: 'KPI Card',
      description: 'Display a single metric with trend indicator.',
      category: 'data-display',
      icon: 'CreditCard',
      props: [
        { name: 'title', type: 'string', label: 'Title', defaultValue: 'Total Revenue' },
        { name: 'value', type: 'string', label: 'Value', defaultValue: '$12,450' },
        { name: 'trend', type: 'number', label: 'Trend (%)', defaultValue: 10 },
        { name: 'trendLabel', type: 'string', label: 'Trend Label', defaultValue: 'vs last month' },
        { 
          name: 'color', 
          type: 'select', 
          label: 'Theme Color', 
          defaultValue: 'blue',
          options: [
            { label: 'Blue', value: 'blue' },
            { label: 'Emerald', value: 'emerald' },
            { label: 'Amber', value: 'amber' },
            { label: 'Red', value: 'red' },
            { label: 'Purple', value: 'purple' },
          ]
        },
      ],
      defaultProps: {
        title: 'New Metric',
        value: '0',
        trend: 0,
        trendLabel: 'no change',
        color: 'blue'
      }
    }
  },
  InfoTile: {
    component: InfoTile,
    metadata: {
      type: 'InfoTile',
      name: 'Info Tile',
      description: 'Highlight a feature or piece of information.',
      category: 'layout',
      icon: 'Info',
      props: [
        { name: 'label', type: 'string', label: 'Label', defaultValue: 'Announcement' },
        { name: 'description', type: 'string', label: 'Description', defaultValue: 'Content goes here...' },
      ],
      defaultProps: {
        label: 'New Info',
        description: 'Update the description in the builder.'
      }
    }
  },
  DataTable: {
    component: DataTable,
    metadata: {
      type: 'DataTable',
      name: 'Data Table',
      description: 'Display structured data in a sortable table.',
      category: 'data-display',
      icon: 'Table',
      props: [
        { name: 'title', type: 'string', label: 'Table Title', defaultValue: 'Recent Records' },
      ],
      defaultProps: {
        title: 'New Table',
        columns: [
          { key: 'col1', label: 'Column 1' },
          { key: 'col2', label: 'Column 2' }
        ],
        data: []
      }
    }
  },
  SliderInput: {
    component: SliderInput,
    metadata: {
      type: 'SliderInput',
      name: 'Range Slider',
      description: 'A draggable slider for numeric input.',
      category: 'form',
      icon: 'SlidersHorizontal',
      props: [
        { name: 'label', type: 'string', label: 'Label', defaultValue: 'Adjust Value' },
        { name: 'min', type: 'number', label: 'Minimum', defaultValue: 0 },
        { name: 'max', type: 'number', label: 'Maximum', defaultValue: 100 },
        { name: 'step', type: 'number', label: 'Step', defaultValue: 1 },
        { name: 'defaultValue', type: 'number', label: 'Default Value', defaultValue: 50 },
      ],
      defaultProps: {
        label: 'Brightness',
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 50
      }
    }
  },
  AccordionGroup: {
    component: AccordionGroup,
    metadata: {
      type: 'AccordionGroup',
      name: 'Accordion',
      description: 'Collapsible sections for dense information.',
      category: 'layout',
      icon: 'ListCollapse',
      props: [
        { name: 'item1Title', type: 'string', label: 'Item 1 Title', defaultValue: 'Section 1' },
        { name: 'item1Content', type: 'string', label: 'Item 1 Content', defaultValue: 'Content for section 1' },
        { name: 'item2Title', type: 'string', label: 'Item 2 Title', defaultValue: 'Section 2' },
        { name: 'item2Content', type: 'string', label: 'Item 2 Content', defaultValue: 'Content for section 2' },
        { name: 'item3Title', type: 'string', label: 'Item 3 Title', defaultValue: '' },
        { name: 'item3Content', type: 'string', label: 'Item 3 Content', defaultValue: '' },
      ],
      defaultProps: {
        item1Title: 'Advanced Settings',
        item1Content: 'Configure your advanced settings here.',
        item2Title: 'Display Options',
        item2Content: 'Toggle visibility of charts and tables.',
        item3Title: '',
        item3Content: ''
      }
    }
  },
  TabGroup: {
    component: TabGroup,
    metadata: {
      type: 'TabGroup',
      name: 'Tabs',
      description: 'Tabbed navigation to organize content.',
      category: 'layout',
      icon: 'FolderOpen',
      props: [
        { name: 'tab1Label', type: 'string', label: 'Tab 1 Label', defaultValue: 'Overview' },
        { name: 'tab1Content', type: 'string', label: 'Tab 1 Content', defaultValue: 'Overview content...' },
        { name: 'tab2Label', type: 'string', label: 'Tab 2 Label', defaultValue: 'Details' },
        { name: 'tab2Content', type: 'string', label: 'Tab 2 Content', defaultValue: 'Detailed content...' },
        { name: 'tab3Label', type: 'string', label: 'Tab 3 Label', defaultValue: '' },
        { name: 'tab3Content', type: 'string', label: 'Tab 3 Content', defaultValue: '' },
      ],
      defaultProps: {
        tab1Label: 'Overview',
        tab1Content: 'Main overview information.',
        tab2Label: 'Metrics',
        tab2Content: 'Detailed metrics and charts.',
        tab3Label: 'Logs',
        tab3Content: 'System logs appear here.'
      }
    }
  },
  VisualChart: {
    component: VisualChart,
    metadata: {
      type: 'VisualChart',
      name: 'Bar Chart',
      description: 'A pure CSS flexbox bar chart.',
      category: 'data-display',
      icon: 'BarChart3',
      props: [
        { name: 'title', type: 'string', label: 'Title', defaultValue: 'Monthly Sales' },
        { name: 'subtitle', type: 'string', label: 'Subtitle', defaultValue: 'Revenue over time' },
        { name: 'dataJson', type: 'string', label: 'Data JSON', defaultValue: '[{"label":"Jan","value":40},{"label":"Feb","value":65},{"label":"Mar","value":35}]' },
        { name: 'height', type: 'number', label: 'Height (px)', defaultValue: 200 },
        { name: 'color', type: 'string', label: 'Bar Color', defaultValue: '#00e9bf' },
      ],
      defaultProps: {
        title: 'Q1 Performance',
        subtitle: 'Actuals vs Target',
        dataJson: '[{"label":"Q1","value":85},{"label":"Q2","value":65},{"label":"Q3","value":90}]',
        height: 200,
        color: '#00e9bf'
      }
    }
  },
  RoadmapTimeline: {
    component: RoadmapTimeline,
    metadata: {
      type: 'RoadmapTimeline',
      name: 'Roadmap',
      description: 'Vertical timeline or stepper.',
      category: 'layout',
      icon: 'Route',
      props: [
        { name: 'title', type: 'string', label: 'Title', defaultValue: 'Project Roadmap' },
        { name: 'stepsJson', type: 'string', label: 'Steps JSON', defaultValue: '[{"title":"Step 1","desc":"Details","status":"completed"}]' },
      ],
      defaultProps: {
        title: 'Implementation Phases',
        stepsJson: '[{"title":"Design","desc":"UI/UX Wireframes","status":"completed"},{"title":"Development","desc":"Frontend & Backend","status":"current"},{"title":"Launch","desc":"Go live","status":"upcoming"}]'
      }
    }
  },
  SwiperCarousel: {
    component: SwiperCarousel,
    metadata: {
      type: 'SwiperCarousel',
      name: 'Image Carousel',
      description: 'Horizontal scroll-snap image swiper.',
      category: 'layout',
      icon: 'ImageIcon',
      props: [
        { name: 'title', type: 'string', label: 'Title', defaultValue: 'Gallery' },
        { name: 'imagesJson', type: 'string', label: 'Images JSON', defaultValue: '[{"url":"https://via.placeholder.com/600","caption":"Image 1"}]' },
      ],
      defaultProps: {
        title: 'Featured Products',
        imagesJson: '[{"url":"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600","caption":"Running Shoes"},{"url":"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600","caption":"Headphones"},{"url":"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600","caption":"Smart Watch"}]'
      }
    }
  },
  ProductTile: {
    component: ProductTile,
    metadata: {
      type: 'ProductTile',
      name: 'Product Tile',
      description: 'E-commerce product card with action button.',
      category: 'data-display',
      icon: 'ShoppingBag',
      props: [
        { name: 'title', type: 'string', label: 'Product Name', defaultValue: 'Premium Item' },
        { name: 'price', type: 'number', label: 'Price', defaultValue: 99.99 },
        { name: 'currency', type: 'string', label: 'Currency Symbol', defaultValue: '$' },
        { name: 'category', type: 'string', label: 'Category Tag', defaultValue: 'New' },
        { name: 'imageUrl', type: 'string', label: 'Image URL', defaultValue: 'https://via.placeholder.com/600' },
        { name: 'buttonText', type: 'string', label: 'Button Text', defaultValue: 'Add to Cart' },
      ],
      defaultProps: {
        title: 'Sony WH-1000XM5',
        price: 348.00,
        currency: '$',
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600',
        buttonText: 'Buy Now'
      }
    }
  }
};

export const getComponentMetadata = (type: string): ComponentMetadata | undefined => {
  return COMPONENT_REGISTRY[type]?.metadata;
};

export const getAllMetadata = (): ComponentMetadata[] => {
  return Object.values(COMPONENT_REGISTRY).map(r => r.metadata);
};
