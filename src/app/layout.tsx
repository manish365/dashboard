import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/layout/client-layout';

export const metadata: Metadata = {
  title: 'weboffice Management Dashboard',
  description: 'Enterprise incentive management dashboard for Store stores',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('store-theme');
                  var theme = saved || 'light';
                  if (theme === 'light') {
                    document.body.classList.add('light-theme');
                  } else {
                    document.body.classList.remove('light-theme');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
