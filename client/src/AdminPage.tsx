import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { supabase } from './supabaseClient';

const STORAGE_BUCKET = (import.meta as any).env?.VITE_SUPABASE_STORAGE_BUCKET || 'public-images';

type SessionUser = { id: string; email?: string };

type TabKey = 'announcements' | 'events' | 'members' | 'highlights' | 'site_settings' | 'contact_messages';

type AnnouncementRow = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  author: string | null;
  image_url: string | null;
  image_focus_x: number | null;
  image_focus_y: number | null;
  created_at: string;
};

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  tags: string[] | null;
  image_url: string | null;
  image_focus_x: number | null;
  image_focus_y: number | null;
  created_at: string;
};

type MemberRow = {
  id: string;
  name: string;
  status: string | null;
  role: string | null;
  bio: string | null;
  avatar: string | null;
  image_url: string | null;
  avatar_focus_x: number | null;
  avatar_focus_y: number | null;
  github: string | null;
  github_link: string | null;
  linkedin: string | null;
  linkedin_link: string | null;
  created_at: string;
};

type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

type HighlightRow = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  sort_order: number | null;
  active: boolean | null;
  created_at: string;
};

type SiteSettingRow = {
  key: string;
  value: string;
};

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

function FocusPointField({
  label,
  x,
  y,
  onChangeX,
  onChangeY,
  imageUrl,
  disabled,
  previewClassName,
}: {
  label: string;
  x: number;
  y: number;
  onChangeX: (v: number) => void;
  onChangeY: (v: number) => void;
  imageUrl?: string;
  disabled?: boolean;
  previewClassName: string;
}) {
  const draggingRef = useRef(false);

  const updateFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    const nextX = Math.max(0, Math.min(100, relX * 100));
    const nextY = Math.max(0, Math.min(100, relY * 100));
    onChangeX(nextX);
    onChangeY(nextY);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-200 font-semibold">{label}</p>
        <p className="text-xs text-slate-400">{Math.round(x)}% {Math.round(y)}%</p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs text-slate-300">Focus X</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={x}
          disabled={disabled}
          onChange={(e) => onChangeX(Number(e.target.value))}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs text-slate-300">Focus Y</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={y}
          disabled={disabled}
          onChange={(e) => onChangeY(Number(e.target.value))}
        />
      </label>

      {imageUrl ? (
        <div
          className={classNames(
            'relative rounded-xl overflow-hidden border border-white/10 bg-slate-950/40 select-none touch-none',
            previewClassName,
          )}
          onPointerDown={(e) => {
            if (disabled) return;
            draggingRef.current = true;
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              // ignore
            }
            updateFromPointer(e);
          }}
          onPointerMove={(e) => {
            if (!draggingRef.current) return;
            updateFromPointer(e);
          }}
          onPointerUp={() => {
            draggingRef.current = false;
          }}
          onPointerCancel={() => {
            draggingRef.current = false;
          }}
          role="slider"
          aria-label={`${label} focus selector`}
        >
          <img
            src={imageUrl}
            alt="Preview"
            className="h-full w-full object-cover"
            style={{ objectPosition: `${x}% ${y}%` }}
            loading="lazy"
          />
          <div
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-orange-300/40 shadow"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
          <div
            className="absolute h-px w-10 bg-white/60 -translate-x-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
          <div
            className="absolute w-px h-10 bg-white/60 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        </div>
      ) : (
        <p className="text-xs text-slate-400">Upload or paste an image URL to preview the focus point.</p>
      )}

      {imageUrl && <p className="text-xs text-slate-400">Tip: click or drag on the preview to pick what stays visible.</p>}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-slate-200 font-semibold">{label}</span>
      <input
        className="w-full rounded-xl bg-slate-950/50 border border-white/10 px-3 py-2 text-slate-100 outline-none focus:border-orange-300/40"
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function sanitizeFilename(name: string) {
  const trimmed = (name || 'image').trim();
  const replaced = trimmed.replace(/[^a-zA-Z0-9._-]/g, '_');
  return replaced.length ? replaced : 'image';
}

function randomId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function UploadImageField({
  label,
  value,
  onChange,
  disabled,
  folder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  folder: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    if (!supabase) return;
    setUploading(true);
    setError(null);
    try {
      const safeName = sanitizeFilename(file.name);
      const path = `${folder}/${randomId()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type || undefined });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      const publicUrl = data?.publicUrl ?? '';
      if (!publicUrl) throw new Error('Could not get public URL');
      onChange(publicUrl);
    } catch (e: any) {
      setError(e?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <TextInput label={label} value={value} onChange={onChange} placeholder="https://..." />
      <div className="flex flex-wrap items-center gap-2">
        <label className={classNames('px-4 py-2 rounded-xl font-semibold border transition cursor-pointer',
          disabled || uploading
            ? 'bg-white/5 text-slate-400 border-white/10 cursor-not-allowed'
            : 'bg-white/10 text-white border-white/10 hover:bg-white/15')}
        >
          {uploading ? 'Uploading…' : 'Upload image'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled || uploading}
            onChange={async (e: ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              await upload(file);
            }}
          />
        </label>
        {value && (
          <a
            className="text-sm text-orange-200 underline"
            href={value}
            target="_blank"
            rel="noopener noreferrer"
          >
            Preview
          </a>
        )}
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-slate-200 font-semibold">{label}</span>
      <textarea
        className="w-full min-h-[110px] rounded-xl bg-slate-950/50 border border-white/10 px-3 py-2 text-slate-100 outline-none focus:border-orange-300/40"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  type,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type ?? 'button'}
      className={classNames(
        'px-4 py-2 rounded-xl font-semibold border transition',
        disabled
          ? 'bg-white/5 text-slate-400 border-white/10 cursor-not-allowed'
          : 'bg-orange-500/15 text-orange-100 border-orange-400/30 hover:bg-orange-500/20'
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={classNames(
        'px-4 py-2 rounded-xl font-semibold border transition',
        disabled
          ? 'bg-white/5 text-slate-400 border-white/10 cursor-not-allowed'
          : 'bg-white/5 text-slate-100 border-white/10 hover:bg-white/10'
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function formatTags(value: string) {
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-slate-200 font-semibold">{label}</span>
      <select
        className="w-full rounded-xl bg-slate-950/50 border border-white/10 px-3 py-2 text-slate-100 outline-none focus:border-orange-300/40"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<TabKey>('announcements');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [highlights, setHighlights] = useState<HighlightRow[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingRow[]>([]);
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);

  const canUseSupabase = !!supabase;

  const loadAdminStatus = useCallback(async (u: SessionUser | null) => {
    if (!supabase || !u) {
      setIsAdmin(false);
      return;
    }

    const { data, error } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', u.id)
      .maybeSingle();

    if (error) {
      setError(`Admin check failed: ${error.message}`);
      setIsAdmin(false);
      return;
    }

    setIsAdmin(!!data);
  }, []);

  const loadAll = useCallback(async () => {
    if (!supabase) return;

    const [aRes, eRes, mRes, hRes, sRes, cRes] = await Promise.all([
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('*').order('event_date', { ascending: false }),
      supabase.from('members').select('*').order('name', { ascending: true }),
      supabase.from('highlights').select('*').order('sort_order', { ascending: true }),
      supabase.from('site_settings').select('key,value').order('key', { ascending: true }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
    ]);

    if (!aRes.error && aRes.data) setAnnouncements(aRes.data as unknown as AnnouncementRow[]);
    if (!eRes.error && eRes.data) setEvents(eRes.data as unknown as EventRow[]);
    if (!mRes.error && mRes.data) setMembers(mRes.data as unknown as MemberRow[]);
    if (!hRes.error && hRes.data) setHighlights(hRes.data as unknown as HighlightRow[]);
    if (!sRes.error && sRes.data) setSiteSettings(sRes.data as unknown as SiteSettingRow[]);
    if (!cRes.error && cRes.data) setMessages(cRes.data as unknown as ContactMessageRow[]);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      const u = data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null;
      setUser(u);
      loadAdminStatus(u);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ? { id: session.user.id, email: session.user.email ?? undefined } : null;
      setUser(u);
      loadAdminStatus(u);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [loadAdminStatus]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadAll();
  }, [user, isAdmin, loadAll]);

  const header = useMemo(() => {
    const tabs: Array<{ key: TabKey; label: string }> = [
      { key: 'announcements', label: 'Announcements' },
      { key: 'events', label: 'Events' },
      { key: 'members', label: 'Members' },
      { key: 'highlights', label: 'Highlights' },
      { key: 'site_settings', label: 'Site settings' },
      { key: 'contact_messages', label: 'Contact messages' },
    ];

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Admin</h1>
            <p className="text-sm text-slate-300 mt-1">Manage website content stored in Supabase.</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="px-4 py-2 rounded-xl font-semibold border bg-white/5 text-slate-100 border-white/10 hover:bg-white/10">
              Back to site
            </a>
            <GhostButton
              onClick={async () => {
                if (!supabase) return;
                setBusy(true);
                setError(null);
                setNotice(null);
                try {
                  await supabase.auth.signOut();
                  setNotice('Signed out');
                } catch (e: any) {
                  setError(e?.message ?? 'Sign out failed');
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy}
            >
              Sign out
            </GhostButton>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={classNames(
                'px-4 py-2 rounded-xl font-semibold border transition',
                tab === t.key
                  ? 'bg-orange-500/15 text-orange-100 border-orange-400/30'
                  : 'bg-white/5 text-slate-100 border-white/10 hover:bg-white/10'
              )}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    );
  }, [busy, tab]);

  const inviteCard = useMemo(() => {
    if (!isAdmin) return null;

    return (
      <div className="card p-5 space-y-3">
        <h2 className="text-lg font-bold text-white">Invite admin</h2>
        <p className="text-sm text-slate-300">Send an email invite. The user will be promoted to admin after they accept and sign in.</p>

        <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
          <TextInput label="Email" value={inviteEmail} onChange={setInviteEmail} type="email" placeholder="name@domain.com" />
          <PrimaryButton
            disabled={busy || !inviteEmail.trim()}
            onClick={async () => {
              if (!supabase) return;
              setBusy(true);
              setError(null);
              setNotice(null);

              try {
                const { data: sessRes, error: sessErr } = await supabase.auth.getSession();
                if (sessErr) throw sessErr;
                const token = sessRes.session?.access_token;
                if (!token) throw new Error('Not signed in');

                const res = await fetch('/api/invite-admin', {
                  method: 'POST',
                  headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ email: inviteEmail.trim() }),
                });

                const json = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(json?.error ?? 'Invite failed');

                setInviteEmail('');
                setNotice(`Invite sent to ${json.invitedEmail ?? inviteEmail.trim()}`);
              } catch (e: any) {
                setError(e?.message ?? 'Invite failed');
              } finally {
                setBusy(false);
              }
            }}
          >
            Send invite
          </PrimaryButton>
        </div>
      </div>
    );
  }, [busy, inviteEmail, isAdmin]);

  const banner = (
    <div className="space-y-2">
      {error && <div className="card p-3 border border-red-500/30 bg-red-500/10 text-red-100">{error}</div>}
      {notice && <div className="card p-3 border border-green-500/30 bg-green-500/10 text-green-100">{notice}</div>}
    </div>
  );

  if (!canUseSupabase) {
    return (
      <div className="min-h-screen bg-glow-animated px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-white">Admin</h1>
            <p className="text-slate-300 mt-2">Supabase is not configured. Set the env vars and reload.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-glow-animated px-4 py-16">
        <div className="max-w-md mx-auto space-y-4">
          <div className="card p-6 space-y-4">
            <h1 className="text-2xl font-bold text-white">Admin sign in</h1>
            <p className="text-sm text-slate-300">Use an admin account. If you can sign in but can’t edit, you’re probably not in the admins list.</p>

            {banner}

            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!supabase) return;
                setBusy(true);
                setError(null);
                setNotice(null);
                try {
                  const { error } = await supabase.auth.signInWithPassword({ email, password });
                  if (error) throw error;
                  setNotice('Signed in');
                } catch (e: any) {
                  setError(e?.message ?? 'Sign in failed');
                } finally {
                  setBusy(false);
                }
              }}
            >
              <TextInput label="Email" value={email} onChange={setEmail} type="email" placeholder="admin@domain.com" />
              <TextInput label="Password" value={password} onChange={setPassword} type="password" />
              <PrimaryButton type="submit" disabled={busy || !email || !password}>
                Sign in
              </PrimaryButton>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-glow-animated px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="card p-6 space-y-2">
            <h1 className="text-2xl font-bold text-white">Access denied</h1>
            <p className="text-slate-300">Signed in as {user.email ?? user.id} but this user is not an admin.</p>
          </div>
          {banner}
          <GhostButton
            onClick={async () => {
              if (!supabase) return;
              setBusy(true);
              setError(null);
              try {
                await supabase.auth.signOut();
              } catch (e: any) {
                setError(e?.message ?? 'Sign out failed');
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
          >
            Sign out
          </GhostButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-glow-animated px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {header}
        {banner}
        {inviteCard}

        {tab === 'announcements' && (
          <AnnouncementsAdmin
            announcements={announcements}
            busy={busy}
            setBusy={setBusy}
            setError={setError}
            setNotice={setNotice}
            reload={loadAll}
          />
        )}

        {tab === 'events' && (
          <EventsAdmin
            events={events}
            busy={busy}
            setBusy={setBusy}
            setError={setError}
            setNotice={setNotice}
            reload={loadAll}
          />
        )}

        {tab === 'members' && (
          <MembersAdmin
            members={members}
            busy={busy}
            setBusy={setBusy}
            setError={setError}
            setNotice={setNotice}
            reload={loadAll}
          />
        )}

        {tab === 'highlights' && (
          <HighlightsAdmin
            highlights={highlights}
            busy={busy}
            setBusy={setBusy}
            setError={setError}
            setNotice={setNotice}
            reload={loadAll}
          />
        )}

        {tab === 'site_settings' && (
          <SiteSettingsAdmin
            settings={siteSettings}
            busy={busy}
            setBusy={setBusy}
            setError={setError}
            setNotice={setNotice}
            reload={loadAll}
          />
        )}

        {tab === 'contact_messages' && <ContactMessagesAdmin messages={messages} reload={loadAll} />}
      </div>
    </div>
  );
}

function getSetting(settings: SiteSettingRow[], key: string) {
  return settings.find((s) => s.key === key)?.value ?? '';
}

function SiteSettingsAdmin({
  settings,
  busy,
  setBusy,
  setError,
  setNotice,
  reload,
}: {
  settings: SiteSettingRow[];
  busy: boolean;
  setBusy: (v: boolean) => void;
  setError: (v: string | null) => void;
  setNotice: (v: string | null) => void;
  reload: () => Promise<void>;
}) {
  const [heroEyebrow, setHeroEyebrow] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroStat1Value, setHeroStat1Value] = useState('');
  const [heroStat1Label, setHeroStat1Label] = useState('');
  const [heroStat2Value, setHeroStat2Value] = useState('');
  const [heroStat2Label, setHeroStat2Label] = useState('');
  const [heroStat3Value, setHeroStat3Value] = useState('');
  const [heroStat3Label, setHeroStat3Label] = useState('');
  const [heroWorkshopLabel, setHeroWorkshopLabel] = useState('');
  const [heroWorkshopTitle, setHeroWorkshopTitle] = useState('');
  const [heroWorkshopPill, setHeroWorkshopPill] = useState('');
  const [heroWorkshopDescription, setHeroWorkshopDescription] = useState('');
  const [heroWorkshopDatetime, setHeroWorkshopDatetime] = useState('');
  const [heroWorkshopLocation, setHeroWorkshopLocation] = useState('');
  const [heroWorkshopCta, setHeroWorkshopCta] = useState('');
  const [contactMeetupLocation, setContactMeetupLocation] = useState('');
  const [contactMeetupSchedule, setContactMeetupSchedule] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactGithubUrl, setContactGithubUrl] = useState('');
  const [contactLinkedinUrl, setContactLinkedinUrl] = useState('');
  const [footerBrandText, setFooterBrandText] = useState('');

  useEffect(() => {
    setHeroEyebrow(getSetting(settings, 'hero_eyebrow'));
    setHeroTitle(getSetting(settings, 'hero_title'));
    setHeroSubtitle(getSetting(settings, 'hero_subtitle'));
    setHeroStat1Value(getSetting(settings, 'hero_stat1_value'));
    setHeroStat1Label(getSetting(settings, 'hero_stat1_label'));
    setHeroStat2Value(getSetting(settings, 'hero_stat2_value'));
    setHeroStat2Label(getSetting(settings, 'hero_stat2_label'));
    setHeroStat3Value(getSetting(settings, 'hero_stat3_value'));
    setHeroStat3Label(getSetting(settings, 'hero_stat3_label'));
    setHeroWorkshopLabel(getSetting(settings, 'hero_workshop_label'));
    setHeroWorkshopTitle(getSetting(settings, 'hero_workshop_title'));
    setHeroWorkshopPill(getSetting(settings, 'hero_workshop_pill'));
    setHeroWorkshopDescription(getSetting(settings, 'hero_workshop_description'));
    setHeroWorkshopDatetime(getSetting(settings, 'hero_workshop_datetime'));
    setHeroWorkshopLocation(getSetting(settings, 'hero_workshop_location'));
    setHeroWorkshopCta(getSetting(settings, 'hero_workshop_cta'));
    setContactMeetupLocation(getSetting(settings, 'contact_meetup_location'));
    setContactMeetupSchedule(getSetting(settings, 'contact_meetup_schedule'));
    setContactEmail(getSetting(settings, 'contact_email'));
    setContactGithubUrl(getSetting(settings, 'contact_github_url'));
    setContactLinkedinUrl(getSetting(settings, 'contact_linkedin_url'));
    setFooterBrandText(getSetting(settings, 'footer_brand_text'));
  }, [settings]);

  const save = async () => {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const rows: SiteSettingRow[] = [
        { key: 'hero_eyebrow', value: heroEyebrow },
        { key: 'hero_title', value: heroTitle },
        { key: 'hero_subtitle', value: heroSubtitle },
        { key: 'hero_stat1_value', value: heroStat1Value },
        { key: 'hero_stat1_label', value: heroStat1Label },
        { key: 'hero_stat2_value', value: heroStat2Value },
        { key: 'hero_stat2_label', value: heroStat2Label },
        { key: 'hero_stat3_value', value: heroStat3Value },
        { key: 'hero_stat3_label', value: heroStat3Label },
        { key: 'hero_workshop_label', value: heroWorkshopLabel },
        { key: 'hero_workshop_title', value: heroWorkshopTitle },
        { key: 'hero_workshop_pill', value: heroWorkshopPill },
        { key: 'hero_workshop_description', value: heroWorkshopDescription },
        { key: 'hero_workshop_datetime', value: heroWorkshopDatetime },
        { key: 'hero_workshop_location', value: heroWorkshopLocation },
        { key: 'hero_workshop_cta', value: heroWorkshopCta },
        { key: 'contact_meetup_location', value: contactMeetupLocation },
        { key: 'contact_meetup_schedule', value: contactMeetupSchedule },
        { key: 'contact_email', value: contactEmail },
        { key: 'contact_github_url', value: contactGithubUrl },
        { key: 'contact_linkedin_url', value: contactLinkedinUrl },
        { key: 'footer_brand_text', value: footerBrandText },
      ].map((r) => ({ key: r.key, value: (r.value ?? '').trim() }));

      const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
      if (error) throw error;
      setNotice('Site settings saved');
      await reload();
    } catch (e: any) {
      setError(e?.message ?? 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[520px_1fr] gap-6">
      <div className="card p-5 space-y-4">
        <h2 className="text-lg font-bold text-white">Site settings</h2>
        <TextInput label="Hero eyebrow" value={heroEyebrow} onChange={setHeroEyebrow} placeholder="Official AWS Student Club" />
        <TextInput label="Hero title" value={heroTitle} onChange={setHeroTitle} placeholder="Build cloud-first skills..." />
        <TextArea label="Hero subtitle" value={heroSubtitle} onChange={setHeroSubtitle} placeholder="Hands-on labs, study jams..." />
        <TextInput label="Hero stat 1 value" value={heroStat1Value} onChange={setHeroStat1Value} placeholder="120+" />
        <TextInput label="Hero stat 1 label" value={heroStat1Label} onChange={setHeroStat1Label} placeholder="Members" />
        <TextInput label="Hero stat 2 value" value={heroStat2Value} onChange={setHeroStat2Value} placeholder="12" />
        <TextInput label="Hero stat 2 label" value={heroStat2Label} onChange={setHeroStat2Label} placeholder="Events / sem" />
        <TextInput label="Hero stat 3 value" value={heroStat3Value} onChange={setHeroStat3Value} placeholder="6" />
        <TextInput label="Hero stat 3 label" value={heroStat3Label} onChange={setHeroStat3Label} placeholder="Cert mentors" />
        <TextInput label="Hero workshop label" value={heroWorkshopLabel} onChange={setHeroWorkshopLabel} placeholder="Next Workshop" />
        <TextInput label="Hero workshop title" value={heroWorkshopTitle} onChange={setHeroWorkshopTitle} placeholder="AWS Cloud Essentials" />
        <TextInput label="Hero workshop pill" value={heroWorkshopPill} onChange={setHeroWorkshopPill} placeholder="Feb 15" />
        <TextArea
          label="Hero workshop description"
          value={heroWorkshopDescription}
          onChange={setHeroWorkshopDescription}
          placeholder="Launch EC2, host static sites..."
        />
        <TextInput label="Hero workshop datetime" value={heroWorkshopDatetime} onChange={setHeroWorkshopDatetime} placeholder="Feb 15, 2:00 PM" />
        <TextInput label="Hero workshop location" value={heroWorkshopLocation} onChange={setHeroWorkshopLocation} placeholder="IT Building 301" />
        <TextInput label="Hero workshop CTA" value={heroWorkshopCta} onChange={setHeroWorkshopCta} placeholder="Save my slot" />
        <TextInput label="Meetup location" value={contactMeetupLocation} onChange={setContactMeetupLocation} placeholder="PUP San Juan..." />
        <TextInput label="Meetup schedule" value={contactMeetupSchedule} onChange={setContactMeetupSchedule} placeholder="Fridays, 5:00 PM" />
        <TextInput label="Contact email" value={contactEmail} onChange={setContactEmail} placeholder="awscloudclub@..." />
        <TextInput label="GitHub URL" value={contactGithubUrl} onChange={setContactGithubUrl} placeholder="https://github.com/..." />
        <TextInput label="LinkedIn URL" value={contactLinkedinUrl} onChange={setContactLinkedinUrl} placeholder="https://linkedin.com/..." />
        <TextInput label="Footer brand text" value={footerBrandText} onChange={setFooterBrandText} placeholder="AWS Cloud Club · PUP San Juan" />

        <div className="flex items-center gap-2">
          <PrimaryButton disabled={busy} onClick={save}>
            Save
          </PrimaryButton>
          <GhostButton disabled={busy} onClick={() => reload()}>
            Refresh
          </GhostButton>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-white font-semibold">Keys</h3>
        <p className="text-sm text-slate-300 mt-2">
          hero_eyebrow, hero_title, hero_subtitle
          <br />
          hero_stat1_value, hero_stat1_label, hero_stat2_value, hero_stat2_label, hero_stat3_value, hero_stat3_label
          <br />
          hero_workshop_label, hero_workshop_title, hero_workshop_pill, hero_workshop_description, hero_workshop_datetime, hero_workshop_location, hero_workshop_cta
          <br />
          contact_meetup_location, contact_meetup_schedule, contact_email
          <br />
          contact_github_url, contact_linkedin_url
          <br />
          footer_brand_text
        </p>
      </div>
    </div>
  );
}

function HighlightsAdmin({
  highlights,
  busy,
  setBusy,
  setError,
  setNotice,
  reload,
}: {
  highlights: HighlightRow[];
  busy: boolean;
  setBusy: (v: boolean) => void;
  setError: (v: string | null) => void;
  setNotice: (v: string | null) => void;
  reload: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<HighlightRow | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!editing) {
      setTitle('');
      setDescription('');
      setIcon('');
      setActive(true);
      return;
    }
    setTitle(editing.title ?? '');
    setDescription(editing.description ?? '');
    setIcon(editing.icon ?? '');
    setActive((editing.active ?? true) as boolean);
  }, [editing]);

  const save = async () => {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const maxOrder = highlights.reduce((acc, h) => Math.max(acc, h.sort_order ?? 0), 0);
      const payload = {
        title,
        description,
        icon: icon || null,
        active,
        sort_order: editing?.sort_order ?? maxOrder + 1,
      };

      if (editing) {
        const { error } = await supabase.from('highlights').update(payload).eq('id', editing.id);
        if (error) throw error;
        setNotice('Highlight updated');
      } else {
        const { error } = await supabase.from('highlights').insert([payload]);
        if (error) throw error;
        setNotice('Highlight created');
      }

      setEditing(null);
      await reload();
    } catch (e: any) {
      setError(e?.message ?? 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const move = async (id: string, dir: -1 | 1) => {
    if (!supabase) return;
    const current = highlights.find((h) => h.id === id);
    if (!current) return;
    const sorted = [...highlights].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const idx = sorted.findIndex((h) => h.id === id);
    const swapWith = sorted[idx + dir];
    if (!swapWith) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const aOrder = current.sort_order ?? 0;
      const bOrder = swapWith.sort_order ?? 0;
      const { error: e1 } = await supabase.from('highlights').update({ sort_order: bOrder }).eq('id', current.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from('highlights').update({ sort_order: aOrder }).eq('id', swapWith.id);
      if (e2) throw e2;
      await reload();
    } catch (e: any) {
      setError(e?.message ?? 'Reorder failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6">
      <div className="card p-5 space-y-4">
        <h2 className="text-lg font-bold text-white">{editing ? 'Edit highlight' : 'New highlight'}</h2>
        <TextInput label="Title" value={title} onChange={setTitle} />
        <TextArea label="Description" value={description} onChange={setDescription} />
        <TextInput label="Icon" value={icon} onChange={setIcon} placeholder="Cloud / Shield / Users / Sparkles" />
        <Select
          label="Active"
          value={active ? 'active' : 'inactive'}
          onChange={(v) => setActive(v === 'active')}
          options={[
            { value: 'active', label: 'Active (visible)' },
            { value: 'inactive', label: 'Inactive (hidden)' },
          ]}
        />

        <div className="flex items-center gap-2">
          <PrimaryButton disabled={busy || !title} onClick={save}>
            {editing ? 'Save' : 'Create'}
          </PrimaryButton>
          {editing && (
            <GhostButton disabled={busy} onClick={() => setEditing(null)}>
              Cancel
            </GhostButton>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {highlights
          .slice()
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((h, idx, arr) => (
            <div key={h.id} className="card p-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-white font-semibold truncate">{h.title}</h3>
                <p className="text-sm text-slate-300 mt-1 line-clamp-2">{h.description}</p>
                <p className="text-xs text-orange-200 font-semibold mt-2">Active: {(h.active ?? true) ? 'yes' : 'no'} · Order: {h.sort_order ?? 0}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <GhostButton disabled={busy || idx === 0} onClick={() => move(h.id, -1)}>
                  Up
                </GhostButton>
                <GhostButton disabled={busy || idx === arr.length - 1} onClick={() => move(h.id, 1)}>
                  Down
                </GhostButton>
                <GhostButton disabled={busy} onClick={() => setEditing(h)}>
                  Edit
                </GhostButton>
                <GhostButton
                  disabled={busy}
                  onClick={async () => {
                    if (!supabase) return;
                    const ok = window.confirm(`Delete highlight "${h.title}"? This cannot be undone.`);
                    if (!ok) return;
                    setBusy(true);
                    setError(null);
                    setNotice(null);
                    try {
                      const { error } = await supabase.from('highlights').delete().eq('id', h.id);
                      if (error) throw error;
                      setNotice('Highlight deleted');
                      if (editing?.id === h.id) setEditing(null);
                      await reload();
                    } catch (e: any) {
                      setError(e?.message ?? 'Delete failed');
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Delete
                </GhostButton>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function AnnouncementsAdmin({
  announcements,
  busy,
  setBusy,
  setError,
  setNotice,
  reload,
}: {
  announcements: AnnouncementRow[];
  busy: boolean;
  setBusy: (v: boolean) => void;
  setError: (v: string | null) => void;
  setNotice: (v: string | null) => void;
  reload: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<AnnouncementRow | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('Team');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFocusX, setImageFocusX] = useState(50);
  const [imageFocusY, setImageFocusY] = useState(50);

  useEffect(() => {
    if (!editing) {
      setTitle('');
      setAuthor('Team');
      setExcerpt('');
      setContent('');
      setImageUrl('');
      setImageFocusX(50);
      setImageFocusY(50);
      return;
    }
    setTitle(editing.title ?? '');
    setAuthor(editing.author ?? 'Team');
    setExcerpt(editing.excerpt ?? '');
    setContent(editing.content ?? '');
    setImageUrl(editing.image_url ?? '');
    setImageFocusX(editing.image_focus_x ?? 50);
    setImageFocusY(editing.image_focus_y ?? 50);
  }, [editing]);

  const save = async () => {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const payload = {
        title,
        author,
        excerpt: excerpt || null,
        content: content || null,
        image_url: imageUrl || null,
        image_focus_x: imageUrl ? imageFocusX : null,
        image_focus_y: imageUrl ? imageFocusY : null,
      };

      if (editing) {
        const { error } = await supabase.from('announcements').update(payload).eq('id', editing.id);
        if (error) throw error;
        setNotice('Announcement updated');
      } else {
        const { error } = await supabase.from('announcements').insert([payload]);
        if (error) throw error;
        setNotice('Announcement created');
      }

      setEditing(null);
      await reload();
    } catch (e: any) {
      setError(e?.message ?? 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6">
      <div className="card p-5 space-y-4">
        <h2 className="text-lg font-bold text-white">{editing ? 'Edit announcement' : 'New announcement'}</h2>
        <TextInput label="Title" value={title} onChange={setTitle} />
        <TextInput label="Author" value={author} onChange={setAuthor} />
        <UploadImageField
          label="Image URL"
          value={imageUrl}
          onChange={setImageUrl}
          disabled={busy}
          folder="announcements"
        />
        <FocusPointField
          label="Image focus"
          x={imageFocusX}
          y={imageFocusY}
          onChangeX={setImageFocusX}
          onChangeY={setImageFocusY}
          imageUrl={imageUrl}
          disabled={busy}
          previewClassName="h-36 w-full"
        />
        <TextArea label="Excerpt" value={excerpt} onChange={setExcerpt} />
        <TextArea label="Content" value={content} onChange={setContent} />

        <div className="flex items-center gap-2">
          <PrimaryButton disabled={busy || !title} onClick={save}>
            {editing ? 'Save' : 'Create'}
          </PrimaryButton>
          {editing && (
            <GhostButton
              disabled={busy}
              onClick={() => {
                setEditing(null);
              }}
            >
              Cancel
            </GhostButton>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="card p-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-white font-semibold truncate">{a.title}</h3>
              <p className="text-sm text-slate-300 mt-1 line-clamp-2">{a.excerpt ?? a.content ?? ''}</p>
              <p className="text-xs text-slate-400 mt-2">
                {a.author ?? 'Team'} · {new Date(a.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <GhostButton disabled={busy} onClick={() => setEditing(a)}>
                Edit
              </GhostButton>
              <GhostButton
                disabled={busy}
                onClick={async () => {
                  if (!supabase) return;
                  setBusy(true);
                  setError(null);
                  setNotice(null);
                  try {
                    const { error } = await supabase.from('announcements').delete().eq('id', a.id);
                    if (error) throw error;
                    setNotice('Announcement deleted');
                    if (editing?.id === a.id) setEditing(null);
                    await reload();
                  } catch (e: any) {
                    setError(e?.message ?? 'Delete failed');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Delete
              </GhostButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventsAdmin({
  events,
  busy,
  setBusy,
  setError,
  setNotice,
  reload,
}: {
  events: EventRow[];
  busy: boolean;
  setBusy: (v: boolean) => void;
  setError: (v: string | null) => void;
  setNotice: (v: string | null) => void;
  reload: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived' | 'cancelled'>('draft');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFocusX, setImageFocusX] = useState(50);
  const [imageFocusY, setImageFocusY] = useState(50);

  useEffect(() => {
    if (!editing) {
      setTitle('');
      setDescription('');
      setStatus('draft');
      setEventDate('');
      setEventTime('');
      setLocation('');
      setTags('');
      setImageUrl('');
      setImageFocusX(50);
      setImageFocusY(50);
      return;
    }

    setTitle(editing.title ?? '');
    setDescription(editing.description ?? '');
    setStatus((editing.status as any) ?? 'draft');
    setEventDate(editing.event_date ?? '');
    setEventTime(editing.event_time ?? '');
    setLocation(editing.location ?? '');
    setTags(Array.isArray(editing.tags) ? editing.tags.join(', ') : '');
    setImageUrl(editing.image_url ?? '');
    setImageFocusX(editing.image_focus_x ?? 50);
    setImageFocusY(editing.image_focus_y ?? 50);
  }, [editing]);

  const save = async () => {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const payload = {
        title,
        description: description || null,
        status,
        event_date: eventDate || null,
        event_time: eventTime || null,
        location: location || null,
        image_url: imageUrl || null,
        image_focus_x: imageUrl ? imageFocusX : null,
        image_focus_y: imageUrl ? imageFocusY : null,
        tags: tags ? formatTags(tags) : [],
      };

      if (editing) {
        const { error } = await supabase.from('events').update(payload).eq('id', editing.id);
        if (error) throw error;
        setNotice('Event updated');
      } else {
        const { error } = await supabase.from('events').insert([payload]);
        if (error) throw error;
        setNotice('Event created');
      }

      setEditing(null);
      await reload();
    } catch (e: any) {
      setError(e?.message ?? 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6">
      <div className="card p-5 space-y-4">
        <h2 className="text-lg font-bold text-white">{editing ? 'Edit event' : 'New event'}</h2>
        <TextInput label="Title" value={title} onChange={setTitle} />
        <Select
          label="Status"
          value={status}
          onChange={(v) => setStatus(v as any)}
          options={[
            { value: 'draft', label: 'Draft (hidden)' },
            { value: 'published', label: 'Published (visible)' },
            { value: 'archived', label: 'Archived' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
        <TextArea label="Description" value={description} onChange={setDescription} />
        <UploadImageField
          label="Image URL"
          value={imageUrl}
          onChange={setImageUrl}
          disabled={busy}
          folder="events"
        />
        <FocusPointField
          label="Image focus"
          x={imageFocusX}
          y={imageFocusY}
          onChangeX={setImageFocusX}
          onChangeY={setImageFocusY}
          imageUrl={imageUrl}
          disabled={busy}
          previewClassName="h-36 w-full"
        />
        <TextInput label="Event date (YYYY-MM-DD)" value={eventDate} onChange={setEventDate} placeholder="2026-02-07" />
        <TextInput label="Event time (HH:MM)" value={eventTime} onChange={setEventTime} placeholder="14:00" />
        <TextInput label="Location" value={location} onChange={setLocation} />
        <TextInput label="Tags (comma-separated)" value={tags} onChange={setTags} placeholder="EC2, S3, Lambda" />

        <div className="flex items-center gap-2">
          <PrimaryButton disabled={busy || !title} onClick={save}>
            {editing ? 'Save' : 'Create'}
          </PrimaryButton>
          {editing && (
            <GhostButton disabled={busy} onClick={() => setEditing(null)}>
              Cancel
            </GhostButton>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.id} className="card p-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-white font-semibold truncate">{e.title}</h3>
              <p className="text-sm text-slate-300 mt-1 line-clamp-2">{e.description ?? ''}</p>
              <p className="text-xs text-slate-400 mt-2">
                {(e.event_date ?? '—') + (e.event_time ? ` ${e.event_time}` : '')} · {e.location ?? 'TBA'}
              </p>
              <p className="text-xs text-orange-200 font-semibold mt-2">Status: {e.status ?? 'draft'}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <GhostButton disabled={busy} onClick={() => setEditing(e)}>
                Edit
              </GhostButton>
              <GhostButton
                disabled={busy}
                onClick={async () => {
                  if (!supabase) return;
                  setBusy(true);
                  setError(null);
                  setNotice(null);
                  try {
                    const { error } = await supabase.from('events').update({ status: 'archived' }).eq('id', e.id);
                    if (error) throw error;
                    setNotice('Event archived');
                    if (editing?.id === e.id) setEditing(null);
                    await reload();
                  } catch (err: any) {
                    setError(err?.message ?? 'Archive failed');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Archive
              </GhostButton>
              <GhostButton
                disabled={busy}
                onClick={async () => {
                  if (!supabase) return;
                  setBusy(true);
                  setError(null);
                  setNotice(null);
                  try {
                    const { error } = await supabase.from('events').update({ status: 'cancelled' }).eq('id', e.id);
                    if (error) throw error;
                    setNotice('Event cancelled');
                    if (editing?.id === e.id) setEditing(null);
                    await reload();
                  } catch (err: any) {
                    setError(err?.message ?? 'Cancel failed');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Cancel
              </GhostButton>
              <GhostButton
                disabled={busy}
                onClick={async () => {
                  if (!supabase) return;
                  const ok = window.confirm(`Delete event "${e.title}"? This cannot be undone.`);
                  if (!ok) return;
                  setBusy(true);
                  setError(null);
                  setNotice(null);
                  try {
                    const { error } = await supabase.from('events').delete().eq('id', e.id);
                    if (error) throw error;
                    setNotice('Event deleted');
                    if (editing?.id === e.id) setEditing(null);
                    await reload();
                  } catch (err: any) {
                    setError(err?.message ?? 'Delete failed');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Delete
              </GhostButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MembersAdmin({
  members,
  busy,
  setBusy,
  setError,
  setNotice,
  reload,
}: {
  members: MemberRow[];
  busy: boolean;
  setBusy: (v: boolean) => void;
  setError: (v: string | null) => void;
  setNotice: (v: string | null) => void;
  reload: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<MemberRow | null>(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFocusX, setAvatarFocusX] = useState(50);
  const [avatarFocusY, setAvatarFocusY] = useState(50);
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');

  useEffect(() => {
    if (!editing) {
      setName('');
      setStatus('active');
      setRole('');
      setBio('');
      setAvatar('');
      setAvatarFocusX(50);
      setAvatarFocusY(50);
      setGithub('');
      setLinkedin('');
      return;
    }

    setName(editing.name ?? '');
    setStatus((editing.status as any) ?? 'active');
    setRole(editing.role ?? '');
    setBio(editing.bio ?? '');
    setAvatar(editing.avatar ?? editing.image_url ?? '');
    setAvatarFocusX(editing.avatar_focus_x ?? 50);
    setAvatarFocusY(editing.avatar_focus_y ?? 50);
    setGithub(editing.github_link ?? editing.github ?? '');
    setLinkedin(editing.linkedin_link ?? editing.linkedin ?? '');
  }, [editing]);

  const save = async () => {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const payload = {
        name,
        status,
        role: role || null,
        bio: bio || null,
        avatar: avatar || null,
        avatar_focus_x: avatar ? avatarFocusX : null,
        avatar_focus_y: avatar ? avatarFocusY : null,
        github_link: github || null,
        linkedin_link: linkedin || null,
      };

      if (editing) {
        const { error } = await supabase.from('members').update(payload).eq('id', editing.id);
        if (error) throw error;
        setNotice('Member updated');
      } else {
        const { error } = await supabase.from('members').insert([payload]);
        if (error) throw error;
        setNotice('Member created');
      }

      setEditing(null);
      await reload();
    } catch (e: any) {
      setError(e?.message ?? 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6">
      <div className="card p-5 space-y-4">
        <h2 className="text-lg font-bold text-white">{editing ? 'Edit member' : 'New member'}</h2>
        <TextInput label="Name" value={name} onChange={setName} />
        <Select
          label="Status"
          value={status}
          onChange={(v) => setStatus(v as any)}
          options={[
            { value: 'active', label: 'Active (visible)' },
            { value: 'inactive', label: 'Inactive (hidden)' },
          ]}
        />
        <TextInput label="Role" value={role} onChange={setRole} />
        <TextArea label="Bio" value={bio} onChange={setBio} />
        <UploadImageField
          label="Avatar URL"
          value={avatar}
          onChange={setAvatar}
          disabled={busy}
          folder="members"
        />
        <FocusPointField
          label="Avatar focus"
          x={avatarFocusX}
          y={avatarFocusY}
          onChangeX={setAvatarFocusX}
          onChangeY={setAvatarFocusY}
          imageUrl={avatar}
          disabled={busy}
          previewClassName="h-40 w-full"
        />
        <TextInput label="GitHub URL" value={github} onChange={setGithub} placeholder="https://github.com/..." />
        <TextInput label="LinkedIn URL" value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/in/..." />

        <div className="flex items-center gap-2">
          <PrimaryButton disabled={busy || !name} onClick={save}>
            {editing ? 'Save' : 'Create'}
          </PrimaryButton>
          {editing && (
            <GhostButton disabled={busy} onClick={() => setEditing(null)}>
              Cancel
            </GhostButton>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.id} className="card p-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-white font-semibold truncate">{m.name}</h3>
              <p className="text-sm text-orange-200 font-semibold mt-1">{m.role ?? 'Member'}</p>
              <p className="text-sm text-slate-300 mt-2 line-clamp-2">{m.bio ?? ''}</p>
              <p className="text-xs text-orange-200 font-semibold mt-2">Status: {m.status ?? 'active'}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <GhostButton disabled={busy} onClick={() => setEditing(m)}>
                Edit
              </GhostButton>
              <GhostButton
                disabled={busy}
                onClick={async () => {
                  if (!supabase) return;
                  setBusy(true);
                  setError(null);
                  setNotice(null);
                  try {
                    const nextStatus = (m.status ?? 'active') === 'active' ? 'inactive' : 'active';
                    const { error } = await supabase.from('members').update({ status: nextStatus }).eq('id', m.id);
                    if (error) throw error;
                    setNotice(nextStatus === 'active' ? 'Member activated' : 'Member deactivated');
                    if (editing?.id === m.id) setEditing(null);
                    await reload();
                  } catch (e: any) {
                    setError(e?.message ?? 'Update failed');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {(m.status ?? 'active') === 'active' ? 'Deactivate' : 'Activate'}
              </GhostButton>
              <GhostButton
                disabled={busy}
                onClick={async () => {
                  if (!supabase) return;
                  const ok = window.confirm(`Delete member "${m.name}"? This cannot be undone.`);
                  if (!ok) return;
                  setBusy(true);
                  setError(null);
                  setNotice(null);
                  try {
                    const { error } = await supabase.from('members').delete().eq('id', m.id);
                    if (error) throw error;
                    setNotice('Member deleted');
                    if (editing?.id === m.id) setEditing(null);
                    await reload();
                  } catch (e: any) {
                    setError(e?.message ?? 'Delete failed');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Delete
              </GhostButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactMessagesAdmin({
  messages,
  reload,
}: {
  messages: ContactMessageRow[];
  reload: () => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Contact messages</h2>
        <GhostButton onClick={() => reload()}>Refresh</GhostButton>
      </div>

      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-white font-semibold truncate">{m.name}</p>
                <p className="text-sm text-slate-300 truncate">{m.email}</p>
              </div>
              <p className="text-xs text-slate-400">{new Date(m.created_at).toLocaleString()}</p>
            </div>
            <p className="text-sm text-slate-200 mt-3 whitespace-pre-wrap">{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
