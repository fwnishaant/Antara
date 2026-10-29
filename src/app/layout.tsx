import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ANTARA — The Agent Between Intention and Action',
  description: 'Autonomous AI growth engine & agentic commerce platform for online merchants. Convert intent into revenue with 5 specialized AI agents.',
  keywords: ['ANTARA', 'Agentic Commerce', 'AI Growth Engine', 'Razorpay', 'Payment Link Recovery', 'Fintech AI'],
  authors: [{ name: 'ANTARA Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light scroll-smooth">
      <body className="min-h-screen bg-[#faf9f6] text-[#111318] antialiased selection:bg-teal-100 selection:text-teal-900">
        {children}
      </body>
    </html>
  );
}
