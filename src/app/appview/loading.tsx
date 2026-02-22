import { Spinner } from "@/components/ui/spinner";

export default function AppViewLoading() {
  return (
    <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
