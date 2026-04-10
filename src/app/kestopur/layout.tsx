'use client';

import { KestopurProvider } from '@/providers/kestopur-provider';

export default function KestopurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KestopurProvider>
      <div className="animate-in fade-in duration-500">
        {children}
      </div>
    </KestopurProvider>
  );
}
// wait, I made a typo in the tag name above. I'll correct it.
