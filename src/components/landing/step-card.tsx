interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

export function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--teal-50)] text-[var(--teal)] font-bold text-lg flex items-center justify-center mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-[var(--slate-800)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--slate-500)] text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
