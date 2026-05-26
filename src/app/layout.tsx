import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Anti Dashboard - GHN DNB',
  description: 'Dashboard phân tích hiệu suất giao hàng vùng DNB',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  );
}
