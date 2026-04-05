'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionGroupProps {
  item1Title: string;
  item1Content: string;
  item2Title: string;
  item2Content: string;
  item3Title: string;
  item3Content: string;
}

export default function AccordionGroup({
  item1Title = 'Section 1',
  item1Content = 'Content for section 1 goes here. This is a collapsible area.',
  item2Title = 'Section 2',
  item2Content = 'Content for section 2 goes here. Add more details as needed.',
  item3Title = '',
  item3Content = '',
}: AccordionGroupProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = [
    { title: item1Title, content: item1Content },
    { title: item2Title, content: item2Content },
    { title: item3Title, content: item3Content },
  ].filter(i => i.title);

  return (
    <div className="flex w-full flex-col gap-2">
      {items.map((item, index) => (
        <div key={index} className="rounded-xl border transition-all" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-color)' }}
          >
            <span className="text-sm font-bold">{item.title}</span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${openIndex === index ? 'rotate-180 text-blue-500' : 'opacity-50'}`} 
            />
          </button>
          
          <div 
            className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="border-t px-5 py-4 text-sm leading-relaxed opacity-70" style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}>
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
