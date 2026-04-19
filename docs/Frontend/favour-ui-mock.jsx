import { useState } from "react";
import {
  ArrowLeft, Star, MapPin, Clock, ShieldCheck, Check,
  ChevronRight, MessageSquare, Calendar, Zap, Wrench,
  Fan, Sparkles, Share2, Bookmark, Phone, Award,
  CheckCircle2, Send, ThumbsUp, Lock
} from "lucide-react";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700;800&display=swap');
  .f-sans { font-family: 'Manrope', sans-serif; }
  .f-body { font-family: 'Figtree', sans-serif; }
  .f-mono { font-family: 'JetBrains Mono', monospace; }
  ::-webkit-scrollbar { display: none; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
`;

const C = {
  blue: '#0047CC',
  blueLight: '#EEF3FF',
  blueMid: '#D0DEFF',
  dark: '#111827',
  ink700: '#4B5563',
  ink400: '#9CA3AF',
  surface: '#F3F4F6',
  border: '#E5E7EB',
  white: '#FFFFFF',
  green: '#007A33',
  greenLight: '#ECFDF0',
  amber: '#B36B00',
  amberLight: '#FFF8E7',
};

// ─── SHARED COMPONENTS ──────────────────────────────────────────────────────

const Pill = ({ children, color = 'blue' }) => {
  const styles = {
    blue: { bg: C.blueLight, text: C.blue, border: C.blueMid },
    green: { bg: C.greenLight, text: C.green, border: '#A7F3C0' },
    amber: { bg: C.amberLight, text: C.amber, border: '#FCD34D' },
    dark: { bg: C.surface, text: C.dark, border: C.border },
  };
  const s = styles[color];
  return (
    <span className="f-mono" style={{
      display: 'inline-flex', alignItems: 'center', height: 26,
      padding: '0 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
      letterSpacing: '0.04em', background: s.bg, color: s.text,
      border: `1.5px solid ${s.border}`
    }}>{children}</span>
  );
};

const StatBox = ({ label, value, sub, accent }) => (
  <div style={{
    flex: 1, background: C.white, border: `1.5px solid ${C.border}`,
    borderRadius: 10, padding: '12px 10px', textAlign: 'center'
  }}>
    <div className="f-mono" style={{ fontSize: 20, fontWeight: 800, color: accent || C.dark, letterSpacing: '-0.02em' }}>{value}</div>
    <div className="f-sans" style={{ fontSize: 11, fontWeight: 700, color: C.ink700, marginTop: 2 }}>{label}</div>
    {sub && <div className="f-body" style={{ fontSize: 10, color: C.ink400, marginTop: 1 }}>{sub}</div>}
  </div>
);

const ServiceRow = ({ icon: Icon, name, price, selected, onSelect }) => (
  <div onClick={onSelect} style={{
    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
    border: `1.5px solid ${selected ? C.blue : C.border}`,
    borderRadius: 10, background: selected ? C.blueLight : C.white,
    cursor: 'pointer', transition: 'all 0.15s'
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 8, flexShrink: 0,
      background: selected ? C.blue : C.surface,
      border: `1.5px solid ${selected ? C.blue : C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon size={18} color={selected ? C.white : C.ink700} />
    </div>
    <div style={{ flex: 1 }}>
      <div className="f-sans" style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>{name}</div>
      <div className="f-mono" style={{ fontSize: 12, fontWeight: 700, color: selected ? C.blue : C.ink400, marginTop: 2 }}>
        PHP {price} base
      </div>
    </div>
    {selected && (
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Check size={13} color={C.white} strokeWidth={3} />
      </div>
    )}
  </div>
);

const ReviewCard = ({ name, rating, date, text, initials }) => (
  <div style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', background: C.white }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, background: C.dark,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <span className="f-mono" style={{ fontSize: 12, fontWeight: 800, color: C.white }}>{initials}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div className="f-sans" style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} fill={i < rating ? C.dark : 'none'} color={i < rating ? C.dark : C.ink400} />
          ))}
          <span className="f-mono" style={{ fontSize: 10, fontWeight: 700, color: C.ink400, marginLeft: 2 }}>{date}</span>
        </div>
      </div>
    </div>
    <p className="f-body" style={{ fontSize: 13, color: C.ink700, lineHeight: 1.55 }}>{text}</p>
  </div>
);

// ─── SCREEN 1: PROVIDER PROFILE ──────────────────────────────────────────────

const ProfileScreen = ({ onBook }) => {
  const [selectedService, setSelectedService] = useState('aircon');
  const services = [
    { id: 'aircon', icon: Fan, name: 'Aircon Cleaning', price: '700' },
    { id: 'aircon_repair', icon: Zap, name: 'Aircon Repair', price: '950' },
    { id: 'plumbing', icon: Wrench, name: 'Plumbing Work', price: '500' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.surface, overflowY: 'auto' }}>

      {/* Top Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: C.white, borderBottom: `1.5px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} color={C.dark} />
        </div>
        <span className="f-mono" style={{ fontSize: 13, fontWeight: 700, color: C.ink700 }}>PRO PROFILE</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {[Share2, Bookmark].map((Icon, i) => (
            <div key={i} style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: C.white }}>
              <Icon size={16} color={C.dark} />
            </div>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: C.white, padding: '24px 20px 20px', borderBottom: `1.5px solid ${C.border}` }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 72, height: 72, borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.surface, overflow: 'hidden' }}>
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Mateo" alt="Kuya Mateo" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.2)', background: C.white }} />
            </div>
            <div style={{ position: 'absolute', bottom: -6, right: -6, background: C.green, borderRadius: 6, padding: '2px 6px', border: `2px solid ${C.white}` }}>
              <ShieldCheck size={12} color={C.white} strokeWidth={2.5} />
            </div>
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 className="f-sans" style={{ fontSize: 20, fontWeight: 800, color: C.dark, letterSpacing: '-0.02em' }}>Kuya Mateo D.</h1>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              <Pill color="green">✓ FAVOUR VERIFIED</Pill>
              <Pill color="dark">FREELANCER</Pill>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
              <MapPin size={13} color={C.ink400} />
              <span className="f-body" style={{ fontSize: 13, color: C.ink700, fontWeight: 500 }}>Batangas City, Lipa City</span>
            </div>
          </div>
        </div>

        {/* Favour Score Banner */}
        <div style={{ marginTop: 20, background: C.dark, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <div className="f-mono" style={{ fontSize: 32, fontWeight: 800, color: C.white, letterSpacing: '-0.03em', lineHeight: 1 }}>4.97</div>
            <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill={C.white} color={C.white} />
              ))}
            </div>
          </div>
          <div style={{ width: '1px', height: 44, background: '#374151', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="f-sans" style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF' }}>FAVOUR SCORE</div>
            <div className="f-body" style={{ fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 1.4 }}>Based on 1,204 completed jobs</div>
          </div>
          <Award size={28} color={C.blue} strokeWidth={1.5} style={{ flexShrink: 0 }} />
        </div>

        {/* Stat Row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <StatBox label="RESPONSE" value="< 2h" sub="avg. time" accent={C.blue} />
          <StatBox label="COMPLETION" value="98%" sub="last 90 days" accent={C.green} />
          <StatBox label="REPEAT" value="67%" sub="clients" />
        </div>
      </div>

      {/* Response Signal */}
      <div style={{ margin: '12px 16px 0', padding: '10px 14px', background: C.blueLight, border: `1.5px solid ${C.blueMid}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Clock size={16} color={C.blue} style={{ flexShrink: 0 }} />
        <span className="f-body" style={{ fontSize: 13, fontWeight: 600, color: C.blue }}>Usually responds to requests within <strong>2 hours</strong></span>
      </div>

      {/* Trade + Bio */}
      <div style={{ background: C.white, margin: '12px 0', padding: '18px 20px', borderTop: `1.5px solid ${C.border}`, borderBottom: `1.5px solid ${C.border}` }}>
        <div className="f-mono" style={{ fontSize: 11, fontWeight: 800, color: C.ink400, letterSpacing: '0.08em', marginBottom: 10 }}>ABOUT</div>
        <p className="f-body" style={{ fontSize: 14, color: C.ink700, lineHeight: 1.65 }}>
          Licensed aircon technician with 8 years of experience. Specializing in split-type cleaning, repair, and installation. TESDA NC II certified. I treat every home like my own.
        </p>
        <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['TESDA NC II', 'NBI Cleared', '8 Yrs. Exp.'].map(tag => (
            <span key={tag} className="f-mono" style={{ fontSize: 11, fontWeight: 700, color: C.ink700, background: C.surface, border: `1.5px solid ${C.border}`, padding: '3px 8px', borderRadius: 5 }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Services */}
      <div style={{ background: C.white, padding: '18px 20px', borderTop: `1.5px solid ${C.border}`, borderBottom: `1.5px solid ${C.border}` }}>
        <div className="f-mono" style={{ fontSize: 11, fontWeight: 800, color: C.ink400, letterSpacing: '0.08em', marginBottom: 12 }}>SELECT A SERVICE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {services.map(s => (
            <ServiceRow key={s.id} {...s} selected={selectedService === s.id} onSelect={() => setSelectedService(s.id)} />
          ))}
        </div>
      </div>

      {/* Photos */}
      <div style={{ background: C.white, padding: '18px 20px 20px', margin: '12px 0', borderTop: `1.5px solid ${C.border}`, borderBottom: `1.5px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="f-mono" style={{ fontSize: 11, fontWeight: 800, color: C.ink400, letterSpacing: '0.08em' }}>PAST WORK</div>
          <span className="f-sans" style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>See all →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ aspectRatio: '1', borderRadius: 8, background: C.surface, border: `1.5px solid ${C.border}`, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${i === 0 ? '#D0DEFF' : i === 1 ? '#ECFDF0' : '#F3F4F6'}, ${C.surface})` }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Fan size={22} color={C.ink400} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div style={{ background: C.white, padding: '18px 20px', borderTop: `1.5px solid ${C.border}`, borderBottom: `1.5px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="f-mono" style={{ fontSize: 11, fontWeight: 800, color: C.ink400, letterSpacing: '0.08em' }}>REVIEWS</div>
          <span className="f-sans" style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>142 total →</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ReviewCard initials="MR" name="Maria R." rating={5} date="2 days ago" text="Super bait and mabilis! Fixed my aircon in less than an hour. Babalik ako ulit. Highly recommended!" />
          <ReviewCard initials="JD" name="Jose D." rating={5} date="1 week ago" text="Very professional at neat. Explained everything before starting. Fair price, great results." />
        </div>
      </div>

      {/* Spacer for sticky button */}
      <div style={{ height: 100 }} />

      {/* Sticky Book Button */}
      <div style={{ position: 'sticky', bottom: 0, padding: '14px 20px', background: C.white, borderTop: `1.5px solid ${C.border}` }}>
        <button onClick={onBook} style={{
          width: '100%', height: 52, background: C.blue, border: 'none', borderRadius: 10,
          color: C.white, fontSize: 17, fontWeight: 800, cursor: 'pointer',
          fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.01em', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s'
        }}>
          Book Kuya Mateo
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

// ─── SCREEN 2: BOOKING CONFIRMED ─────────────────────────────────────────────

const ConfirmedScreen = ({ onReview }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.white }}>

    {/* Success Header */}
    <div style={{ background: C.dark, padding: '28px 20px 24px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <CheckCircle2 size={28} color={C.white} strokeWidth={2} />
      </div>
      <h1 className="f-sans" style={{ fontSize: 22, fontWeight: 800, color: C.white, letterSpacing: '-0.02em' }}>Booking Confirmed!</h1>
      <p className="f-body" style={{ fontSize: 14, color: '#9CA3AF', marginTop: 6 }}>Kuya Mateo accepted your request.</p>
      <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1F2937', borderRadius: 8, padding: '8px 14px', border: '1.5px solid #374151' }}>
        <span className="f-mono" style={{ fontSize: 12, fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.05em' }}>REF</span>
        <span className="f-mono" style={{ fontSize: 14, fontWeight: 800, color: C.white }}>FVR-992-AX8</span>
      </div>
    </div>

    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px' }}>

      {/* Provider card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', border: `1.5px solid ${C.border}`, borderRadius: 12, background: C.surface, marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, overflow: 'hidden', flexShrink: 0 }}>
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Mateo" alt="Mateo" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.2)', background: C.white }} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="f-sans" style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>Kuya Mateo D.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <Star size={12} fill={C.dark} color={C.dark} />
            <span className="f-mono" style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>4.97</span>
            <span className="f-body" style={{ fontSize: 12, color: C.ink400 }}>· 1,204 jobs</span>
          </div>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Phone size={16} color={C.dark} />
        </div>
      </div>

      {/* Booking details */}
      <div style={{ border: `1.5px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: `1.5px solid ${C.border}`, background: C.surface }}>
          <div className="f-mono" style={{ fontSize: 11, fontWeight: 800, color: C.ink400, letterSpacing: '0.08em' }}>BOOKING DETAILS</div>
        </div>
        {[
          { label: 'Service', value: 'Aircon Cleaning', icon: Fan },
          { label: 'Date & Time', value: 'Today, 2:00 PM', icon: Calendar },
          { label: 'Address', value: '142 Amorsolo St, Batangas City', icon: MapPin },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: `1.5px solid ${C.border}`, background: C.white }}>
            <div style={{ width: 32, height: 32, borderRadius: 7, background: C.surface, border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={15} color={C.ink700} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="f-mono" style={{ fontSize: 10, fontWeight: 700, color: C.ink400, letterSpacing: '0.06em' }}>{label.toUpperCase()}</div>
              <div className="f-body" style={{ fontSize: 14, fontWeight: 600, color: C.dark, marginTop: 2 }}>{value}</div>
            </div>
          </div>
        ))}
        <div style={{ padding: '13px 16px', background: C.white }}>
          <div className="f-mono" style={{ fontSize: 10, fontWeight: 700, color: C.ink400, letterSpacing: '0.06em', marginBottom: 3 }}>BASE PRICE</div>
          <div className="f-mono" style={{ fontSize: 16, fontWeight: 800, color: C.blue }}>PHP 700.00 <span style={{ color: C.ink400, fontSize: 12 }}>starting rate</span></div>
        </div>
      </div>

      {/* Chat unlock notice */}
      <div style={{ padding: '14px 16px', background: C.blueLight, border: `1.5px dashed ${C.blue}`, borderRadius: 10, display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
        <MessageSquare size={18} color={C.blue} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div className="f-sans" style={{ fontSize: 14, fontWeight: 700, color: C.blue }}>Chat is now unlocked</div>
          <p className="f-body" style={{ fontSize: 13, color: C.blue, opacity: 0.8, marginTop: 3, lineHeight: 1.5 }}>Coordinate with Kuya Mateo directly in-app. Contact details are now visible.</p>
        </div>
      </div>

      {/* Actions */}
      <button style={{ width: '100%', height: 52, background: C.blue, border: 'none', borderRadius: 10, color: C.white, fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'Manrope, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
        <MessageSquare size={18} />
        Open Chat with Kuya Mateo
      </button>
      <button style={{ width: '100%', height: 48, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.dark, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}>
        View Full Booking
      </button>
    </div>
  </div>
);

// ─── SCREEN 3: LEAVE A REVIEW ────────────────────────────────────────────────

const ReviewScreen = () => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.white, alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <ThumbsUp size={30} color={C.white} />
        </div>
        <h2 className="f-sans" style={{ fontSize: 22, fontWeight: 800, color: C.dark, letterSpacing: '-0.02em' }}>Salamat!</h2>
        <p className="f-body" style={{ fontSize: 15, color: C.ink700, marginTop: 10, lineHeight: 1.65 }}>Your review has been submitted. It will be published once Kuya Mateo leaves his review, or after 7 days.</p>
        <div style={{ marginTop: 20, padding: '12px 16px', background: C.blueLight, border: `1.5px solid ${C.blueMid}`, borderRadius: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
          <Lock size={16} color={C.blue} style={{ flexShrink: 0 }} />
          <p className="f-body" style={{ fontSize: 13, color: C.blue, textAlign: 'left' }}>Double-blind review: neither of you can see each other's review until both are in.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.white }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} color={C.dark} />
        </div>
        <span className="f-mono" style={{ fontSize: 13, fontWeight: 700, color: C.ink700 }}>LEAVE A REVIEW</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        {/* Provider mini card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.surface, overflow: 'hidden', flexShrink: 0 }}>
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Mateo" alt="Mateo" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.2)', background: C.white }} />
          </div>
          <div>
            <div className="f-sans" style={{ fontSize: 16, fontWeight: 800, color: C.dark }}>Kuya Mateo D.</div>
            <div className="f-body" style={{ fontSize: 13, color: C.ink700, marginTop: 3 }}>Aircon Cleaning · Today, 2:00 PM</div>
            <div style={{ marginTop: 4 }}>
              <Pill color="green">✓ COMPLETED</Pill>
            </div>
          </div>
        </div>

        {/* Star rating */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="f-sans" style={{ fontSize: 17, fontWeight: 800, color: C.dark, marginBottom: 6 }}>How was your experience?</div>
          <p className="f-body" style={{ fontSize: 14, color: C.ink700, marginBottom: 20 }}>Your honest feedback helps the whole community.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setRating(n)} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, transition: 'transform 0.1s' }}>
                <Star size={38} fill={n <= (hovered || rating) ? C.dark : 'none'} color={n <= (hovered || rating) ? C.dark : C.border} strokeWidth={1.5}
                  style={{ transform: n <= (hovered || rating) ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.15s, fill 0.1s' }} />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <div className="f-mono" style={{ fontSize: 13, fontWeight: 700, color: C.ink700, marginTop: 10 }}>
              {['', 'Poor', 'Fair', 'Good', 'Great', 'Outstanding!'][rating]}
            </div>
          )}
        </div>

        {/* Written review */}
        <div style={{ marginBottom: 16 }}>
          <div className="f-mono" style={{ fontSize: 11, fontWeight: 800, color: C.ink400, letterSpacing: '0.08em', marginBottom: 8 }}>YOUR REVIEW</div>
          <textarea placeholder="What did you like? Was everything done right? Be honest — your review helps future customers make better decisions." style={{
            width: '100%', minHeight: 120, padding: '14px', borderRadius: 10, border: `1.5px solid ${C.border}`,
            fontSize: 14, color: C.dark, fontFamily: 'Figtree, sans-serif', fontWeight: 500,
            lineHeight: 1.6, resize: 'none', outline: 'none', background: C.white
          }} />
        </div>

        {/* Double-blind notice */}
        <div style={{ padding: '12px 14px', background: C.blueLight, border: `1.5px solid ${C.blueMid}`, borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
          <Lock size={15} color={C.blue} style={{ flexShrink: 0, marginTop: 1 }} />
          <p className="f-body" style={{ fontSize: 12, color: C.blue, lineHeight: 1.5 }}>
            <strong>Double-blind review.</strong> Your review stays private until Kuya Mateo submits his — or after 7 days. This keeps both reviews honest.
          </p>
        </div>
      </div>

      {/* Submit */}
      <div style={{ padding: '14px 20px', borderTop: `1.5px solid ${C.border}`, background: C.white }}>
        <button onClick={() => rating > 0 && setSubmitted(true)} style={{
          width: '100%', height: 52, background: rating > 0 ? C.blue : C.border, border: 'none', borderRadius: 10,
          color: rating > 0 ? C.white : C.ink400, fontSize: 16, fontWeight: 800, cursor: rating > 0 ? 'pointer' : 'not-allowed',
          fontFamily: 'Manrope, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s'
        }}>
          <Send size={18} />
          Submit Review
        </button>
      </div>
    </div>
  );
};

// ─── APP SHELL ───────────────────────────────────────────────────────────────

export default function FavourMockV2() {
  const [screen, setScreen] = useState('profile');

  const screens = [
    { id: 'profile', label: 'Provider Profile' },
    { id: 'confirmed', label: 'Booking Confirmed' },
    { id: 'review', label: 'Leave a Review' },
  ];

  const renderScreen = () => {
    switch (screen) {
      case 'profile': return <ProfileScreen onBook={() => setScreen('confirmed')} />;
      case 'confirmed': return <ConfirmedScreen onReview={() => setScreen('review')} />;
      case 'review': return <ReviewScreen />;
      default: return null;
    }
  };

  return (
    <div className="f-sans" style={{ minHeight: '100vh', background: '#E5E7EB', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style dangerouslySetInnerHTML={{ __html: FONTS }} />

      {/* Screen switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: C.white, padding: 6, borderRadius: 12, border: `1.5px solid ${C.border}` }}>
        {screens.map(s => (
          <button key={s.id} onClick={() => setScreen(s.id)} className="f-sans" style={{
            padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${screen === s.id ? C.blue : 'transparent'}`,
            background: screen === s.id ? C.blueLight : 'transparent', color: screen === s.id ? C.blue : C.ink700,
            fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
          }}>{s.label}</button>
        ))}
      </div>

      {/* Phone frame */}
      <div style={{
        width: 375, height: 812, borderRadius: 48, border: `12px solid ${C.dark}`,
        overflow: 'hidden', background: C.white, position: 'relative', flexShrink: 0
      }}>
        {/* Status bar */}
        <div className="f-mono" style={{ position: 'absolute', top: 0, width: '100%', height: 44, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px', background: screen === 'confirmed' ? C.dark : C.white }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: screen === 'confirmed' ? C.white : C.dark }}>10:45 AM</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 4px', border: `1.5px solid ${screen === 'confirmed' ? '#9CA3AF' : C.dark}`, borderRadius: 3, color: screen === 'confirmed' ? '#9CA3AF' : C.dark }}>LTE</span>
            <div style={{ width: 20, height: 11, borderRadius: 3, border: `1.5px solid ${screen === 'confirmed' ? '#9CA3AF' : C.dark}`, display: 'flex', alignItems: 'center', padding: 1.5 }}>
              <div style={{ width: '80%', height: '100%', background: screen === 'confirmed' ? '#9CA3AF' : C.dark, borderRadius: 1.5 }} />
            </div>
          </div>
        </div>

        {/* Screen content */}
        <div style={{ position: 'absolute', top: 44, bottom: 20, left: 0, right: 0, overflowY: 'auto' }}>
          {renderScreen()}
        </div>

        {/* Home indicator */}
        <div style={{ position: 'absolute', bottom: 6, width: '100%', display: 'flex', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ width: 120, height: 4, borderRadius: 2, background: screen === 'confirmed' ? '#374151' : C.dark }} />
        </div>
      </div>

      <p className="f-mono" style={{ marginTop: 16, fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em' }}>
        FAVOUR.PH · UI MOCK V2 · TAP SCREENS ABOVE TO SWITCH
      </p>
    </div>
  );
}
