import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'TaskFlow — Task Manager',
  description:
    'A beautiful, feature-rich task manager built with Next.js 14, TypeScript, and Tailwind CSS.',
  keywords: ['task manager', 'todo', 'productivity', 'next.js'],
};

/**
 * Inline script that applies the saved theme BEFORE the first paint, preventing
 * any flash of the wrong color scheme. Runs synchronously in the <head>.
 */
const themeScript = `
(function(){
  try{
    var t=localStorage.getItem('taskflow-theme');
    if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){
      document.documentElement.classList.add('dark');
    }
  }catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200`}
      >
        {children}
      </body>
    </html>
  );
}
