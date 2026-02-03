import { motion } from 'framer-motion';
import type { Announcement as AnnouncementItem } from '../data';
import { SectionHeader, useStagger } from './shared';

export default function Announcements({ announcements }: { announcements: AnnouncementItem[] }) {
  const variants = useStagger(0.07);
  return (
    <section id="announcements" className="max-w-6xl mx-auto px-4 py-16 space-y-8 scroll-mt-24">
      <SectionHeader
        eyebrow="Announcements"
        title="Club news & opportunities"
        subtitle="Stay updated with resources, credits, and partner events."
      />
      <div className="grid md:grid-cols-3 gap-6">
        {announcements.map((item, i) => (
          <motion.div
            key={item.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.4, once: true }}
            variants={variants}
            whileHover={{ y: -6, scale: 1.01, borderColor: 'rgba(251,146,60,0.25)' }}
            className="card overflow-hidden flex flex-col"
          >
            {item.image && (
              <div className="h-36 w-full overflow-hidden">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
              </div>
            )}
            <div className="p-5 space-y-3 flex-1">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wide">
                <span>{item.date}</span>
                <span className="text-orange-200">{item.author}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{item.excerpt}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
