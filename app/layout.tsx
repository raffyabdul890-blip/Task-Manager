import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FlowTask — Task Manager',
  description: 'Multi-user task manager with reminders, built with Next.js and Supabase.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FlowTask',
  },
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
};

const themeScript = `
(function(){
  try{
    var t=localStorage.getItem('flowtask-theme');
    if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){
      document.documentElement.classList.add('dark');
    }
  }catch(e){}
})();
`;

const swScript = `
if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/sw.js').catch(function(){});
  });
}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: swScript }} />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200`}
      >
        {children}
      </body>
    </html>
  );
}
