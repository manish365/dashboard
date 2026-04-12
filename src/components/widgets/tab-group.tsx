'use client';

import React, { useState } from 'react';

interface TabGroupProps {
  tab1Label: string; tab1Content: string;
  tab2Label: string; tab2Content: string;
  tab3Label: string; tab3Content: string;
}

export default function TabGroup({
  tab1Label = 'Overview', tab1Content = 'Here is the overview content.',
  tab2Label = 'Details',  tab2Content = 'Detailed metrics and tables go here.',
  tab3Label = '',         tab3Content = '',
}: TabGroupProps) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: tab1Label, content: tab1Content },
    { label: tab2Label, content: tab2Content },
    { label: tab3Label, content: tab3Content },
  ].filter(t => t.label);

  return (
    <div className="dg-card flex w-full flex-col">
      <div className="theme-panel theme-border flex border-b">
        {tabs.map((tab, idx) => (
          <button key={idx} onClick={() => setActiveTab(idx)}
            className={`flex-1 px-4 py-3 text-sm font-bold transition-all relative ${activeTab === idx ? 'theme-text-neon' : 'theme-text opacity-60 hover:opacity-100 hover:bg-white/5'}`}>
            {tab.label}
            {activeTab === idx && <div className="theme-neon-bg absolute bottom-0 left-0 w-full h-0.5 shadow-[0_0_8px_rgba(0,233,191,0.5)]" />}
          </button>
        ))}
      </div>
      <div className="theme-text p-6 text-sm leading-relaxed opacity-80 min-h-[120px]">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}
