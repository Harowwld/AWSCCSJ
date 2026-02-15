import { useEffect, useState, useCallback, useRef } from 'react';
import {
  highlights as mockHighlights,
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
  const [eventsData, setEventsData] = useState<EventItem[]>([]);
  const [highlightsData, setHighlightsData] = useState<HighlightItem[]>(mockHighlights);
  const [membersData, setMembersData] = useState<MemberItem[]>([]);
  const [announcementsData, setAnnouncementsData] = useState<AnnouncementItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const initialHash = useRef<string | null>(typeof window !== 'undefined' ? window.location.hash : null);

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) return;

      try {
        const [eventsRes, membersRes, announcementsRes, highlightsRes, settingsRes] = await Promise.all([
          supabase.from('events').select('*').eq('status', 'published').order('event_date', { ascending: false }),
          supabase.from('members').select('*').eq('status', 'active').order('name', { ascending: true }),
          supabase.from('announcements').select('*').order('created_at', { ascending: false }),
          supabase.from('highlights').select('*').eq('active', true).order('sort_order', { ascending: true }),
          supabase.from('site_settings').select('key,value'),
        ]);

        if (!eventsRes.error && eventsRes.data) {
          const mapped = eventsRes.data.map((row: any) => ({
            title: row.title ?? 'Untitled event',
            description: row.description ?? '',
            date: formatDateLabel(row.event_date ?? row.date, row.event_time ?? row.time),
            location: row.location ?? 'TBA',
            image: row.image_url ?? row.image ?? undefined,
            imageFocusX: typeof row.image_focus_x === 'number' ? row.image_focus_x : undefined,
            imageFocusY: typeof row.image_focus_y === 'number' ? row.image_focus_y : undefined,
            tags: Array.isArray(row.tags)
              ? row.tags
              : typeof row.tags === 'string'
                ? row.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                : [],
          }));
          setEventsData(mapped);
        }

        if (!membersRes.error && membersRes.data) {
          const mapped = membersRes.data.map((row: any) => ({
            name: row.name ?? 'Member',
            role: row.role ?? 'Member',
            bio: row.bio ?? '',
            avatar: row.avatar ?? row.image_url ?? '',
            avatarFocusX: typeof row.avatar_focus_x === 'number' ? row.avatar_focus_x : undefined,
            avatarFocusY: typeof row.avatar_focus_y === 'number' ? row.avatar_focus_y : undefined,
            socials: {
              github: row.github_link ?? row.github ?? undefined,
              linkedin: row.linkedin_link ?? row.linkedin ?? undefined,
            },
          }));
          setMembersData(mapped);
        }

        if (!announcementsRes.error && announcementsRes.data) {
          const mapped = announcementsRes.data.map((row: any) => ({
            title: row.title ?? 'Announcement',
            excerpt: row.excerpt ?? row.content ?? '',
            date: formatTimestamp(row.created_at ?? row.date) || '—',
            author: row.author ?? 'Team',
            image: row.image_url ?? row.image ?? undefined,
            imageFocusX: typeof row.image_focus_x === 'number' ? row.image_focus_x : undefined,
            imageFocusY: typeof row.image_focus_y === 'number' ? row.image_focus_y : undefined,
          }));
          setAnnouncementsData(mapped);
        }

        if (!highlightsRes.error && highlightsRes.data) {
          const mapped = highlightsRes.data.map((row: any) => ({
            title: row.title ?? 'Highlight',
            description: row.description ?? '',
            icon: row.icon ?? 'Sparkles',
          }));
          if (mapped.length) setHighlightsData(mapped);
        }

        if (!settingsRes.error && settingsRes.data) {
          const next: Record<string, string> = {};
          for (const row of settingsRes.data as any[]) {
            if (row?.key && typeof row.value === 'string') next[row.key] = row.value;
          }
          setSiteSettings(next);
        }
      } catch (err) {
        console.error('Supabase fetch failed.', err);
        setEventsData([]);
        setMembersData([]);
        setAnnouncementsData([]);
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
        <Hero
          onNavigate={scrollToSection}
          eyebrow={siteSettings.hero_eyebrow}
          title={siteSettings.hero_title}
          subtitle={siteSettings.hero_subtitle}
          stat1Value={siteSettings.hero_stat1_value}
          stat1Label={siteSettings.hero_stat1_label}
          stat2Value={siteSettings.hero_stat2_value}
          stat2Label={siteSettings.hero_stat2_label}
          stat3Value={siteSettings.hero_stat3_value}
          stat3Label={siteSettings.hero_stat3_label}
          workshopLabel={siteSettings.hero_workshop_label}
          workshopTitle={siteSettings.hero_workshop_title}
          workshopPill={siteSettings.hero_workshop_pill}
          workshopDescription={siteSettings.hero_workshop_description}
          workshopDateTime={siteSettings.hero_workshop_datetime}
          workshopLocation={siteSettings.hero_workshop_location}
          workshopCta={siteSettings.hero_workshop_cta}
        />
        <Highlights items={highlightsData} />
        <EventsSection data={eventsData} />
        <CTA onNavigate={scrollToSection} />
        <Announcements announcements={announcementsData} />
        <Members members={membersData} />
        <Contact
          meetupLocation={siteSettings.contact_meetup_location}
          meetupSchedule={siteSettings.contact_meetup_schedule}
          contactEmail={siteSettings.contact_email}
          githubUrl={siteSettings.contact_github_url}
          linkedinUrl={siteSettings.contact_linkedin_url}
        />
      </main>
      <Footer onNavigate={scrollToSection} brandText={siteSettings.footer_brand_text} />
    </div>
  );
}
