import { motion } from 'framer-motion';
import { Cloud, Shield, Sparkles, Users } from 'lucide-react';
import type { Highlight as HighlightItem } from '../data';
import { SectionHeader, useStagger } from './shared';

const iconMap: Record<string, JSX.Element> = {
  Cloud: <Cloud className="h-6 w-6" />,
  Shield: <Shield className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
};

export default function Highlights({ items }: { items: HighlightItem[] }) {
  const variants = useStagger();
  return (
    <section id="highlights" className="max-w-6xl mx-auto px-4 py-16 space-y-8 scroll-mt-24">
      <SectionHeader
        eyebrow="Why join"
        title="Programs that accelerate your cloud journey"
        subtitle="Workshops, study jams, and projects tailored for students who want to build on AWS with confidence."
      />
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.4, once: true }}
            variants={variants}
            whileHover={{ y: -6, scale: 1.01, borderColor: 'rgba(251,146,60,0.25)' }}
            className="card p-5 flex flex-col gap-4"
          >
            <div className="h-12 w-12 rounded-2xl bg-orange-500/15 border border-orange-400/20 text-orange-200 flex items-center justify-center">
              {iconMap[item.icon] ?? <Sparkles className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
