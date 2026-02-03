import { useMemo, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cloud,
  Shield,
  Users,
  Calendar,
  MapPin,
  Github,
  Linkedin,
  Mail,
  ArrowRight,
  Rocket,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { highlights, events, members, announcements, type Event as EventItem, type Member as MemberItem, type Announcement as AnnouncementItem } from './data';
import { supabase } from './supabaseClient';
import './index.css';

type NavigateFn = (id: string) => void;

const iconMap: Record<string, JSX.Element> = {
  Cloud: <Cloud className="h-6 w-6" />,
  Shield: <Shield className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
};

function formatDateLabel(dateString?: string, timeString?: string) {
  if (!dateString) return timeString ? timeString : 'TBA';
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return dateString;
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const datePart = parsed.toLocaleDateString(undefined, options);
  const timePart = timeString ? ` — ${timeString}` : '';
  return `${datePart}${timePart}`;
}

function formatTimestamp(timestamp?: string) {
  if (!timestamp) return '';
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return timestamp;
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return parsed.toLocaleDateString(undefined, options);
}

function useScrollToSection(): NavigateFn {
  return useCallback((id: string) => {
    const el = document.getElementById(id);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
    if (window.location.hash !== `#${id}`) {
      history.replaceState(null, '', `#${id}`);
    }
  }, []);
}

function useStagger(delay = 0.06) {
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

const Pill = ({ label }: { label: string }) => (
  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full bg-white/10 text-orange-200 border border-orange-300/20">
    {label}
  </span>
);

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  align?: 'left' | 'center';
};

function SectionHeader({ eyebrow, title, subtitle, align = 'left' }: SectionHeaderProps) {
  const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start';
  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      <Pill label={eyebrow} />
      <h2 className="section-title max-w-3xl">{title}</h2>
      <p className="section-subtitle">{subtitle}</p>
    </div>
  );
}

function Navbar({ onNavigate }: { onNavigate: NavigateFn }) {
  const links = [
    { label: 'About', id: 'about' },
    { label: 'Highlights', id: 'highlights' },
    { label: 'Events', id: 'events' },
    { label: 'Announcements', id: 'announcements' },
    { label: 'Members', id: 'members' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-slate-950/70 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Cloud className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <p className="text-xs text-orange-200 uppercase tracking-[0.24em]">AWS Cloud Club</p>
            <p className="text-lg font-semibold text-white">PUP San Juan</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-200">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className="hover:text-white transition-colors"
              type="button"
            >
              {link.label}
            </button>
          ))}
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('contact')}
            type="button"
            className="ml-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-slate-950 font-semibold shadow-lg shadow-orange-500/25"
          >
            Join the club <ArrowRight className="h-4 w-4" />
          </motion.button>
        </nav>
      </div>
    </header>
  );
}

function Hero({ onNavigate }: { onNavigate: NavigateFn }) {
  const go = (_e: React.MouseEvent, id: string) => {
    onNavigate(id);
  };

  return (
    <section className="relative overflow-hidden scroll-mt-24" id="about">
      <div className="absolute inset-0 bg-glow bg-grid bg-grid-size opacity-30 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute left-10 top-16 h-40 w-40 bg-orange-500/20 blur-[90px]" />
        <div className="absolute right-0 bottom-10 h-60 w-60 bg-cyan-400/10 blur-[120px]" />
      </div>
      <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs uppercase tracking-[0.24em] text-orange-100">
            <Sparkles className="h-4 w-4" /> Official AWS Student Club
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mt-6 leading-tight">
            Build cloud-first skills with the <span className="text-orange-400">AWS Cloud Club</span> of PUP San Juan.
          </h1>
          <p className="text-lg text-slate-300 mt-4 max-w-xl">
            Hands-on labs, study jams, and projects guided by student leaders and AWS mentors. We help you launch cloud careers and
            certifications.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => go(e, 'events')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-orange-500 text-slate-950 font-semibold shadow-lg shadow-orange-500/30"
            >
              View upcoming events <Calendar className="h-5 w-5" />
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => go(e, 'highlights')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 text-white hover:border-orange-400/60"
            >
              What we offer <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg text-sm text-slate-300">
            {[{ label: 'Members', value: '120+' }, { label: 'Events / sem', value: '12' }, { label: 'Cert mentors', value: '6' }].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/5 bg-slate-900/50 px-4 py-3">
                <p className="text-xl font-semibold text-white">{stat.value}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
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
                  <p className="text-sm text-slate-300">Next Workshop</p>
                  <p className="text-lg font-semibold text-white">AWS Cloud Essentials</p>
                </div>
              </div>
              <Pill label="Feb 15" />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Launch EC2, host static sites on S3 + CloudFront, and connect API Gateway to Lambda. Bring your laptop—we build live.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-orange-300" /> Feb 15, 2:00 PM</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-300" /> IT Building 301</div>
            </div>
            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => onNavigate('contact')}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-orange-500 text-slate-950 font-semibold shadow-lg shadow-orange-500/30"
            >
              Save my slot <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Highlights() {
  const variants = useStagger();
  return (
    <section id="highlights" className="max-w-6xl mx-auto px-4 py-16 space-y-8 scroll-mt-24">
      <SectionHeader
        eyebrow="Why join"
        title="Programs that accelerate your cloud journey"
        subtitle="Workshops, study jams, and projects tailored for students who want to build on AWS with confidence."
      />
      <div className="grid md:grid-cols-3 gap-6">
        {highlights.map((item, i) => (
          <motion.div
            key={item.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
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

function Events({ data }: { data: EventItem[] }) {
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
            viewport={{ once: true, amount: 0.3 }}
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

function CTA({ onNavigate }: { onNavigate: NavigateFn }) {
  const go = (_e: React.MouseEvent, id: string) => {
    onNavigate(id);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 pb-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-orange-500/15 via-slate-900 to-cyan-400/10 shadow-2xl">
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
                onClick={(e) => go(e, 'contact')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-soft"
              >
                Join the club <ArrowRight className="h-4 w-4" />
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.985 }}
                onClick={(e) => go(e, 'events')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/30 text-white"
              >
                See events <Calendar className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[{ label: 'Active members', value: '120+' }, { label: 'Events this term', value: '12' }, { label: 'Cert mentors', value: '6' }, { label: 'Projects shipped', value: '9' }].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white shadow-soft">
                <p className="text-lg font-semibold">{stat.value}</p>
                <p className="text-xs uppercase tracking-wide text-slate-200/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Announcements({ onNavigate, announcements }: { onNavigate: NavigateFn; announcements: AnnouncementItem[] }) {
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
            viewport={{ once: true, amount: 0.4 }}
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
              <motion.button
                type="button"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-200 hover:text-orange-100"
              >
                Read more <ExternalLink className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Members({ members }: { members: MemberItem[] }) {
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
            viewport={{ once: true, amount: 0.4 }}
            variants={variants}
            whileHover={{ y: -6, scale: 1.01, borderColor: 'rgba(251,146,60,0.25)' }}
            className="card p-4 space-y-3"
          >
            <img
              src={member.avatar}
              alt={member.name}
              className="w-full h-40 object-cover rounded-xl border border-white/5"
              loading="lazy"
            />
            <div>
              <h3 className="text-lg font-semibold text-white">{member.name}</h3>
              <p className="text-sm text-orange-200 font-semibold">{member.role}</p>
              <p className="text-sm text-slate-300 leading-relaxed mt-1">{member.bio}</p>
            </div>
            <div className="flex gap-3 text-slate-200">
              {member.socials.github && (
                <a href={member.socials.github} className="hover:text-orange-200" aria-label="GitHub">
                  <Github className="h-5 w-5" />
                </a>
              )}
              {member.socials.linkedin && (
                <a href={member.socials.linkedin} className="hover:text-orange-200" aria-label="LinkedIn">
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

function Contact() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      if (!supabase) {
        console.warn('Supabase not configured, skipping contact insert.');
        setStatus('sent');
        setForm({ name: '', email: '', message: '' });
        return;
      }

      const { error } = await supabase.from('contact_messages').insert([
        { name: form.name, email: form.email, message: form.message },
      ]);

      if (error) {
        console.error(error);
        setStatus('error');
        return;
      }

      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="max-w-6xl mx-auto px-4 py-16 space-y-8 scroll-mt-24">
      <SectionHeader
        eyebrow="Contact"
        title="Say hello or invite us"
        subtitle="Collaborations, workshops, or questions—drop us a note."
      />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="card p-6 space-y-4">
          <h3 className="text-xl font-semibold text-white">Visit our next meetup</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-300" /> PUP San Juan IT Building, Room 301
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-300" /> Fridays, 5:00 PM
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-300" /> awscloudclub.pupsj@gmail.com
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <a href="https://github.com" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-orange-300/40">
              <Github className="h-4 w-4" /> GitHub
            </a>
            <a href="https://linkedin.com" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-orange-300/40">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h3 className="text-xl font-semibold text-white">Send a message</h3>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white focus:outline-none focus:border-orange-400/60"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white focus:outline-none focus:border-orange-400/60"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <textarea
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white focus:outline-none focus:border-orange-400/60"
            placeholder="How can we help?"
            rows={4}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            required
          />
          <motion.button
            type="submit"
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            disabled={status === 'loading'}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 text-slate-950 font-semibold shadow-lg shadow-orange-500/30 transition disabled:opacity-70"
          >
            {status === 'loading' ? 'Sending...' : status === 'sent' ? 'Sent!' : 'Send message'}
          </motion.button>
          {status === 'error' && <p className="text-sm text-red-300">Something went wrong. Please try again.</p>}
          {status === 'sent' && <p className="text-sm text-green-300">Message sent. We’ll reply soon!</p>}
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950/80">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-400">
        <div className="flex items-center gap-3 text-white">
          <motion.div whileHover={{ scale: 1.05 }} className="h-8 w-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
            <Cloud className="h-5 w-5 text-orange-300" />
          </motion.div>
          <span>AWS Cloud Club · PUP San Juan</span>
        </div>
        <div className="flex gap-4 text-slate-300">
          <a href="#events" className="hover:text-orange-200">Events</a>
          <a href="#members" className="hover:text-orange-200">Team</a>
          <a href="#contact" className="hover:text-orange-200">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const scrollToSection = useScrollToSection();
  const [eventsData, setEventsData] = useState<EventItem[]>(events);
  const [membersData, setMembersData] = useState<MemberItem[]>(members);
  const [announcementsData, setAnnouncementsData] = useState<AnnouncementItem[]>(announcements);
  const [dataSource, setDataSource] = useState<'supabase' | 'mock'>('mock');

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) {
        setDataSource('mock');
        return;
      }

      try {
        const [eventsRes, membersRes, announcementsRes] = await Promise.all([
          supabase.from('events').select('*').order('event_date', { ascending: false }),
          supabase.from('members').select('*').order('name', { ascending: true }),
          supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        ]);

        let usedMock = false;

        if (!eventsRes.error && eventsRes.data) {
          const mapped = eventsRes.data.map((row: any) => ({
            title: row.title ?? 'Untitled event',
            description: row.description ?? '',
            date: formatDateLabel(row.event_date ?? row.date, row.event_time ?? row.time),
            location: row.location ?? 'TBA',
            tags: Array.isArray(row.tags)
              ? row.tags
              : typeof row.tags === 'string'
                ? row.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                : [],
          }));
          setEventsData(mapped.length ? mapped : events);
          usedMock = usedMock || mapped.length === 0;
        } else {
          console.warn('Using mock events due to error or empty data.', eventsRes.error);
          setEventsData(events);
          usedMock = true;
        }

        if (!membersRes.error && membersRes.data) {
          const mapped = membersRes.data.map((row: any) => ({
            name: row.name ?? 'Member',
            role: row.role ?? 'Member',
            bio: row.bio ?? '',
            avatar: row.avatar ?? row.image_url ?? '',
            socials: {
              github: row.github_link ?? row.github ?? undefined,
              linkedin: row.linkedin_link ?? row.linkedin ?? undefined,
            },
          }));
          setMembersData(mapped.length ? mapped : members);
          usedMock = usedMock || mapped.length === 0;
        } else {
          console.warn('Using mock members due to error or empty data.', membersRes.error);
          setMembersData(members);
          usedMock = true;
        }

        if (!announcementsRes.error && announcementsRes.data) {
          const mapped = announcementsRes.data.map((row: any) => ({
            title: row.title ?? 'Announcement',
            excerpt: row.excerpt ?? row.content ?? '',
            date: formatTimestamp(row.created_at ?? row.date) || '—',
            author: row.author ?? 'Team',
            image: row.image_url ?? row.image ?? undefined,
          }));
          setAnnouncementsData(mapped.length ? mapped : announcements);
          usedMock = usedMock || mapped.length === 0;
        } else {
          console.warn('Using mock announcements due to error or empty data.', announcementsRes.error);
          setAnnouncementsData(announcements);
          usedMock = true;
        }

        setDataSource(usedMock ? 'mock' : 'supabase');
      } catch (err) {
        console.error('Supabase fetch failed, using mock data.', err);
        setEventsData(events);
        setMembersData(members);
        setAnnouncementsData(announcements);
        setDataSource('mock');
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar onNavigate={scrollToSection} />
      <Hero onNavigate={scrollToSection} />
      <Highlights />
      <Events data={eventsData} />
      <CTA onNavigate={scrollToSection} />
      <Announcements onNavigate={scrollToSection} announcements={announcementsData} />
      <Members members={membersData} />
      <Contact />
      <Footer />
      <div className="fixed bottom-4 right-4 text-xs text-slate-400 bg-slate-900/80 border border-white/5 rounded-full px-3 py-1">
        Data source: {dataSource}
      </div>
    </div>
  );
}
