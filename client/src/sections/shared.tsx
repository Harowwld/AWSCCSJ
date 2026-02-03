import { useMemo } from 'react';

export type NavigateFn = (id: string, opts?: { replaceHash?: boolean }) => void;

export function useStagger(delay = 0.06) {
  return useMemo(
    () => ({
      hidden: { opacity: 0, y: 16 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * delay, type: 'spring', stiffness: 140, damping: 18 },
      }),
    }),
    [delay]
  );
}

export const Pill = ({ label }: { label: string }) => (
  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full bg-white/10 text-orange-200 border border-orange-300/20">
    {label}
  </span>
);

export type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  align?: 'left' | 'center';
};

export function SectionHeader({ eyebrow, title, subtitle, align = 'left' }: SectionHeaderProps) {
  const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start';
  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      <Pill label={eyebrow} />
      <h2 className="section-title max-w-3xl">{title}</h2>
      <p className="section-subtitle">{subtitle}</p>
    </div>
  );
}
