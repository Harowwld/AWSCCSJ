import { useEffect, useState, useCallback, useRef } from 'react';
import {
  announcements as mockAnnouncements,
  events as mockEvents,
  highlights as mockHighlights,
  members as mockMembers,
  type Announcement as AnnouncementItem,
  type Event as EventItem,
  type Highlight as HighlightItem,
  type Member as MemberItem,
} from './data';
import { supabase } from './supabaseClient';
import { formatDateLabel, formatTimestamp } from './utils/format';
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import Highlights from './sections/Highlights';
import EventsSection from './sections/EventsSection';
import CTA from './sections/CTA';
import Announcements from './sections/Announcements';
import Members from './sections/Members';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import './index.css';

type NavigateFn = (id: string, opts?: { replaceHash?: boolean }) => void;

function useScrollToSection(): NavigateFn {
  const animationRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }, []);

  return useCallback((id: string, opts?: { replaceHash?: boolean }) => {
    const el = document.getElementById(id);
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const headerEl = document.querySelector('header');
    const headerOffset = headerEl instanceof HTMLElement ? headerEl.offsetHeight + 8 : 80;
    const rect = el.getBoundingClientRect();
    const targetY = rect.top + window.scrollY - headerOffset;

    if (prefersReducedMotion) {
      window.scrollTo({ top: targetY, behavior: 'auto' });
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      const start = window.scrollY;
      const distance = targetY - start;
      const duration = 500;
      const startTime = performance.now();

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const step = (now: number) => {
        const elapsed = Math.min((now - startTime) / duration, 1);
        const eased = easeOutCubic(elapsed);
        window.scrollTo({ top: start + distance * eased });
        if (elapsed < 1) {
          animationRef.current = requestAnimationFrame(step);
        }
      };

      animationRef.current = requestAnimationFrame(step);
    }

    const replaceHash = opts?.replaceHash ?? true;
    if (replaceHash && window.location.hash !== `#${id}`) {
      history.replaceState(null, '', `#${id}`);
    }
  }, []);
}

export default function App() {
  const scrollToSection = useScrollToSection();
  const [eventsData, setEventsData] = useState<EventItem[]>(mockEvents);
  const [highlightsData] = useState<HighlightItem[]>(mockHighlights);
  const [membersData, setMembersData] = useState<MemberItem[]>(mockMembers);
  const [announcementsData, setAnnouncementsData] = useState<AnnouncementItem[]>(mockAnnouncements);
  const initialHash = useRef<string | null>(typeof window !== 'undefined' ? window.location.hash : null);

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) return;

      try {
        const [eventsRes, membersRes, announcementsRes] = await Promise.all([
          supabase.from('events').select('*').order('event_date', { ascending: false }),
          supabase.from('members').select('*').order('name', { ascending: true }),
          supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        ]);

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
          setEventsData(mapped.length ? mapped : mockEvents);
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
          setMembersData(mapped.length ? mapped : mockMembers);
        }

        if (!announcementsRes.error && announcementsRes.data) {
          const mapped = announcementsRes.data.map((row: any) => ({
            title: row.title ?? 'Announcement',
            excerpt: row.excerpt ?? row.content ?? '',
            date: formatTimestamp(row.created_at ?? row.date) || '—',
            author: row.author ?? 'Team',
            image: row.image_url ?? row.image ?? undefined,
          }));
          setAnnouncementsData(mapped.length ? mapped : mockAnnouncements);
        }
      } catch (err) {
        console.error('Supabase fetch failed, using mock data.', err);
        setEventsData(mockEvents);
        setMembersData(mockMembers);
        setAnnouncementsData(mockAnnouncements);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!initialHash.current) return;
    const id = initialHash.current.replace('#', '');
    if (!id) return;
    setTimeout(() => scrollToSection(id, { replaceHash: false }), 0);
  }, [scrollToSection]);

  return (
    <div className="relative isolate min-h-screen bg-slate-950 text-slate-50 bg-glow-animated flex flex-col pt-20 md:pt-24">
      <Navbar onNavigate={scrollToSection} />
      <main className="flex-1">
        <Hero onNavigate={scrollToSection} />
        <Highlights items={highlightsData} />
        <EventsSection data={eventsData} />
        <CTA onNavigate={scrollToSection} />
        <Announcements announcements={announcementsData} />
        <Members members={membersData} />
        <Contact />
      </main>
      <Footer onNavigate={scrollToSection} />
    </div>
  );
}
