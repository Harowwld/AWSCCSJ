import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Rocket, Sparkles, ArrowRight } from 'lucide-react';
import type { NavigateFn } from './shared';
import { Pill } from './shared';

export default function Hero({
  onNavigate,
  eyebrow,
  title,
  subtitle,
  stat1Value,
  stat1Label,
  stat2Value,
  stat2Label,
  stat3Value,
  stat3Label,
  workshopLabel,
  workshopTitle,
  workshopPill,
  workshopDescription,
  workshopDateTime,
  workshopLocation,
  workshopCta,
}: {
  onNavigate: NavigateFn;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
  workshopLabel?: string;
  workshopTitle?: string;
  workshopPill?: string;
  workshopDescription?: string;
  workshopDateTime?: string;
  workshopLocation?: string;
  workshopCta?: string;
}) {
  const go = (_e: MouseEvent, id: string) => {
    onNavigate(id);
  };

  const pick = (value: string | undefined, fallback: string) => {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : fallback;
  };

  const heroEyebrow = pick(eyebrow, 'Official AWS Student Club');
  const heroTitle =
    pick(title, 'Build cloud-first skills with the AWS Cloud Club of PUP San Juan.');
  const heroSubtitle =
    pick(
      subtitle,
      'Hands-on labs, study jams, and projects guided by student leaders and AWS mentors. We help you launch cloud careers and certifications.'
    );

  const stats = [
    { label: pick(stat1Label, 'Members'), value: pick(stat1Value, '120+') },
    { label: pick(stat2Label, 'Events / sem'), value: pick(stat2Value, '12') },
    { label: pick(stat3Label, 'Cert mentors'), value: pick(stat3Value, '6') },
  ];

  const nextWorkshopLabel = pick(workshopLabel, 'Next Workshop');
  const nextWorkshopTitle = pick(workshopTitle, 'AWS Cloud Essentials');
  const nextWorkshopPill = pick(workshopPill, 'Feb 15');
  const nextWorkshopDescription =
    pick(
      workshopDescription,
      'Launch EC2, host static sites on S3 + CloudFront, and connect API Gateway to Lambda. Bring your laptop—we build live.'
    );
  const nextWorkshopDateTime = pick(workshopDateTime, 'Feb 15, 2:00 PM');
  const nextWorkshopLocation = pick(workshopLocation, 'IT Building 301');
  const nextWorkshopCta = pick(workshopCta, 'Save my slot');

  return (
    <section className="relative overflow-hidden scroll-mt-24" id="about">
      <div className="absolute inset-0 bg-glow bg-grid bg-grid-size opacity-30 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute left-10 top-16 h-40 w-40 bg-orange-500/20 blur-[90px]" />
        <div className="absolute right-0 bottom-10 h-60 w-60 bg-cyan-400/10 blur-[120px]" />
      </div>
      <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.6, once: true }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 120, damping: 18 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs uppercase tracking-[0.24em] text-orange-100">
            <Sparkles className="h-4 w-4" /> {heroEyebrow}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mt-6 leading-tight">
            {heroTitle.includes('AWS Cloud Club') ? (
              <>
                {heroTitle.split('AWS Cloud Club')[0]}
                <span className="text-orange-400">AWS Cloud Club</span>
                {heroTitle.split('AWS Cloud Club').slice(1).join('AWS Cloud Club')}
              </>
            ) : (
              heroTitle
            )}
          </h1>
          <p className="text-lg text-slate-300 mt-4 max-w-xl">
            {heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.02 }}
              transition={{ duration: 0.12 }}
              onClick={(e) => go(e, 'events')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-orange-500 text-slate-950 font-semibold shadow-lg shadow-orange-500/30"
            >
              View upcoming events <Calendar className="h-5 w-5" />
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.02 }}
              transition={{ duration: 0.12 }}
              onClick={(e) => go(e, 'highlights')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 text-white hover:border-orange-400/60"
            >
              What we offer <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg text-sm text-slate-300">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/5 bg-slate-900/50 px-4 py-3">
                <p className="text-xl font-semibold text-white">{stat.value}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotate: -0.4 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ amount: 0.4, once: true }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 130, damping: 16 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-orange-500/15 via-transparent to-cyan-400/10 blur-3xl" />
          <div className="relative rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-orange-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">{nextWorkshopLabel}</p>
                  <p className="text-lg font-semibold text-white">{nextWorkshopTitle}</p>
                </div>
              </div>
              <Pill label={nextWorkshopPill} />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {nextWorkshopDescription}
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-orange-300" /> {nextWorkshopDateTime}</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-300" /> {nextWorkshopLocation}</div>
            </div>
            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => onNavigate('contact')}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-orange-500 text-slate-950 font-semibold shadow-lg shadow-orange-500/30"
            >
              {nextWorkshopCta} <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
