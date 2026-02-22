import { PulseLogo } from "@/components/ui/pulse-logo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <PulseLogo className="w-16 h-16" />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--slate-200)] p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
