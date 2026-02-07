import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { SectionHeader } from './shared';

export default function Contact({
  meetupLocation,
  meetupSchedule,
  contactEmail,
  githubUrl,
  linkedinUrl,
}: {
  meetupLocation?: string;
  meetupSchedule?: string;
  contactEmail?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const locationLabel = meetupLocation ?? 'PUP San Juan IT Building, Room 301';
  const scheduleLabel = meetupSchedule ?? 'Fridays, 5:00 PM';
  const emailLabel = contactEmail ?? 'awscloudclub.pupsj@gmail.com';
  const githubHref = githubUrl ?? 'https://github.com';
  const linkedinHref = linkedinUrl ?? 'https://linkedin.com';

  const handleSubmit = async (e: FormEvent) => {
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
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 120, damping: 18 }}
        className="grid md:grid-cols-2 gap-8"
      >
        <div className="card p-6 space-y-4">
          <h3 className="text-xl font-semibold text-white">Visit our next meetup</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-300" /> {locationLabel}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-300" /> {scheduleLabel}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-300" /> {emailLabel}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <a
              href={githubHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-orange-300/40"
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
            <a
              href={linkedinHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-orange-300/40"
            >
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
      </motion.div>
    </section>
  );
}
