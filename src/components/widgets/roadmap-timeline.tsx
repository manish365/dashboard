'use client';

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface RoadmapTimelineProps {
  title: string;
  stepsJson: string; // expects JSON string: Array<{title: string, desc: string, status: 'completed' | 'current' | 'upcoming'}>
}

export default function RoadmapTimeline({
  title = 'Project Roadmap',
  stepsJson = '[{"title":"Planning","desc":"Define scope","status":"completed"},{"title":"Development","desc":"Build core features","status":"current"},{"title":"Testing","desc":"QA & Bug fixes","status":"upcoming"}]',
}: RoadmapTimelineProps) {

  let steps = [];
  try {
    steps = JSON.parse(stepsJson);
    if (!Array.isArray(steps)) steps = [];
  } catch(e) {
    steps = [];
  }

  return (
    <div className="rounded-2xl border p-6" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
      <h3 className="mb-6 text-base font-bold" style={{ color: 'var(--text-color)' }}>{title}</h3>
      
      <div className="relative border-l ml-3 space-y-8" style={{ borderColor: 'var(--border-color)' }}>
        {steps.map((step: any, index: number) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          
          return (
            <div key={index} className="relative pl-6">
              {/* Timeline dot */}
              <div 
                className="absolute -left-[11px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--croma-wall)]"
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 bg-emerald-500/10 rounded-full" />
                ) : isCurrent ? (
                  <Circle className="h-4 w-4 fill-blue-500 text-blue-500" />
                ) : (
                  <Circle className="h-4 w-4" style={{ color: 'var(--border-color)' }} />
                )}
              </div>
              
              {/* Content */}
              <div>
                <h4 
                  className={`text-sm font-bold ${isCurrent ? 'text-blue-500' : ''}`}
                  style={{ color: isCurrent ? '' : 'var(--text-color)' }}
                >
                  {step.title}
                </h4>
                {step.desc && (
                  <p className="mt-1 text-xs opacity-60 leading-relaxed" style={{ color: 'var(--text-color)' }}>
                    {step.desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
