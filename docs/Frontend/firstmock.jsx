import React, { useState, useEffect } from 'react';
import { 
  Wrench, Zap, Fan, Sparkles, ChevronRight, Star, 
  MapPin, Clock, ShieldCheck, AlertTriangle, CheckCircle2, 
  CreditCard, Wallet, HelpCircle, ArrowRight, LayoutGrid, 
  Users, Activity, ChevronDown, Check, XCircle, FileText,
  Phone, MessageSquare, Search, Map, Navigation, Bell, Shield,
  HeartHandshake, PenTool, Image as ImageIcon, Loader2
} from 'lucide-react';

// --- THEME CONSTANTS (Reverted to Mature/Flat Palette) ---
const colors = {
  primary: '#0047CC', // Utility Blue
  danger: '#D92121',  // Ops Red
  warning: '#B36B00', // Amber
  success: '#007A33', // Verify Green
  ink900: '#111827',  // Heavy Ink
  ink700: '#4B5563',  // Subdued Text
  surface300: '#9CA3AF', 
  surface200: '#E5E7EB', 
  white: '#FFFFFF',
};

// --- CORE COMPONENTS (Flat, crisp, mature) ---
const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "h-[48px] w-full rounded-[8px] font-bold text-[17px] flex items-center justify-center transition-all active:scale-[0.98]";
  const variants = {
    primary: "bg-[#0047CC] text-white hover:bg-[#0038A8]",
    secondary: "bg-white text-[#111827] border-[1.5px] border-[#9CA3AF] hover:border-[#111827]",
    danger: "bg-[#D92121] text-white hover:bg-[#B91C1C]",
    success: "bg-[#007A33] text-white hover:bg-[#005c26]",
    ghost: "bg-transparent text-[#4B5563] hover:bg-[#F3F4F6] text-[15px]"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '', active = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative rounded-[12px] border-[1.5px] bg-white p-4 transition-colors overflow-hidden ${
        active 
          ? 'border-[#0047CC] bg-[#F9FAFB] cursor-default' 
          : 'border-[#E5E7EB] cursor-pointer hover:border-[#9CA3AF]'
      } ${className}`}
    >
      {/* Flat active index line restored to Blue */}
      {active && <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-[#0047CC]" />}
      {children}
    </div>
  );
};

const StatusPill = ({ status, label }) => {
  const dots = {
    success: 'bg-[#007A33]',
    warning: 'bg-[#B36B00]',
    danger: 'bg-[#D92121]',
    info: 'bg-[#0047CC]'
  };
  return (
    <div className="inline-flex items-center h-7 px-2.5 rounded-full border-[1.5px] border-[#E5E7EB] bg-white shrink-0">
      <div className={`w-[6px] h-[6px] rounded-full mr-2 ${dots[status]}`} />
      <span className="text-[13px] font-bold text-[#111827] font-sans tracking-wide uppercase">{label}</span>
    </div>
  );
};

const Input = ({ label, type = 'text', defaultValue, error, placeholder, prefix }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-[13px] font-bold text-[#4B5563] font-body tracking-wider uppercase">{label}</label>}
    <div className="relative flex">
      {prefix && (
        <div className="h-[48px] px-4 border-[1.5px] border-r-0 border-[#9CA3AF] rounded-l-[4px] bg-[#F3F4F6] flex items-center justify-center font-mono font-bold text-[#111827]">
          {prefix}
        </div>
      )}
      <input 
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`h-[48px] w-full ${prefix ? 'rounded-r-[4px]' : 'rounded-[4px]'} border-[1.5px] px-3 text-[17px] font-medium text-[#111827] font-body outline-none transition-colors ${
          error ? 'border-[#D92121]' : 'border-[#9CA3AF] focus:border-[#0047CC]'
        }`}
      />
    </div>
    {error && <span className="text-[13px] font-bold text-[#D92121] mt-1">{error}</span>}
  </div>
);

// --- SCREENS WITH WARMER COPY BUT MATURE/FLAT UI ---

const AuthScreen = () => {
  return (
    <div className="flex flex-col h-full bg-white text-[#111827]">
      <div className="p-6 flex-1 flex flex-col justify-center">
        <div className="w-12 h-12 bg-[#111827] rounded-[8px] flex items-center justify-center mb-6">
          <Wrench className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-mono font-bold text-[36px] tracking-tighter leading-none mb-3">
          FAVOUR<span className="text-[#0047CC]">.PH</span>
        </h1>
        <p className="text-[#4B5563] text-[17px] font-body mb-10 leading-relaxed">
          Magandang araw! <br/> Your home's best friend is just a tap away.
        </p>

        <div className="space-y-6">
          <Input 
            label="Mobile Number" 
            prefix="+63"
            placeholder="917 000 0000" 
            type="tel"
          />
          <Button>Send Secure Code</Button>
        </div>

        <div className="mt-8 pt-8 border-t-[1.5px] border-dashed border-[#E5E7EB]">
           <div className="flex items-start gap-3 p-4 bg-[#F9FAFB] rounded-[8px] border-[1.5px] border-[#E5E7EB]">
             <Shield className="w-5 h-5 text-[#007A33] shrink-0 mt-0.5" />
             <p className="text-[14px] text-[#4B5563] font-body leading-relaxed font-medium">
               Every Kuya and Ate on our platform undergoes a strict NBI and TESDA background check. You're in safe hands.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const HomeScreen = () => {
  const [view, setView] = useState('list');
  const services = [
    { id: 'aircon', name: 'Aircon', icon: Fan },
    { id: 'plumbing', name: 'Plumbing', icon: Wrench },
    { id: 'electrical', name: 'Electrical', icon: Zap },
    { id: 'cleaning', name: 'Cleaning', icon: Sparkles },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6] text-[#111827]">
      {/* Mature, Flat Header */}
      <div className="bg-[#111827] text-white p-5 pb-6">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-2 cursor-pointer">
             <MapPin className="w-4 h-4 text-[#9CA3AF]" />
             <span className="font-bold text-[15px] tracking-wide border-b-[1.5px] border-dashed border-[#4B5563] pb-0.5">Legazpi Village, Makati</span>
             <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
           </div>
           <div className="relative">
             <Bell className="w-6 h-6 text-white" />
             <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#0047CC] rounded-full border-[2px] border-[#111827]"></div>
           </div>
        </div>
        <h2 className="text-[22px] font-bold font-sans mb-4 tracking-tight">What needs fixing today, boss?</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4B5563]" />
          <input 
            type="text" 
            placeholder="e.g. Leaking sink, Aircon cleaning..." 
            className="h-[52px] w-full rounded-[6px] bg-white border-none pl-10 pr-4 text-[16px] font-bold text-[#111827] outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {/* Flat Category Grid */}
        <div className="grid grid-cols-4 gap-0 bg-white border-b-[1.5px] border-[#E5E7EB]">
          {services.map((s, i) => (
            <div key={s.id} className={`flex flex-col items-center p-5 cursor-pointer hover:bg-[#F9FAFB] ${i !== 3 ? 'border-r-[1.5px] border-[#E5E7EB]' : ''}`}>
              <div className="w-12 h-12 rounded-[8px] bg-[#F3F4F6] border-[1.5px] border-[#E5E7EB] flex items-center justify-center mb-3 text-[#111827]">
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-[13px] font-bold text-[#111827] tracking-tight">{s.name}</span>
            </div>
          ))}
        </div>

        {/* Discovery Section */}
        <div className="p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[16px] font-[800] font-sans text-[#111827]">Pros Near You</h2>
            {/* Industrial Toggle */}
            <div className="flex border-[1.5px] border-[#111827] rounded-[6px] overflow-hidden bg-white">
              <button 
                onClick={() => setView('list')}
                className={`px-4 py-1.5 text-[12px] font-bold font-mono tracking-tight transition-colors ${view === 'list' ? 'bg-[#111827] text-white' : 'text-[#4B5563]'}`}
              >LIST</button>
              <button 
                onClick={() => setView('map')}
                className={`px-4 py-1.5 text-[12px] font-bold font-mono tracking-tight transition-colors border-l-[1.5px] border-[#111827] ${view === 'map' ? 'bg-[#111827] text-white' : 'text-[#4B5563]'}`}
              >MAP</button>
            </div>
          </div>

          {view === 'list' ? (
            <div className="space-y-3">
              {[
                { name: 'Kuya Mateo D.', trade: 'Plumber', rating: '4.98', distance: '0.8 KM', jobs: 1204 },
                { name: 'Ate Sarah L.', trade: 'Cleaning', rating: '5.00', distance: '1.2 KM', jobs: 842 }
              ].map((worker, i) => (
                <Card key={i} className="flex gap-4 p-4 items-center !rounded-[12px]">
                  <div className="w-12 h-12 rounded-[6px] bg-[#E5E7EB] border-[1.5px] border-[#9CA3AF] shrink-0 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${worker.name}`} alt="avatar" className="grayscale contrast-125 bg-white w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-[800] text-[16px] tracking-tight">{worker.name}</h3>
                      <span className="font-mono text-[12px] font-bold text-[#0047CC] bg-[#F0F5FF] border-[1.5px] border-[#0047CC] px-1.5 py-0.5 rounded-[4px]">{worker.distance}</span>
                    </div>
                    <p className="text-[13px] font-bold text-[#4B5563] mt-0.5 font-body">{worker.trade}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-3.5 h-3.5 fill-[#111827] text-[#111827]" />
                      <span className="font-mono text-[13px] font-bold text-[#111827]">{worker.rating}</span>
                      <span className="text-[12px] text-[#4B5563] font-body">({worker.jobs} jobs)</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
             <div className="w-full h-[300px] border-[1.5px] border-[#111827] rounded-[12px] bg-[#E5E7EB] relative overflow-hidden">
              {/* Fake Map Grid */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#111827 1.5px, transparent 1.5px), linear-gradient(90deg, #111827 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
              <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-[#0047CC] rounded-full border-[2px] border-white"></div>
              <div className="absolute top-1/3 left-2/3 w-4 h-4 bg-[#0047CC] rounded-full border-[2px] border-white"></div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-white/90 px-3 py-1 font-mono text-[12px] font-bold border-[1.5px] border-[#111827] backdrop-blur-sm">MAP_VIEW_ACTIVE</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const JobTrackerScreen = () => {
  const steps = [
    { time: '10:00 AM', title: 'We\'ve got your request', desc: 'Finding the best pro for you.', status: 'done' },
    { time: '10:15 AM', title: 'Kuya Mateo is assigned', desc: 'He is packing his gear and heading out.', status: 'active' },
    { time: '--:-- --', title: 'Pro is at your door', desc: 'Ready to get to work.', status: 'pending' },
    { time: '--:-- --', title: 'Job well done', desc: 'Sign off and settle payment.', status: 'pending' },
  ];

  return (
    <div className="flex flex-col h-full bg-white text-[#111827]">
      <div className="p-5 border-b-[1.5px] border-[#E5E7EB]">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-[24px] font-[800] tracking-tight">Service Tracker</h1>
          <span className="font-mono text-[13px] font-bold bg-[#F3F4F6] px-2 py-1 rounded-[4px] border-[1.5px] border-[#E5E7EB]">FVR-992-AX8</span>
        </div>
        
        {/* Friendly Profile Box - Flat */}
        <div className="flex gap-4 bg-[#111827] text-white p-4 rounded-[12px] items-center">
          <div className="w-12 h-12 rounded-[8px] bg-[#E5E7EB] border-[1.5px] border-[#9CA3AF] overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=Mateo`} alt="avatar" className="grayscale contrast-125 bg-white w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="font-[800] text-[17px] leading-tight tracking-tight">Kuya Mateo</h3>
            <p className="font-mono text-[12px] text-[#9CA3AF] mt-1 font-bold">PLUMBING PRO</p>
          </div>
          <div className="w-10 h-10 rounded-[8px] border-[1.5px] border-[#4B5563] flex items-center justify-center cursor-pointer hover:bg-[#374151] transition-colors">
            <Phone className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        <h3 className="text-[13px] font-[800] font-body text-[#4B5563] uppercase tracking-wider mb-6">Live Status</h3>
        
        <div className="relative pl-[88px]">
          {/* Vertical Tracking Line */}
          <div className="absolute left-[103px] top-2 bottom-6 w-[2px] bg-[#E5E7EB]"></div>
          
          {steps.map((step, i) => (
            <div key={i} className="relative mb-8 last:mb-0">
              {/* Mono Timestamp */}
              <div className="absolute -left-[88px] top-0 w-[72px] text-right">
                <span className={`font-mono text-[13px] ${step.status === 'active' ? 'font-bold text-[#0047CC]' : step.status === 'done' ? 'font-bold text-[#111827]' : 'text-[#9CA3AF]'}`}>
                  {step.time}
                </span>
              </div>
              
              {/* Node Indicator */}
              <div className="absolute -left-[20px] top-[2px] w-3 h-3 rounded-full bg-white border-[2px] z-10 box-content flex items-center justify-center"
                   style={{ borderColor: step.status === 'active' ? '#0047CC' : step.status === 'done' ? '#111827' : '#E5E7EB' }}>
                {step.status === 'active' && <div className="w-1.5 h-1.5 bg-[#0047CC] rounded-full animate-pulse"></div>}
                {step.status === 'done' && <div className="w-1.5 h-1.5 bg-[#111827] rounded-full"></div>}
              </div>

              {/* Content */}
              <div className={`pt-0 ${step.status === 'pending' ? 'opacity-40' : ''}`}>
                <h4 className={`font-[800] text-[16px] leading-none mb-1.5 ${step.status === 'active' ? 'text-[#0047CC]' : 'text-[#111827]'}`}>
                  {step.title}
                </h4>
                <p className="text-[14px] text-[#4B5563] font-body leading-relaxed">{step.desc}</p>
                
                {step.status === 'active' && (
                  <div className="mt-3 bg-[#F0F5FF] border-[1.5px] border-[#0047CC] border-dashed rounded-[8px] p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-[#0047CC]" />
                        <span className="text-[13px] font-[800] font-sans text-[#0047CC] uppercase">He's on his way</span>
                      </div>
                      <span className="font-mono font-bold text-[#0047CC] text-[14px]">14 MINS</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- LOGO GENERATOR COMPONENT (Updated Prompt for Mature Aesthetic) ---
const LogoGeneratorScreen = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateLogo = async () => {
    setLoading(true);
    setError(null);
    setImageUrl(null);

    const apiKey = ""; // Provided at runtime by Canvas environment
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
    
    // UPDATED PROMPT: Removed bright yellow/smiling sun. Replaced with mature/flat constraints.
    const prompt = "A minimalist, flat, mature logo for a Philippine home services app named Favour. Features a clean geometric wrench. High contrast, pure white background, cobalt blue and strict black, structural lines, no shadows, no gradients, vector illustration style, mature, industrial, highly legible.";

    try {
      if (!apiKey) {
         throw new Error("API Key not available in this preview environment yet, but this is the exact code that triggers the model.");
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: { prompt },
          parameters: { sampleCount: 1 }
        })
      });

      if (!response.ok) throw new Error("Failed to generate image.");
      
      const data = await response.json();
      const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
      if (base64Image) {
        setImageUrl(`data:image/png;base64,${base64Image}`);
      }
    } catch (err) {
      setTimeout(() => {
        setImageUrl('placeholder');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6] text-[#111827] p-5">
       <div className="mb-6 mt-4">
        <h1 className="text-[28px] font-[800] tracking-tight leading-tight">Brand Assets</h1>
        <p className="text-[#4B5563] text-[15px] mt-2 font-body">Generate a flat logo concept using AI.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {imageUrl ? (
          <div className="w-full aspect-square border-[1.5px] border-[#111827] rounded-[16px] bg-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
            {imageUrl === 'placeholder' ? (
               <div className="text-center">
                 <div className="w-20 h-20 bg-[#111827] rounded-[8px] mx-auto flex items-center justify-center mb-6 relative">
                    <Wrench className="w-10 h-10 text-white" />
                 </div>
                 <h2 className="font-mono font-bold text-[28px] tracking-tighter">FAVOUR.PH</h2>
                 <p className="font-mono text-[12px] mt-2 text-[#9CA3AF]">GENERATED_CONCEPT_01</p>
               </div>
            ) : (
              <img src={imageUrl} alt="Generated Logo" className="w-full h-full object-contain" />
            )}
          </div>
        ) : (
          <div className="w-full aspect-square border-[1.5px] border-dashed border-[#9CA3AF] rounded-[16px] bg-white flex flex-col items-center justify-center p-8 text-center">
             <ImageIcon className="w-10 h-10 text-[#9CA3AF] mb-4" />
             <p className="text-[#4B5563] font-body font-bold text-[14px]">No logo generated yet.</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Button onClick={generateLogo} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PenTool className="w-5 h-5" />}
          {loading ? 'Rendering...' : 'Generate AI Logo Concept'}
        </Button>
      </div>
    </div>
  );
};


// --- APP WRAPPER & NAVIGATION ---

export default function FavourAppSystem() {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { category: 'Customer Journey', items: [
      { id: 'auth', label: 'Auth / OTP' },
      { id: 'home', label: 'Discovery / Map' },
      { id: 'tracker', label: 'Service Tracker' },
    ]},
    { category: 'Brand Generation', items: [
      { id: 'logo', label: 'AI Logo Generator' },
    ]}
  ];

  const renderScreen = () => {
    switch (activeTab) {
      case 'auth': return <AuthScreen />;
      case 'home': return <HomeScreen />;
      case 'tracker': return <JobTrackerScreen />;
      case 'logo': return <LogoGeneratorScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] p-4 md:p-8 font-sans" style={{ fontFamily: '"Manrope", sans-serif' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Figtree:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700;800&display=swap');
        .font-sans { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Figtree', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}} />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-[260px] shrink-0 space-y-6 bg-white p-6 rounded-[16px] border-[1.5px] border-[#E5E7EB] h-fit">
          <div className="border-b-[1.5px] border-dashed border-[#E5E7EB] pb-6">
            <div className="font-mono font-bold text-[28px] tracking-tighter leading-none">FAVOUR<span className="text-[#0047CC]">.PH</span></div>
            <div className="text-[11px] font-bold text-[#4B5563] uppercase tracking-widest mt-2 flex items-center gap-2">
               v4 <span className="w-1 h-1 rounded-full bg-[#0047CC]"></span> Flat & Mature
            </div>
          </div>
          
          <div className="space-y-6">
            {tabs.map((group, idx) => (
              <div key={idx}>
                <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3 font-mono">{group.category}</h3>
                <div className="space-y-1.5">
                  {group.items.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-[6px] font-bold text-[14px] transition-all border-[1.5px] relative overflow-hidden ${
                        activeTab === tab.id 
                          ? 'bg-[#F9FAFB] border-[#0047CC] text-[#111827]' 
                          : 'bg-transparent border-transparent text-[#4B5563] hover:bg-[#F3F4F6] hover:border-[#E5E7EB]'
                      }`}
                    >
                      {activeTab === tab.id && <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-[#0047CC]" />}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phone / Canvas Container */}
        <div className="flex-1 flex justify-center items-start">
          <div className={`relative w-[375px] h-[812px] rounded-[48px] shadow-xl border-[12px] border-[#111827] overflow-hidden shrink-0 bg-white`}>
            {/* Fake Status Bar */}
            <div className={`absolute top-0 w-full h-[54px] z-50 flex justify-between items-center px-6 text-[12px] font-mono tracking-wide pt-2 text-[#111827]`}>
              <span className="font-bold">10:45 AM</span>
              <div className="flex gap-1.5 items-center">
                <span className="text-[10px] mr-1 border-[1.5px] border-current px-1 rounded-sm font-bold opacity-80">LTE</span>
                <div className="w-4 h-2.5 rounded-[2px] border-[1.5px] border-current flex justify-end p-[1px] opacity-80"><div className="w-[80%] h-full bg-current rounded-[1px]"></div></div>
              </div>
            </div>
            
            {/* Screen Content Wrapper */}
            <div className={`w-full h-full pt-[54px] pb-[34px] overflow-hidden flex flex-col rounded-[36px] bg-white`}>
              {renderScreen()}
            </div>

            {/* Fake Home Indicator */}
            <div className="absolute bottom-2 w-full flex justify-center z-50">
              <div className={`w-[120px] h-[4px] rounded-full bg-[#111827]`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}