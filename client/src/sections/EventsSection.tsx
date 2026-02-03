import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import type { Event as EventItem } from '../data';
import { SectionHeader, useStagger } from './shared';

export default function EventsSection({ data }: { data: EventItem[] }) {
  const variants = useStagger(0.08);
  return (
    <section id="events" className="max-w-6xl mx-auto px-4 py-16 space-y-8 scroll-mt-24">
      <SectionHeader
        eyebrow="Events"
        title="Upcoming & recurring meetups"
        subtitle="Hands-on labs, deep dives, and study groups scheduled all semester."
      />
      <div className="grid lg:grid-cols-3 gap-6">
        {data.map((event, i) => (
          <motion.div
            key={event.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.3, once: true }}
            variants={variants}
            whileHover={{ y: -6, scale: 1.01, borderColor: 'rgba(251,146,60,0.25)' }}
            className="card p-5 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-orange-200 font-semibold">{event.date}</p>
                <h3 className="text-xl font-semibold text-white mt-1">{event.title}</h3>
              </div>
              <Calendar className="h-5 w-5 text-orange-200" />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{event.description}</p>
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <MapPin className="h-4 w-4 text-orange-300" /> {event.location}
            </div>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
