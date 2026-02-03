import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import type { NavigateFn } from './shared';
import { Pill, useStagger } from './shared';

export default function CTA({ onNavigate }: { onNavigate: NavigateFn }) {
  const statVariants = useStagger(0.08);

  return (
    <section className="max-w-6xl mx-auto px-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ amount: 0.5, once: true }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 120, damping: 18 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-orange-500/15 via-slate-900 to-cyan-400/10 shadow-2xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_40%)] pointer-events-none" aria-hidden />
        <div className="relative px-6 py-10 md:px-10 md:py-12 grid md:grid-cols-[1.5fr_1fr] gap-8 items-center">
          <div className="space-y-3">
            <Pill label="Join the journey" />
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">Build cloud projects with peers and mentors.</h3>
            <p className="text-slate-200 md:max-w-2xl">
              Weekly labs, study jams, and demos. Save your slot or browse what’s coming next.
            </p>
            <div className="flex flex-wrap gap-3">
              <motion.button
                type="button"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-soft"
              >
                Join the club <ArrowRight className="h-4 w-4" />
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onNavigate('events')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/30 text-white"
              >
                See events <Calendar className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
          <motion.div
            className="grid grid-cols-2 gap-4 text-sm"
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.4, once: true }}
            variants={statVariants}
          >
            {[{ label: 'Active members', value: '120+' }, { label: 'Events this term', value: '12' }, { label: 'Cert mentors', value: '6' }, { label: 'Projects shipped', value: '9' }].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.08, type: 'spring', stiffness: 120, damping: 18 } } }}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white shadow-soft"
              >
                <p className="text-lg font-semibold">{stat.value}</p>
                <p className="text-xs uppercase tracking-wide text-slate-200/80">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
