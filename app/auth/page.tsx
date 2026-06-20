import AuthForm from '@/components/AuthForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in — FlowTask' };

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      <AuthForm />
    </div>
  );
}
