import { PulseLogo } from '@/components/ui/pulse-logo';

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">
      <div className="text-center">
        <PulseLogo className="w-32 h-32 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-teal-300 mb-2">Pulse</h1>
        <p className="text-slate-500">Foundation Setup Complete</p>
      </div>
    </main>
  );
}
