import { type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileSearch,
  Fingerprint,
  FolderOpen,
  Globe2,
  Headphones,
  Info,
  LifeBuoy,
  LockKeyhole,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Network,
  Paperclip,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Siren,
  SlidersHorizontal,
  Sparkles,
  Tag,
  TimerReset,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, useRoute, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type Severity = 'Critical' | 'High' | 'Moderate' | 'Low';
type CaseStatus = 'New' | 'Investigating' | 'Awaiting reporter' | 'Resolved';
type CaseRecord = {
  id: string;
  title: string;
  type: string;
  severity: Severity;
  status: CaseStatus;
  reporter: string;
  organization: string;
  location: string;
  updated: string;
  summary: string;
  assigned: string;
  evidence: { time: string; label: string; description: string; kind: 'system' | 'person' | 'file' }[];
  notes: { author: string; time: string; text: string }[];
};

const initialCases: CaseRecord[] = [
  {
    id: 'CRC-4821',
    title: 'Invoice impersonation campaign',
    type: 'Online fraud',
    severity: 'High',
    status: 'Investigating',
    reporter: 'Mara Chen',
    organization: 'Northstar Housing Co-op',
    location: 'Bristol, UK',
    updated: '12 min ago',
    summary: 'Finance staff received a convincing supplier invoice with a changed bank account. One payment was released before the discrepancy was spotted.',
    assigned: 'A. Okafor',
    evidence: [
      { time: 'Today · 09:42', label: 'Report received', description: 'Initial report submitted by Mara Chen', kind: 'person' },
      { time: 'Today · 09:49', label: 'Evidence preserved', description: 'Email headers and original attachment added', kind: 'file' },
      { time: 'Today · 10:16', label: 'Analyst assigned', description: 'A. Okafor accepted the case', kind: 'system' },
    ],
    notes: [{ author: 'A. Okafor', time: '18 min ago', text: 'Payment bank has been contacted. Holding for transaction recall response.' }],
  },
  {
    id: 'CRC-4817',
    title: 'Suspicious account takeover',
    type: 'Account access',
    severity: 'Critical',
    status: 'New',
    reporter: 'Daniel Mensah',
    organization: 'Personal report',
    location: 'Leeds, UK',
    updated: '34 min ago',
    summary: 'Email and cloud storage account access was lost following a mobile number change request the reporter does not recognize.',
    assigned: 'Unassigned',
    evidence: [
      { time: 'Today · 09:18', label: 'Report received', description: 'Urgent account access report submitted', kind: 'person' },
      { time: 'Today · 09:21', label: 'Priority raised', description: 'Critical severity confirmed by triage', kind: 'system' },
    ],
    notes: [],
  },
  {
    id: 'CRC-4811',
    title: 'Ransomware disruption',
    type: 'Malware',
    severity: 'Critical',
    status: 'Investigating',
    reporter: 'Inez Walker',
    organization: 'Morrow & Vale Clinic',
    location: 'Glasgow, UK',
    updated: '1 hr ago',
    summary: 'Three workstations and a shared drive are unavailable. A ransom note was found after a weekend maintenance window.',
    assigned: 'S. Patel',
    evidence: [
      { time: 'Yesterday · 18:32', label: 'Report received', description: 'Incident reported by duty manager', kind: 'person' },
      { time: 'Yesterday · 19:05', label: 'Containment advised', description: 'Network isolation steps sent to reporter', kind: 'system' },
      { time: 'Today · 08:40', label: 'Forensic bundle added', description: 'Encrypted triage export preserved', kind: 'file' },
    ],
    notes: [{ author: 'S. Patel', time: '52 min ago', text: 'Requested exact ransom note text and last known clean backup timestamp.' }],
  },
  {
    id: 'CRC-4802',
    title: 'Exposed customer records',
    type: 'Data exposure',
    severity: 'High',
    status: 'Awaiting reporter',
    reporter: 'Owen Brooks',
    organization: 'Tideway Services',
    location: 'Manchester, UK',
    updated: '2 hrs ago',
    summary: 'A public storage bucket appears to contain customer contact details and service records. Scope is not yet confirmed.',
    assigned: 'J. Lewis',
    evidence: [
      { time: 'Yesterday · 15:04', label: 'Report received', description: 'Potential public exposure reported', kind: 'person' },
      { time: 'Yesterday · 15:34', label: 'Clarification requested', description: 'Requested URL and discovery timestamp', kind: 'system' },
    ],
    notes: [],
  },
  {
    id: 'CRC-4796',
    title: 'Harassing messages and doxxing',
    type: 'Online abuse',
    severity: 'Moderate',
    status: 'Resolved',
    reporter: 'Priya Shah',
    organization: 'Personal report',
    location: 'Cardiff, UK',
    updated: 'Yesterday',
    summary: 'Repeated threatening messages were sent across two platforms and included a home address. Platforms and local police have been contacted.',
    assigned: 'R. Bennett',
    evidence: [
      { time: 'Mon · 13:04', label: 'Report received', description: 'Message screenshots and platform links submitted', kind: 'person' },
      { time: 'Tue · 11:22', label: 'Closed', description: 'Reporter confirmed safety plan in place', kind: 'system' },
    ],
    notes: [{ author: 'R. Bennett', time: 'Yesterday', text: 'Closed with consent after platform escalation and local safeguarding referral.' }],
  },
];

const severityStyles: Record<Severity, string> = {
  Critical: 'bg-[#f9e0dc] text-[#a33a2f] border-[#efb9b1]',
  High: 'bg-[#fff0c7] text-[#806000] border-[#efd78b]',
  Moderate: 'bg-[#dcefea] text-[#246b61] border-[#b7ddd4]',
  Low: 'bg-[#e1e8ef] text-[#486276] border-[#c4d2de]',
};

const statusStyles: Record<CaseStatus, string> = {
  New: 'bg-[#e6eef8] text-[#315b7e] border-[#bfd1e4]',
  Investigating: 'bg-[#fff0c7] text-[#806000] border-[#efd78b]',
  'Awaiting reporter': 'bg-[#ece6f3] text-[#67527f] border-[#d8cae8]',
  Resolved: 'bg-[#dcefea] text-[#246b61] border-[#b7ddd4]',
};

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3" data-testid="brand-logo">
      <span className={`grid h-10 w-10 place-items-center rounded-[13px] ${dark ? 'bg-[#e6bd48] text-[#162c3d]' : 'bg-[#1f536d] text-[#f5d46b]'}`}>
        <ShieldCheck size={22} strokeWidth={2.1} />
      </span>
      <span className={`leading-none ${dark ? 'text-[#f4f4ed]' : 'text-[#193447]'}`}>
        <span className="block text-[13px] font-bold tracking-[.13em]">CYBERCRIME</span>
        <span className="mt-1 block text-[11px] tracking-[.25em] opacity-70">RESPONSE CENTER</span>
      </span>
    </div>
  );
}

function PublicHeader() {
  const [location] = useLocation();
  return (
    <header className="relative z-20 border-b border-[#cddbdd] bg-[#f1f6f4]/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" data-testid="link-home"><Logo /></Link>
        <nav className="hidden items-center gap-7 text-[13px] font-semibold text-[#4e6874] md:flex" aria-label="Main navigation">
          <Link href="/" className={location === '/' ? 'text-[#1f536d]' : 'hover:text-[#1f536d]'} data-testid="link-overview">Service overview</Link>
          <Link href="/report" className={location === '/report' ? 'text-[#1f536d]' : 'hover:text-[#1f536d]'} data-testid="link-report">Report an incident</Link>
          <a href="#guidance" className="hover:text-[#1f536d]" data-testid="link-guidance">Guidance</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="hidden items-center gap-2 rounded-full border border-[#b8cdd0] px-4 py-2 text-[12px] font-bold text-[#1f536d] transition hover:bg-[#e3eeeb] sm:flex" data-testid="link-analyst">
            <BriefcaseBusiness size={14} /> Analyst desk
          </Link>
          <Link href="/report" className="rounded-full bg-[#1f536d] px-4 py-2.5 text-[12px] font-bold text-[#f6f7ee] transition hover:bg-[#153e53]" data-testid="button-header-report">Report incident</Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#cddbdd] bg-[#e6efeb]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-8 text-sm text-[#57707a] md:flex-row md:items-center md:justify-between lg:px-8">
        <div><Logo /><p className="mt-3 max-w-sm text-[12px] leading-relaxed">A public safety service for clear, accountable cyber incident response.</p></div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] font-semibold"><a href="#guidance">Evidence guidance</a><a href="#service">Service status</a><a href="#accessibility">Accessibility</a></div>
        <p className="font-mono text-[10px] uppercase tracking-[.16em]">CRC / v1.0 · Always on</p>
      </div>
    </footer>
  );
}

function StatusPill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] ${className}`}>{children}</span>;
}

function Home() {
  return (
    <div className="min-h-[100dvh] bg-[#f1f6f4] text-[#203946]">
      <PublicHeader />
      <main>
        <section className="grid-signal relative overflow-hidden border-b border-[#cddbdd]">
          <div className="mx-auto grid max-w-[1240px] gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
            <div className="rise-in">
              <div className="mb-7 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.16em] text-[#467582]"><span className="status-pulse h-2 w-2 rounded-full bg-[#e2b638]" /> Service available · response desk online</div>
              <h1 className="max-w-[680px] text-[clamp(3.1rem,7vw,6.4rem)] font-bold leading-[.92] tracking-[-.07em] text-[#173649]">When something feels wrong, <em className="font-serif font-normal text-[#a15b3a]">start here.</em></h1>
              <p className="mt-8 max-w-[560px] text-[17px] leading-8 text-[#57707a]">The Cybercrime Response Center helps people and organizations report digital incidents, preserve what matters, and take the next right step — without the jargon.</p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/report" className="group inline-flex items-center gap-3 rounded-full bg-[#1f536d] px-6 py-3.5 text-sm font-bold text-[#f4f5ee] shadow-[0_10px_24px_rgba(31,83,109,.16)] transition hover:-translate-y-0.5 hover:bg-[#163e52]" data-testid="button-start-report">Start an incident report <ArrowRight size={16} className="transition group-hover:translate-x-1" /></Link>
                <a href="#guidance" className="inline-flex items-center gap-2 px-2 py-3 text-sm font-bold text-[#315d6c]" data-testid="link-first-steps">I need first steps <ArrowDownMark /></a>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-[#c8d8d8] pt-5 text-[11px] font-bold uppercase tracking-[.1em] text-[#6b8287]"><span className="flex items-center gap-2"><LockKeyhole size={14} /> Confidential by default</span><span className="flex items-center gap-2"><Clock3 size={14} /> 24/7 intake</span></div>
            </div>
            <div className="scanline relative min-h-[400px] overflow-hidden rounded-[28px] bg-[#173649] p-6 text-[#dbeae6] shadow-[0_24px_70px_rgba(31,83,109,.18)] lg:min-h-[500px] lg:p-8">
              <div className="absolute inset-0 opacity-35" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #e2b638 0 1px, transparent 1.5px), radial-gradient(circle at 70% 63%, #6ca0a4 0 1px, transparent 1.5px)', backgroundSize: '44px 44px, 57px 57px' }} />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.22em] text-[#e6bd48]">Live response desk</p><p className="mt-2 text-lg font-bold">A clear signal in the noise.</p></div><span className="rounded-lg border border-[#557481] p-2"><Network size={17} className="text-[#e6bd48]" /></span></div>
                <div className="my-10 flex items-center gap-4"><div className="h-20 w-20 rounded-full border border-[#e6bd48]/50 p-3"><div className="grid h-full place-items-center rounded-full bg-[#e6bd48] text-[#173649]"><Siren size={30} /></div></div><div className="signal-line flex-1"><div className="relative z-10 flex justify-between text-[10px] font-mono uppercase tracking-[.14em] text-[#9fbdbe]"><span>Report</span><span>Preserve</span><span>Respond</span></div></div></div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><SignalStat value="2m" label="average intake" /><SignalStat value="24/7" label="secure reporting" /><SignalStat value="0" label="wrong questions" /></div>
                <div className="mt-5 flex items-center gap-2 border-t border-[#385b6b] pt-4 text-[11px] text-[#a9c4c2]"><CheckCircle2 size={14} className="text-[#e6bd48]" /> You do not need to know exactly what happened to begin.</div>
              </div>
            </div>
          </div>
        </section>
        <section id="service" className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#a15b3a]">The first 30 minutes</p><h2 className="mt-4 text-4xl font-bold leading-tight tracking-[-.045em] text-[#173649]">Panic is data.<br />Let’s make it useful.</h2></div><div className="grid gap-4 sm:grid-cols-3"><ServiceCard n="01" icon={<ClipboardCheck />} title="Tell us what happened" body="A short, guided intake creates a usable incident record — even when details are still emerging." /><ServiceCard n="02" icon={<Fingerprint />} title="Preserve the signal" body="We show you what to save, what not to touch, and how to keep a trustworthy timeline." /><ServiceCard n="03" icon={<LifeBuoy />} title="Know your next move" body="Get clear actions, ownership, and a case reference you can return to as things develop." /></div></div>
        </section>
        <section id="guidance" className="border-y border-[#cddbdd] bg-[#e6efeb]"><div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[1fr_1.2fr] lg:px-8 lg:py-20"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#467582]">Before you report</p><h2 className="mt-4 text-4xl font-bold tracking-[-.05em] text-[#173649]">Do these three things first.</h2><p className="mt-4 max-w-md leading-7 text-[#57707a]">Small actions can protect evidence and limit further harm. If there is immediate physical danger, contact emergency services first.</p></div><div className="divide-y divide-[#c2d5d2]">{[['01', 'Do not delete or forward', 'Keep suspicious messages, files, and links exactly as you found them.'], ['02', 'Secure the account', 'Change passwords from a trusted device and turn on multi-factor authentication.'], ['03', 'Write down the sequence', 'Capture dates, times, names, amounts, and what you noticed first.']].map(([n, title, body]) => <div className="flex gap-5 py-5 first:pt-0 last:pb-0" key={n}><span className="font-mono text-xs text-[#a15b3a]">{n}</span><div><h3 className="font-bold text-[#244a5c]">{title}</h3><p className="mt-1 text-sm leading-6 text-[#648087]">{body}</p></div></div>)}</div></div></section>
        <section className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8 lg:py-24"><div className="rounded-[28px] bg-[#1f536d] px-6 py-10 text-[#f2f5ee] lg:flex lg:items-center lg:justify-between lg:px-12"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#e6bd48]">No account needed</p><h2 className="mt-3 text-3xl font-bold tracking-[-.04em]">You can begin with what you know.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#bed3d1]">Reports are handled by a trained response team. Your case reference lets you come back with more information later.</p></div><Link href="/report" className="mt-7 inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#e6bd48] px-6 py-3.5 text-sm font-bold text-[#173649] transition hover:bg-[#f3d97d] lg:mt-0" data-testid="button-cta-report">Begin secure report <ArrowUpRight size={16} /></Link></div></section>
      </main><Footer />
    </div>
  );
}

function ArrowDownMark() { return <span aria-hidden="true" className="text-lg">↓</span>; }
function SignalStat({ value, label }: { value: string; label: string }) { return <div className="rounded-xl border border-[#385b6b] bg-[#1d4053]/70 p-3"><p className="font-mono text-xl font-bold text-[#e6bd48]">{value}</p><p className="mt-1 text-[10px] uppercase tracking-[.08em] text-[#9fbdbe]">{label}</p></div>; }
function ServiceCard({ n, icon, title, body }: { n: string; icon: ReactNode; title: string; body: string }) { return <div className="rounded-2xl border border-[#cfdddd] bg-[#f8faf5] p-5 transition hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(31,83,109,.08)]"><div className="flex items-center justify-between text-[#1f536d]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#dfeee9]">{icon}</span><span className="font-mono text-xs text-[#a15b3a]">{n}</span></div><h3 className="mt-7 font-bold text-[#244a5c]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#648087]">{body}</p></div>; }

function ReportPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [type, setType] = useState('');
  const [impact, setImpact] = useState('');
  const [details, setDetails] = useState('');
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [ack, setAck] = useState(false);
  const [reportId] = useState(() => `CRC-${Math.floor(4900 + Math.random() * 90)}`);
  const canNext = (step === 1 && type) || (step === 2 && impact && details.length > 12) || (step === 3 && contact.name && contact.email);
  if (submitted) return <div className="min-h-[100dvh] bg-[#f1f6f4] text-[#203946]"><PublicHeader /><main className="mx-auto max-w-[800px] px-5 py-16 lg:py-24"><div className="rounded-[28px] border border-[#c8dcd6] bg-[#f8faf5] p-7 text-center shadow-[0_18px_50px_rgba(31,83,109,.08)] lg:p-14"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#dcefea] text-[#246b61]"><Check size={30} /></div><p className="mt-7 font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#467582]">Report received</p><h1 className="mt-3 text-4xl font-bold tracking-[-.05em] text-[#173649]">You’ve made the first move.</h1><p className="mx-auto mt-4 max-w-lg leading-7 text-[#57707a]">Your report is safely recorded. Keep this reference — you can use it if you need to add evidence or speak to the response team.</p><div className="mx-auto mt-8 max-w-sm rounded-2xl bg-[#e6efeb] p-5"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#648087]">Case reference</p><p className="mt-2 font-mono text-2xl font-bold tracking-[.08em] text-[#1f536d]" data-testid="text-report-reference">{reportId}</p></div><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/" className="rounded-full border border-[#b8cdd0] px-5 py-3 text-sm font-bold text-[#315d6c]" data-testid="link-back-home">Back to response center</Link><button onClick={() => { setSubmitted(false); setStep(1); }} className="rounded-full bg-[#1f536d] px-5 py-3 text-sm font-bold text-white" data-testid="button-new-report">Report another incident</button></div></div></main><Footer /></div>;
  const stepNames = ['Incident', 'Impact & detail', 'Your contact', 'Review'];
  return <div className="min-h-[100dvh] bg-[#f1f6f4] text-[#203946]"><PublicHeader /><main className="mx-auto max-w-[1080px] px-5 py-10 lg:px-8 lg:py-16"><div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><Link href="/" className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-[#467582]" data-testid="link-report-back"><ArrowLeft size={14} /> Response center</Link><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#a15b3a]">Secure incident intake</p><h1 className="mt-3 text-4xl font-bold tracking-[-.055em] text-[#173649] lg:text-5xl">Tell us what happened.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#57707a]">You can pause at any point. Nothing is submitted until you review and confirm.</p></div><div className="flex items-center gap-2 text-right text-[11px] font-bold text-[#648087]"><LockKeyhole size={15} className="text-[#1f536d]" /> Encrypted intake</div></div><div className="mb-10 flex items-center gap-0" aria-label="Report progress">{stepNames.map((name, i) => { const n = i + 1; return <div className="flex flex-1 items-center" key={name}><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${n <= step ? 'border-[#1f536d] bg-[#1f536d] text-white' : 'border-[#b8cdd0] bg-transparent text-[#648087]'}`}>{n < step ? <Check size={14} /> : n}</div><span className={`ml-2 hidden text-[11px] font-bold sm:block ${n === step ? 'text-[#1f536d]' : 'text-[#799096]'}`}>{name}</span>{n < 4 && <div className={`mx-3 h-px flex-1 ${n < step ? 'bg-[#1f536d]' : 'bg-[#cbdad8]'}`} />}</div>; })}</div><div className="grid gap-8 lg:grid-cols-[1fr_290px]"><div className="rounded-[24px] border border-[#c8dcd6] bg-[#f8faf5] p-6 shadow-[0_15px_45px_rgba(31,83,109,.06)] lg:p-9">{step === 1 && <ReportIncidentStep type={type} setType={setType} />}{step === 2 && <ReportImpactStep impact={impact} setImpact={setImpact} details={details} setDetails={setDetails} />}{step === 3 && <ReportContactStep contact={contact} setContact={setContact} />}{step === 4 && <ReportReview type={type} impact={impact} details={details} contact={contact} ack={ack} setAck={setAck} /> }<div className="mt-9 flex justify-between border-t border-[#d6e2df] pt-6"><button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-[#57707a] disabled:invisible" data-testid="button-report-back"><ArrowLeft size={15} /> Back</button>{step < 4 ? <button onClick={() => setStep(step + 1)} disabled={!canNext} className="inline-flex items-center gap-2 rounded-full bg-[#1f536d] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-report-next">Continue <ArrowRight size={15} /></button> : <button onClick={() => setSubmitted(true)} disabled={!ack} className="inline-flex items-center gap-2 rounded-full bg-[#a15b3a] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-submit-report"><Send size={15} /> Submit report</button>}</div></div><aside className="h-fit rounded-2xl border border-[#cfdddd] bg-[#e6efeb] p-5"><div className="flex items-center gap-2 text-[#1f536d]"><Info size={16} /><h2 className="text-sm font-bold">A note on urgency</h2></div><p className="mt-3 text-xs leading-6 text-[#57707a]">If someone is in immediate physical danger, contact emergency services first. This service is for digital incidents and online harm.</p><div className="mt-5 border-t border-[#c7d9d5] pt-4 text-[11px] leading-5 text-[#648087]"><strong className="text-[#315d6c]">What happens next?</strong><br />A trained analyst reviews your report and may contact you for clarification.</div></aside></div></main></div>;
}

function ReportIncidentStep({ type, setType }: { type: string; setType: (v: string) => void }) { const options = [['Account access', 'Someone accessed, locked, or impersonated an account', <UserRound />], ['Fraud or scam', 'Money, payment details, or identity involved', <Tag />], ['Malware or ransomware', 'Device, system, or network is affected', <Zap />], ['Online abuse or threats', 'Harassment, threats, or personal information shared', <MessageSquareText />], ['Data exposure', 'Information may have been accessed or published', <FolderOpen />], ['Something else', 'I’m not sure which category fits', <MoreHorizontal />]]; return <div><StepHeading n="01" title="What kind of incident is this?" body="Choose the closest match. You can add nuance in the next step." /><div className="grid gap-3 sm:grid-cols-2">{options.map(([name, desc, icon]) => <button key={name as string} onClick={() => setType(name as string)} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${type === name ? 'border-[#1f536d] bg-[#e6efeb] ring-2 ring-[#1f536d]/10' : 'border-[#cfdddd] hover:border-[#8caeb2] hover:bg-[#f2f7f3]'}`} data-testid={`option-incident-${String(name).toLowerCase().replaceAll(' ', '-')}`}><span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${type === name ? 'bg-[#1f536d] text-[#e6bd48]' : 'bg-[#e6efeb] text-[#467582]'}`}>{icon}</span><span><strong className="block text-sm text-[#315d6c]">{name}</strong><span className="mt-1 block text-xs leading-5 text-[#71868b]">{desc}</span></span></button>)}</div></div>; }
function StepHeading({ n, title, body }: { n: string; title: string; body: string }) { return <div className="mb-7"><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#a15b3a]">Step {n}</p><h2 className="mt-2 text-2xl font-bold tracking-[-.04em] text-[#173649]">{title}</h2><p className="mt-2 text-sm text-[#648087]">{body}</p></div>; }
function ReportImpactStep({ impact, setImpact, details, setDetails }: { impact: string; setImpact: (v: string) => void; details: string; setDetails: (v: string) => void }) { return <div><StepHeading n="02" title="What is the impact right now?" body="Don’t worry about being exact. Your best estimate helps us triage." /><div className="mb-7 grid gap-3 sm:grid-cols-3">{['I’m safe, no loss', 'Some loss or disruption', 'Urgent or ongoing harm'].map(x => <button key={x} onClick={() => setImpact(x)} className={`rounded-xl border px-3 py-3 text-left text-xs font-bold ${impact === x ? 'border-[#1f536d] bg-[#e6efeb] text-[#1f536d]' : 'border-[#cfdddd] text-[#648087]'}`} data-testid={`option-impact-${x.slice(0, 4).toLowerCase()}`}>{x}</button>)}</div><label className="block text-sm font-bold text-[#315d6c]" htmlFor="incident-details">What happened?</label><textarea id="incident-details" value={details} onChange={e => setDetails(e.target.value)} placeholder="Include what you noticed, when it started, and anything you have already done." className="mt-2 min-h-[170px] w-full resize-y rounded-xl border border-[#bdcfce] bg-[#fbfcf8] p-4 text-sm text-[#244a5c] outline-none transition placeholder:text-[#93a4a5] focus:border-[#1f536d] focus:ring-2 focus:ring-[#1f536d]/10" data-testid="input-incident-details" /><p className="mt-2 text-right text-[11px] text-[#829496]">{details.length} characters</p></div>; }
function ReportContactStep({ contact, setContact }: { contact: { name: string; email: string; phone: string }; setContact: (v: { name: string; email: string; phone: string }) => void }) { return <div><StepHeading n="03" title="How can we reach you?" body="A response analyst may need to ask a follow-up question. We will not publish your details." /><div className="space-y-5">{[['name', 'Your name', 'e.g. Alex Morgan'], ['email', 'Email address', 'e.g. alex@example.org'], ['phone', 'Phone number (optional)', 'e.g. +44 7700 900 123']].map(([key, label, placeholder]) => <label className="block text-sm font-bold text-[#315d6c]" key={key} htmlFor={`contact-${key}`}>{label}<input id={`contact-${key}`} type={key === 'email' ? 'email' : 'text'} value={contact[key as keyof typeof contact]} onChange={e => setContact({ ...contact, [key]: e.target.value })} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-[#bdcfce] bg-[#fbfcf8] px-4 py-3 text-sm font-normal text-[#244a5c] outline-none placeholder:text-[#93a4a5] focus:border-[#1f536d] focus:ring-2 focus:ring-[#1f536d]/10" data-testid={`input-contact-${key}`} /></label>)}</div></div>; }
function ReportReview({ type, impact, details, contact, ack, setAck }: { type: string; impact: string; details: string; contact: { name: string; email: string; phone: string }; ack: boolean; setAck: (v: boolean) => void }) { return <div><StepHeading n="04" title="Check before you send" body="Your report will be routed to the response desk when you confirm." /><div className="space-y-3">{[['Incident type', type], ['Current impact', impact], ['Your details', details], ['Contact', `${contact.name} · ${contact.email}`]].map(([label, value]) => <div className="rounded-xl bg-[#e6efeb] p-4" key={label}><p className="font-mono text-[9px] font-bold uppercase tracking-[.16em] text-[#799096]">{label}</p><p className="mt-1 text-sm leading-6 text-[#315d6c]">{value}</p></div>)}</div><label className="mt-6 flex cursor-pointer gap-3 rounded-xl border border-[#cfdddd] p-4"><input type="checkbox" checked={ack} onChange={e => setAck(e.target.checked)} className="mt-1 h-4 w-4 accent-[#1f536d]" data-testid="checkbox-evidence-ack" /><span className="text-xs leading-5 text-[#57707a]">I understand that I should keep original messages, files, and devices unchanged where possible, and that this report is for cyber incidents and online harm.</span></label></div>; }

function AnalystShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [{ href: '/dashboard', label: 'Overview', icon: <Network size={17} /> }, { href: '/dashboard', label: 'Case queue', icon: <FolderOpen size={17} /> }, { href: '/report', label: 'New intake', icon: <Plus size={17} /> }];
  return <div className="min-h-[100dvh] bg-[#edf3f0] text-[#203946]"><aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-[#173649] px-4 py-5 transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}><div className="px-2"><Logo dark /></div><div className="mt-12 px-3 font-mono text-[9px] uppercase tracking-[.2em] text-[#85a7a9]">Response desk</div><nav className="mt-3 space-y-1">{nav.map(item => <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${location === item.href && item.label !== 'New intake' ? 'bg-[#28556b] text-[#f5f6ee]' : 'text-[#b5cdcb] hover:bg-[#21485d] hover:text-white'}`} data-testid={`link-desk-${item.label.toLowerCase().replaceAll(' ', '-')}`}>{item.icon}<span>{item.label}</span>{item.label === 'Case queue' && <span className="ml-auto rounded-full bg-[#e6bd48] px-2 py-0.5 text-[10px] font-bold text-[#173649]">12</span>}</Link>)}</nav><div className="mt-auto rounded-2xl border border-[#365d6d] bg-[#1d4255] p-4"><div className="flex items-center gap-2 text-[#e6bd48]"><Headphones size={16} /><span className="text-xs font-bold">On-call support</span></div><p className="mt-2 text-[11px] leading-5 text-[#a9c4c2]">Analyst coverage is active. Escalate critical cases any time.</p><button className="mt-3 text-[11px] font-bold text-[#e6bd48]" data-testid="button-contact-support">Contact support →</button></div><div className="mt-5 flex items-center gap-3 border-t border-[#365d6d] px-2 pt-5"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#e6bd48] text-xs font-bold text-[#173649]">AO</span><span className="text-xs font-semibold text-[#d7e5e1]">Amina Okafor<small className="mt-0.5 block text-[10px] font-normal text-[#85a7a9]">Senior analyst</small></span><button className="ml-auto text-[#85a7a9]" aria-label="Account menu" data-testid="button-account-menu"><ChevronDown size={15} /></button></div></aside>{mobileOpen && <button className="fixed inset-0 z-30 bg-[#173649]/40 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation" />}<div className="lg:pl-[248px]"><header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#cfdddd] bg-[#edf3f0]/90 px-5 backdrop-blur lg:px-8"><button className="rounded-lg p-2 text-[#315d6c] lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={21} /></button><div className="hidden items-center gap-2 text-xs text-[#70868b] lg:flex"><span>Response desk</span><span>/</span><strong className="text-[#315d6c]">{location === '/dashboard' ? 'Overview' : 'Case detail'}</strong></div><div className="ml-auto flex items-center gap-4"><div className="relative hidden md:block"><Search size={15} className="absolute left-3 top-2.5 text-[#819699]" /><input placeholder="Search cases" className="h-9 w-52 rounded-full border border-[#c7d8d5] bg-[#f8faf5] pl-9 pr-3 text-xs outline-none focus:border-[#1f536d]" data-testid="input-global-search" /></div><button className="relative rounded-full p-2 text-[#55737c]" aria-label="Notifications" data-testid="button-notifications"><Bell size={18} /><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#a15b3a]" /></button><Link href="/" className="hidden text-xs font-bold text-[#315d6c] sm:block" data-testid="link-public-view">Public view ↗</Link></div></header><main className="mx-auto max-w-[1380px] px-5 py-8 lg:px-8 lg:py-10">{children}</main></div></div>;
}

function Dashboard({ cases, setCases }: { cases: CaseRecord[]; setCases: (c: CaseRecord[]) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | Severity>('All');
  const filtered = useMemo(() => cases.filter(c => (filter === 'All' || c.severity === filter) && `${c.id} ${c.title} ${c.reporter} ${c.organization}`.toLowerCase().includes(query.toLowerCase())), [cases, filter, query]);
  const counts = { Critical: cases.filter(c => c.severity === 'Critical').length, High: cases.filter(c => c.severity === 'High').length, Moderate: cases.filter(c => c.severity === 'Moderate').length, Low: cases.filter(c => c.severity === 'Low').length };
  const updateStatus = (id: string, status: CaseStatus) => setCases(cases.map(c => c.id === id ? { ...c, status, updated: 'just now' } : c));
  return <AnalystShell><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#a15b3a]">Tuesday · 14 May 2024</p><h1 className="mt-2 text-4xl font-bold tracking-[-.06em] text-[#173649]">Good morning, Amina.</h1><p className="mt-2 text-sm text-[#648087]">Here’s the shape of the response desk today.</p></div><Link href="/report" className="inline-flex items-center gap-2 self-start rounded-full bg-[#1f536d] px-4 py-2.5 text-xs font-bold text-white md:self-auto" data-testid="button-new-intake"><Plus size={15} /> New intake</Link></div><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Open cases" value={cases.filter(c => c.status !== 'Resolved').length.toString().padStart(2, '0')} detail="3 need attention" icon={<FolderOpen />} accent="navy" /><Metric label="Critical" value={counts.Critical.toString().padStart(2, '0')} detail="1 unassigned" icon={<Siren />} accent="red" /><Metric label="Awaiting action" value={cases.filter(c => c.status === 'Awaiting reporter').length.toString().padStart(2, '0')} detail="oldest 2 hours" icon={<Clock3 />} accent="gold" /><Metric label="Resolved this week" value="07" detail="+2 from last week" icon={<BadgeCheck />} accent="teal" /></div><div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_.75fr]"><section className="min-w-0 rounded-2xl border border-[#cfdddd] bg-[#f8faf5]"><div className="flex flex-col gap-4 border-b border-[#d9e4e0] p-5 md:flex-row md:items-center md:justify-between"><div><h2 className="font-bold text-[#244a5c]">Active case queue</h2><p className="mt-1 text-xs text-[#799096]">Prioritized by severity and last activity</p></div><div className="flex flex-wrap gap-2"><div className="relative"><Search size={14} className="absolute left-3 top-2.5 text-[#879a9b]" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search queue" className="h-8 w-36 rounded-lg border border-[#c9d9d6] bg-[#fbfcf8] pl-8 pr-2 text-xs outline-none focus:border-[#1f536d]" data-testid="input-case-search" /></div><div className="relative"><SlidersHorizontal size={13} className="absolute left-2.5 top-2.5 text-[#879a9b]" /><select value={filter} onChange={e => setFilter(e.target.value as 'All' | Severity)} className="h-8 appearance-none rounded-lg border border-[#c9d9d6] bg-[#fbfcf8] pl-8 pr-7 text-xs font-semibold text-[#55737c] outline-none" data-testid="select-severity-filter"><option>All</option><option>Critical</option><option>High</option><option>Moderate</option><option>Low</option></select></div></div></div><div className="divide-y divide-[#e1e9e5]">{filtered.length ? filtered.map(c => <CaseRow key={c.id} c={c} onStatus={updateStatus} />) : <div className="p-12 text-center"><Search className="mx-auto text-[#9ab0ae]" size={26} /><p className="mt-3 text-sm font-bold text-[#315d6c]">No cases match that search.</p><button onClick={() => { setQuery(''); setFilter('All'); }} className="mt-2 text-xs font-bold text-[#a15b3a]" data-testid="button-clear-filter">Clear filters</button></div>}</div></section><aside className="space-y-6"><div className="rounded-2xl border border-[#cfdddd] bg-[#f8faf5] p-5"><div className="flex items-center justify-between"><h2 className="font-bold text-[#244a5c]">Severity mix</h2><span className="text-[10px] font-mono text-[#799096]">ACTIVE</span></div><div className="mt-6 flex items-end gap-2"><div className="flex h-28 flex-1 items-end gap-2">{[['Critical', counts.Critical, 'bg-[#b64a3d]'], ['High', counts.High, 'bg-[#e6bd48]'], ['Moderate', counts.Moderate, 'bg-[#5c9d91]'], ['Low', counts.Low, 'bg-[#91aabb]']].map(([name, count, color]) => <div className="flex flex-1 flex-col items-center gap-2" key={name as string}><div className={`w-full rounded-t-md ${color} transition-all`} style={{ height: `${Math.max(12, Number(count) * 20)}px` }} /><span className="text-[10px] text-[#799096]">{name}</span></div>)}</div><div className="border-l border-[#d9e4e0] pl-4"><p className="font-mono text-2xl font-bold text-[#173649]">{cases.filter(c => c.status !== 'Resolved').length}</p><p className="text-[10px] text-[#799096]">open total</p></div></div></div><div className="rounded-2xl border border-[#cfdddd] bg-[#173649] p-5 text-[#e3eeeb]"><div className="flex items-center gap-2"><Sparkles size={15} className="text-[#e6bd48]" /><h2 className="text-sm font-bold">Quick triage</h2></div><p className="mt-3 text-xs leading-5 text-[#a9c4c2]">Three reports are waiting for a first human touch.</p><button onClick={() => setFilter('Critical')} className="mt-5 flex w-full items-center justify-between rounded-xl border border-[#426878] px-3 py-2.5 text-xs font-bold text-[#e6bd48] transition hover:bg-[#21485d]" data-testid="button-triage-critical">Show critical queue <ArrowRight size={14} /></button></div><div className="rounded-2xl border border-[#cfdddd] bg-[#f8faf5] p-5"><h2 className="font-bold text-[#244a5c]">Recent activity</h2><div className="mt-4 space-y-4"><Activity icon={<FileCheck2 />} text="Evidence preserved" sub="CRC-4821 · 12 min ago" /><Activity icon={<MessageSquareText />} text="Reporter replied" sub="CRC-4802 · 34 min ago" /><Activity icon={<ShieldCheck />} text="Case resolved" sub="CRC-4796 · yesterday" /></div></div></aside></div></AnalystShell>;
}

function Metric({ label, value, detail, icon, accent }: { label: string; value: string; detail: string; icon: ReactNode; accent: string }) { const colors: Record<string, string> = { navy: 'bg-[#e1edf0] text-[#1f536d]', red: 'bg-[#f7e2de] text-[#a33a2f]', gold: 'bg-[#fff1c7] text-[#806000]', teal: 'bg-[#dcefea] text-[#246b61]' }; return <div className="rounded-2xl border border-[#cfdddd] bg-[#f8faf5] p-5"><div className="flex items-center justify-between"><span className={`grid h-9 w-9 place-items-center rounded-xl ${colors[accent]}`}>{icon}</span><span className="font-mono text-[10px] uppercase tracking-[.12em] text-[#829496]">live</span></div><p className="mt-5 text-[11px] font-bold uppercase tracking-[.1em] text-[#799096]">{label}</p><p className="mt-1 font-mono text-3xl font-bold tracking-[-.06em] text-[#173649]" data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}>{value}</p><p className="mt-1 text-xs text-[#648087]">{detail}</p></div>; }
function CaseRow({ c, onStatus }: { c: CaseRecord; onStatus: (id: string, status: CaseStatus) => void }) { return <div className="group flex flex-col gap-4 p-5 transition hover:bg-[#f1f6f2] sm:flex-row sm:items-center"><Link href={`/cases/${c.id}`} className="flex min-w-0 flex-1 items-start gap-3" data-testid={`link-case-${c.id}`}><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${c.severity === 'Critical' ? 'bg-[#b64a3d]' : c.severity === 'High' ? 'bg-[#e6bd48]' : 'bg-[#5c9d91]'}`} /><span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><strong className="truncate text-sm text-[#244a5c]">{c.title}</strong><span className="font-mono text-[9px] text-[#8a9c9d]">{c.id}</span></span><span className="mt-1 block truncate text-xs text-[#799096]">{c.type} · {c.organization}</span></span></Link><div className="flex items-center gap-3 sm:shrink-0"><StatusPill className={severityStyles[c.severity]}>{c.severity}</StatusPill><select value={c.status} onChange={e => onStatus(c.id, e.target.value as CaseStatus)} className={`h-7 rounded-full border px-2 text-[10px] font-bold outline-none ${statusStyles[c.status]}`} aria-label={`Change status for ${c.id}`} data-testid={`select-status-${c.id}`}><option>New</option><option>Investigating</option><option>Awaiting reporter</option><option>Resolved</option></select><span className="hidden w-16 text-right text-[10px] text-[#91a0a1] sm:block">{c.updated}</span></div></div>; }
function Activity({ icon, text, sub }: { icon: ReactNode; text: string; sub: string }) { return <div className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#e6efeb] text-[#467582]">{icon}</span><div><p className="text-xs font-bold text-[#315d6c]">{text}</p><p className="mt-0.5 text-[10px] text-[#829496]">{sub}</p></div></div>; }

function CaseDetail({ cases, setCases }: { cases: CaseRecord[]; setCases: (c: CaseRecord[]) => void }) {
  const [, params] = useRoute('/cases/:id');
  const c = cases.find(item => item.id === params?.id) ?? cases[0];
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  if (!c) return <NotFound />;
  const setStatus = (status: CaseStatus) => { setCases(cases.map(item => item.id === c.id ? { ...item, status, updated: 'just now' } : item)); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  const addNote = () => { if (!note.trim()) return; setCases(cases.map(item => item.id === c.id ? { ...item, notes: [...item.notes, { author: 'A. Okafor', time: 'just now', text: note.trim() }] } : item)); setNote(''); };
  return <AnalystShell><Link href="/dashboard" className="mb-7 inline-flex items-center gap-2 text-xs font-bold text-[#467582]" data-testid="link-back-queue"><ArrowLeft size={14} /> Back to queue</Link><div className="flex flex-col justify-between gap-5 md:flex-row md:items-start"><div><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#a15b3a]">{c.id}</span><StatusPill className={severityStyles[c.severity]}>{c.severity} priority</StatusPill><StatusPill className={statusStyles[c.status]}>{c.status}</StatusPill></div><h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-.06em] text-[#173649]">{c.title}</h1><p className="mt-2 text-sm text-[#648087]">{c.type} · reported by {c.reporter} · {c.location}</p></div><div className="flex flex-wrap gap-2"><select value={c.status} onChange={e => setStatus(e.target.value as CaseStatus)} className="rounded-full border border-[#b8cdd0] bg-[#f8faf5] px-4 py-2 text-xs font-bold text-[#315d6c]" data-testid="select-case-status"><option>New</option><option>Investigating</option><option>Awaiting reporter</option><option>Resolved</option></select><button className="rounded-full border border-[#b8cdd0] p-2.5 text-[#55737c]" aria-label="More case actions" data-testid="button-case-actions"><MoreHorizontal size={17} /></button></div></div>{saved && <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#dcefea] px-3 py-2 text-xs font-bold text-[#246b61]"><Check size={14} /> Case updated</div>}<div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_.85fr]"><div className="space-y-6"><section className="rounded-2xl border border-[#cfdddd] bg-[#f8faf5] p-6"><div className="flex items-center justify-between"><h2 className="font-bold text-[#244a5c]">Incident summary</h2><button className="text-[#467582]" aria-label="Edit summary" data-testid="button-edit-summary"><MoreHorizontal size={17} /></button></div><p className="mt-4 text-sm leading-7 text-[#55737c]">{c.summary}</p><div className="mt-6 grid gap-4 border-t border-[#d9e4e0] pt-5 sm:grid-cols-3"><InfoCell label="Organization" value={c.organization} /><InfoCell label="Assigned to" value={c.assigned} /><InfoCell label="Last updated" value={c.updated} /></div></section><section className="rounded-2xl border border-[#cfdddd] bg-[#f8faf5] p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold text-[#244a5c]">Evidence timeline</h2><p className="mt-1 text-xs text-[#799096]">A chain of what we know and when</p></div><button className="inline-flex items-center gap-1.5 rounded-full border border-[#b8cdd0] px-3 py-2 text-[11px] font-bold text-[#315d6c]" data-testid="button-add-evidence"><Paperclip size={13} /> Add evidence</button></div><div className="mt-7 space-y-0">{c.evidence.map((event, i) => <div className="relative flex gap-4 pb-7 last:pb-0" key={event.time + event.label}><div className="relative flex w-5 shrink-0 justify-center"><span className={`z-10 grid h-5 w-5 place-items-center rounded-full ${event.kind === 'file' ? 'bg-[#e6bd48] text-[#173649]' : 'bg-[#dcefea] text-[#246b61]'}`}>{event.kind === 'file' ? <FileCheck2 size={11} /> : event.kind === 'person' ? <UserRound size={11} /> : <ShieldCheck size={11} />}</span>{i < c.evidence.length - 1 && <span className="absolute top-5 h-full w-px bg-[#cbdcd8]" />}</div><div><p className="font-mono text-[10px] text-[#a15b3a]">{event.time}</p><p className="mt-1 text-sm font-bold text-[#315d6c]">{event.label}</p><p className="mt-1 text-xs text-[#799096]">{event.description}</p></div></div>)}</div></section></div><aside className="space-y-6"><section className="rounded-2xl border border-[#cfdddd] bg-[#173649] p-6 text-[#e3eeeb]"><div className="flex items-center gap-2"><MessageSquareText size={16} className="text-[#e6bd48]" /><h2 className="font-bold">Analyst notes</h2></div><div className="mt-5 space-y-4">{c.notes.length ? c.notes.map((n, i) => <div className="border-l-2 border-[#e6bd48] pl-3" key={`${n.time}-${i}`}><p className="text-xs leading-5 text-[#d1e1dd]">{n.text}</p><p className="mt-2 font-mono text-[9px] uppercase tracking-[.1em] text-[#85a7a9]">{n.author} · {n.time}</p></div>) : <p className="text-xs text-[#a9c4c2]">No notes yet. Add the first handoff note below.</p>}</div><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a private case note…" className="mt-6 min-h-[90px] w-full resize-none rounded-xl border border-[#426878] bg-[#1d4255] p-3 text-xs text-[#eff5ec] outline-none placeholder:text-[#85a7a9] focus:border-[#e6bd48]" data-testid="input-case-note" /><button onClick={addNote} disabled={!note.trim()} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e6bd48] py-2.5 text-xs font-bold text-[#173649] disabled:opacity-40" data-testid="button-add-note"><Plus size={14} /> Add private note</button></section><section className="rounded-2xl border border-[#cfdddd] bg-[#f8faf5] p-6"><h2 className="font-bold text-[#244a5c]">Suggested next steps</h2><div className="mt-4 space-y-3">{['Confirm reporter identity', 'Preserve original email headers', 'Log any financial loss separately'].map((x, i) => <div className="flex items-center gap-3 text-xs text-[#55737c]" key={x}><span className="grid h-6 w-6 place-items-center rounded-lg bg-[#e6efeb] font-mono text-[10px] text-[#a15b3a]">{i + 1}</span>{x}</div>)}</div></section></aside></div></AnalystShell>;
}
function InfoCell({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#829496]">{label}</p><p className="mt-1 truncate text-xs font-semibold text-[#315d6c]">{value}</p></div>; }

function Router() { const [cases, setCases] = useState<CaseRecord[]>(initialCases); return <Switch><Route path="/" component={Home} /><Route path="/report" component={ReportPage} /><Route path="/dashboard">{() => <Dashboard cases={cases} setCases={setCases} />}</Route><Route path="/cases/:id">{() => <CaseDetail cases={cases} setCases={setCases} />}</Route><Route component={NotFound} /></Switch>; }
function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Router /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }

export default App;