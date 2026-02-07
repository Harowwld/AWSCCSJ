import { motion } from 'framer-motion';
import { Github, Linkedin } from 'lucide-react';
import type { Member as MemberItem } from '../data';
import { SectionHeader, useStagger } from './shared';

export default function Members({ members }: { members: MemberItem[] }) {
  const variants = useStagger(0.07);
  return (
    <section id="members" className="max-w-6xl mx-auto px-4 py-16 space-y-8 scroll-mt-24">
      <SectionHeader
        eyebrow="Leadership"
        title="Meet the student leaders"
        subtitle="Mentors guiding workshops, study jams, and projects."
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {members.map((member, i) => (
          <motion.div
            key={member.name}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.4, once: true }}
            variants={variants}
            whileHover={{ y: -6, scale: 1.01, borderColor: 'rgba(251,146,60,0.25)' }}
            className="card p-4 space-y-3"
          >
            <img
              src={member.avatar}
              alt={member.name}
              className="w-full h-40 object-cover rounded-xl border border-white/5"
              style={
                member.avatarFocusX != null || member.avatarFocusY != null
                  ? {
                      objectPosition: `${member.avatarFocusX ?? 50}% ${member.avatarFocusY ?? 50}%`,
                    }
                  : undefined
              }
              loading="lazy"
            />
            <div>
              <h3 className="text-lg font-semibold text-white">{member.name}</h3>
              <p className="text-sm text-orange-200 font-semibold">{member.role}</p>
              <p className="text-sm text-slate-300 leading-relaxed mt-1">{member.bio}</p>
            </div>
            <div className="flex gap-3 text-slate-200">
              {member.socials.github && (
                <a
                  href={member.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-200"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {member.socials.linkedin && (
                <a
                  href={member.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
