'use client';

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface RoadmapTimelineProps {
  title: string;
  stepsJson: string;
}

export default function RoadmapTimeline({
  title = 'Project Roadmap',
  stepsJson = '[{"title":"Planning","desc":"Define scope","status":"completed"},{"title":"Development","desc":"Build core features","status":"current"},{"title":"Testing","desc":"QA & Bug fixes","status":"upcoming"}]',
}: RoadmapTimelineProps) {
  let steps: any[] = [];
  try { steps = JSON.parse(stepsJson); if (!Array.isArray(steps)) steps = []; } catch { steps = []; }

  return (
    <div className="theme-card-bg rounded-2xl border p-6">
      <h3 className="theme-text mb-6 text-base font-bold">{title}</h3>
      <div className="theme-border relative border-l ml-3 space-y-8">
        {steps.map((step: any, index: number) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          return (
            <div key={index} className="relative pl-6">
              <div className="theme-card-bg absolute -left-[11px] top-1 flex h-5 w-5 items-center justify-center rounded-full">
                {isCompleted
                  ? <CheckCircle2 className="h-5 w-5 text-emerald-500 bg-emerald-500/10 rounded-full" />
                  : isCurrent
                  ? <Circle className="h-4 w-4 fill-blue-500 text-blue-500" />
                  : <Circle className="theme-text-muted h-4 w-4" />}
              </div>
              <h4 className={`text-sm font-bold ${isCurrent ? 'text-blue-500' : 'theme-text'}`}>{step.title}</h4>
              {step.desc && <p className="theme-text mt-1 text-xs opacity-60 leading-relaxed">{step.desc}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
