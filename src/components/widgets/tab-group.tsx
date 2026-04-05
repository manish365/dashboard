'use client';

import React, { useState } from 'react';

interface TabGroupProps {
  tab1Label: string;
  tab1Content: string;
  tab2Label: string;
  tab2Content: string;
  tab3Label: string;
  tab3Content: string;
}

export default function TabGroup({
  tab1Label = 'Overview',
  tab1Content = 'Here is the overview content. You can put summary information here.',
  tab2Label = 'Details',
  tab2Content = 'Detailed metrics and tables go here for deep dives.',
  tab3Label = '',
  tab3Content = '',
}: TabGroupProps) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: tab1Label, content: tab1Content },
    { label: tab2Label, content: tab2Content },
    { label: tab3Label, content: tab3Content },
  ].filter(t => t.label);

  return (
    <div className="flex w-full flex-col rounded-2xl border overflow-hidden" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
      {/* Tab Headers */}
      <div className="flex border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--navbar-carousel-color)' }}>
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`flex-1 px-4 py-3 text-sm font-bold transition-all relative ${activeTab === idx ? 'text-blue-500' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
            style={{ color: activeTab === idx ? 'var(--neon-green)' : 'var(--text-color)' }}
          >
            {tab.label}
            {activeTab === idx && (
              <div 
                className="absolute bottom-0 left-0 w-full h-0.5"
                style={{ background: 'var(--neon-green)' }}
              />
            )}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="p-6 text-sm leading-relaxed opacity-80" style={{ color: 'var(--text-color)', minHeight: '120px' }}>
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}
