import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/layout/client-layout';

export const metadata: Metadata = {
  title: 'Croma Incentive Management Dashboard',
  description: 'Enterprise incentive management dashboard for Croma stores',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-slate-200 antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
