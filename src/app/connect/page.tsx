'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import Link from 'next/link';

const INTEREST_OPTIONS = [
  'Sunday Morning Service',
  'Wednesday Bible Study',
  'Small Groups',
  'Ministries',
  "Iron & Fire Men's Ministry",
  'Women\'s Ministry',
  'Youth Ministry',
  'Volunteer Opportunities',
];

export default function ConnectPage() {
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [visitStatus, setVisitStatus] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Menu State
  const [menuOpen, setMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [navAtTop, setNavAtTop] = useState(true);

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  // Map visit status to membershipStatus
  const mapVisitStatus = (status: string) => {
    const map: Record<string, string> = {
      first_time: 'visitor',
      returning: 'regular',
      joining: 'prospective_member',
      info: 'visitor',
    };
    return map[status] || 'visitor';
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');

    try {
      await api.post('/users', {
        firstName,
        lastName,
        email,
        phone,
        password: 'NewBirth2025!', // Temporary password — user can change via app
        membershipStatus: mapVisitStatus(visitStatus),
        ministryInterests: interests,
        attendanceFreq: visitStatus === 'first_time' ? 'first_time' : visitStatus === 'returning' ? 'occasional' : 'regular',
        communicationPref: 'Email',
      });

      // Success
      setSubmittedName(firstName);
      setSubmitted(true);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setVisitStatus('');
      setInterests([]);
      setMessage('');
    } catch (error: any) {
      console.error('Submit error:', error);
      const msg = error?.response?.data?.message || '';
      if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('already')) {
        setSubmitError('This email is already registered. Please use a different email or contact us directly.');
      } else {
        setSubmitError('Something went wrong. Please try again or call us at 317-797-3838.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Navigation Scroll Effect
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) {
        setNavAtTop(true);
        setNavVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setNavVisible(false);
        setNavAtTop(false);
      } else {
        setNavVisible(true);
        setNavAtTop(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <div className="overflow-x-hidden w-full bg-[#2d3d4d] text-white font-light scroll-smooth">
      <style jsx global>{`
        body {
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          color: white;
        }
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
        .font-playfair {
          font-family: 'Playfair Display', serif !important;
        }
        :root {
          --color-navy: #2d3d4d;
          --color-navy-dark: #23303d;
          --color-brand: #00a1a2;
          --color-sand: #d6b796;
        }
        .bg-navy { background-color: var(--color-navy); }
        .bg-navy-dark { background-color: var(--color-navy-dark); }
        .bg-brand { background-color: var(--color-brand); }
        .text-brand { color: var(--color-brand); }
        .border-brand { border-color: var(--color-brand); }
        .bg-sand { background-color: var(--color-sand); }
        .text-sand { color: var(--color-sand); }
        .border-sand { border-color: var(--color-sand); }
        input, textarea, select {
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          transition: all 0.3s ease;
        }
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: var(--color-brand);
          background-color: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 0 1px var(--color-brand);
        }
        input::placeholder, textarea::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        .custom-radio:checked + div {
          border-color: var(--color-brand);
          background-color: rgba(0, 161, 162, 0.1);
        }
        .custom-radio:checked + div .radio-dot {
          transform: scale(1);
        }
        .custom-checkbox:checked + div {
          background-color: var(--color-brand);
          border-color: var(--color-brand);
        }
        .custom-checkbox:checked + div svg {
          opacity: 1;
          transform: scale(1);
        }
        .btn-magnetic { position: relative; overflow: hidden; }
        .btn-magnetic::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: var(--color-sand);
          transform: translateY(100%);
          transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
          z-index: -1;
        }
        .btn-magnetic:hover::after { transform: translateY(0); }
        .btn-magnetic:hover { color: var(--color-navy); border-color: var(--color-sand); }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .menu-item {
          opacity: 0;
          transform: translateY(40px) skewY(2deg);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .menu-open .menu-item { opacity: 1; transform: translateY(0) skewY(0); }
        .menu-link:hover { font-style: italic; padding-left: 20px; color: var(--color-sand); }
        .menu-link { transition: all 0.4s ease; }
      `}</style>

      {/* GLOBAL NAVIGATION */}
      <nav
        className={`fixed z-50 md:px-12 flex w-full pt-6 pr-6 pb-6 pl-6 top-0 left-0 items-center justify-between transition-all duration-400 ${
          navAtTop
            ? 'bg-transparent border-b border-transparent'
            : navVisible
            ? 'bg-[#2d3d4d]/95 backdrop-blur-md border-b border-[#d6b796]/10'
            : '-translate-y-full'
        }`}
      >
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group z-50 relative">
          <img
            src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/f80c87a1-9a26-489f-8bf5-42191beea9c1_800w.png"
            alt="New Birth Praise & Worship Center"
            className="group-hover:opacity-90 transition-opacity duration-300 md:h-14 w-auto h-12 object-contain invert brightness-0"
          />
        </Link>

        {/* Right Side: CTA & Mobile Trigger */}
        <div className="flex items-center gap-6 z-50">
          <Link
            href="/media/"
            className="hidden md:flex items-center gap-2 bg-brand px-6 py-3 text-xs tracking-[0.15em] font-medium uppercase transition-all duration-300 shadow-lg hover:shadow-brand/20 text-white btn-magnetic z-10 border border-transparent"
          >
            <span className="font-sans relative z-10">Media & Events</span>
          </Link>

          {/* Burger Trigger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="group flex flex-col items-center justify-center gap-[5px] w-12 h-12 rounded-full border border-white/20 bg-black/20 hover:bg-brand hover:border-brand backdrop-blur-sm transition-all duration-300 focus:outline-none text-white"
          >
            <span className="h-[2px] w-5 transition-all duration-300 group-hover:bg-white bg-current"></span>
            <span className="h-[2px] w-5 transition-all duration-300 group-hover:bg-white bg-current"></span>
          </button>
        </div>
      </nav>

      {/* MENU OVERLAY */}
      <div
        className={`fixed inset-0 z-[60] transition-transform duration-[800ms] cubic-bezier(0.76, 0, 0.24, 1) flex flex-col ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        } bg-navy`}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="w-full flex justify-end p-6 md:p-12 z-10">
          <button
            onClick={() => setMenuOpen(false)}
            className="group flex items-center gap-3 transition-colors text-white/60 hover:text-sand"
          >
            <span className="text-xs uppercase tracking-[0.2em] font-sans font-normal">Close</span>
            <div className="relative w-10 h-10 flex items-center justify-center border rounded-full group-hover:border-sand transition-all duration-300 group-hover:rotate-90 border-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-white group-hover:text-sand stroke-[1.5]"
              >
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </div>
          </button>
        </div>
        <div className="flex-1 flex flex-col md:flex-row px-6 md:px-12 pb-12 gap-12 overflow-y-auto z-10">
          <div className="w-full md:w-2/3 flex flex-col justify-center">
            <nav className="flex flex-col gap-1">
              <div className="menu-link-wrapper overflow-hidden cursor-pointer group">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className={`menu-item block text-5xl md:text-7xl lg:text-8xl tracking-tight menu-link font-serif font-medium text-white/90 ${
                    menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >
                  <span className="text-xs tracking-widest align-top mr-4 inline-block -mt-4 opacity-50 font-sans text-accent">01</span>Home
                </Link>
              </div>
              <div className="menu-link-wrapper overflow-hidden cursor-pointer group">
                <Link
                  href="/connect"
                  onClick={() => setMenuOpen(false)}
                  className={`menu-item delay-200 block text-5xl md:text-7xl lg:text-8xl tracking-tight menu-link font-serif font-medium text-white/90 ${
                    menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >
                  <span className="text-xs tracking-widest align-top mr-4 inline-block -mt-4 opacity-50 font-sans text-accent">02</span>Connect
                </Link>
              </div>
              <div className="menu-link-wrapper overflow-hidden cursor-pointer group">
                <Link
                  href="/media/"
                  onClick={() => setMenuOpen(false)}
                  className={`menu-item delay-200 block text-5xl md:text-7xl lg:text-8xl tracking-tight menu-link font-serif font-medium text-white/90 ${
                    menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >
                  <span className="text-xs tracking-widest align-top mr-4 inline-block -mt-4 opacity-50 font-sans text-accent">03</span>Media
                </Link>
              </div>
            </nav>
          </div>
          <div className="w-full md:w-1/3 flex flex-col justify-end gap-10 border-t md:border-t-0 md:border-l pt-8 md:pt-0 md:pl-12 border-white/10">
            <div className={`menu-item delay-500 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-xs uppercase tracking-[0.2em] text-accent mb-3 font-medium">Service Times</h3>
              <p className="text-sm leading-relaxed text-white/60">
                Sunday Morning Service — 11:45 AM<br />
                Wednesday Bible Study — 7:00 PM
              </p>
            </div>
            <div className={`menu-item delay-500 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-xs uppercase tracking-[0.2em] text-accent mb-3 font-medium">Contact</h3>
              <p className="text-sm leading-relaxed text-white/60">
                317-797-3838<br />
                newbirthpwcindy@gmail.com
              </p>
            </div>
            <div className={`menu-item delay-500 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <a
                href="#"
                className="block w-full py-4 border text-center uppercase text-xs tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300 border-white/20 text-white/80 rounded-sm"
              >
                Member Portal
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <header className="relative w-full h-[60vh] min-h-[500px] overflow-hidden flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1543165796-5426273eaab3?q=80&w=2670&auto=format&fit=crop"
            alt="Connect Background"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 z-10 bg-navy/60 mix-blend-multiply"></div>
          <div className="bg-gradient-to-b from-navy/40 via-transparent to-navy z-10 absolute top-0 right-0 bottom-0 left-0"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center pt-20">
          <div className="animate-[fadeIn_1s_ease-out_0.5s_forwards] opacity-0 translate-y-4">
            <h1 className="text-5xl md:text-7xl font-playfair text-white tracking-tight leading-none mb-6">
              We&apos;re Glad You&apos;re Here
            </h1>
            <p className="text-lg text-white/80 font-sans font-light max-w-xl mx-auto leading-relaxed">
              Whether you&apos;re visiting for the first time or looking to call this home, we want to connect with you.
            </p>
          </div>
        </div>
      </header>

      {/* 2. CONNECTION FORM SECTION */}
      <section className="z-30 -mt-24 pr-6 pb-24 pl-6 relative">
        <div className="max-w-3xl mx-auto bg-navy-dark border border-white/5 shadow-2xl rounded-sm p-8 md:p-12 animate-[fadeIn_1s_ease-out_0.8s_forwards] opacity-0 translate-y-4">

          {/* SUCCESS STATE */}
          {submitted ? (
            <div className="flex flex-col items-center text-center gap-6 py-12">
              <div className="w-20 h-20 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-playfair text-white mb-3">Thank You, {submittedName || 'Friend'}!</h2>
                <p className="text-white/70 font-sans leading-relaxed max-w-md">
                  Your connection card has been received. Our team will be in touch with you soon.
                </p>
              </div>
              <div className="mt-4 p-4 rounded-sm border border-white/10 bg-white/5 text-left w-full max-w-sm">
                <p className="text-xs uppercase tracking-widest text-brand mb-2 font-medium">Your App Access</p>
                <p className="text-sm text-white/70 font-sans">
                  An account has been created for you. Download the <strong className="text-white">New Birth PWC app</strong> and sign in with your email and the temporary password: <code className="text-brand font-mono">NewBirth2025!</code>
                </p>
                <p className="text-xs text-white/40 mt-2">You can change your password after logging in.</p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs uppercase tracking-widest text-white/40 hover:text-brand transition-colors font-sans"
              >
                Submit another card
              </button>
            </div>
          ) : (
          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            {/* Personal Info */}
            <div className="flex flex-col gap-6">
              <h3 className="text-xs uppercase tracking-[0.2em] text-brand font-medium border-b border-white/5 pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="firstName" className="text-xs uppercase tracking-wider text-white/60">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-sm text-sm focus:ring-1 focus:ring-brand focus:border-brand"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="lastName" className="text-xs uppercase tracking-wider text-white/60">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-sm text-sm focus:ring-1 focus:ring-brand focus:border-brand"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs uppercase tracking-wider text-white/60">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-sm text-sm focus:ring-1 focus:ring-brand focus:border-brand"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-xs uppercase tracking-wider text-white/60">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-sm text-sm focus:ring-1 focus:ring-brand focus:border-brand"
                  />
                </div>
              </div>
            </div>

            {/* Visit Status */}
            <div className="flex flex-col gap-6 pt-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-brand font-medium border-b border-white/5 pb-2">
                Your Visit
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="cursor-pointer group relative">
                  <input
                    type="radio"
                    name="visitStatus"
                    value="first_time"
                    checked={visitStatus === 'first_time'}
                    onChange={(e) => setVisitStatus(e.target.value)}
                    className="peer sr-only custom-radio"
                  />
                  <div className="p-4 rounded-sm border border-white/10 group-hover:border-white/30 transition-all flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center group-hover:border-sand transition-colors">
                      <div className="w-2 h-2 rounded-full bg-brand transform scale-0 transition-transform duration-200 radio-dot"></div>
                    </div>
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors">First time guest</span>
                  </div>
                </label>
                <label className="cursor-pointer group relative">
                  <input
                    type="radio"
                    name="visitStatus"
                    value="returning"
                    checked={visitStatus === 'returning'}
                    onChange={(e) => setVisitStatus(e.target.value)}
                    className="peer sr-only custom-radio"
                  />
                  <div className="p-4 rounded-sm border border-white/10 group-hover:border-white/30 transition-all flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center group-hover:border-sand transition-colors">
                      <div className="w-2 h-2 rounded-full bg-brand transform scale-0 transition-transform duration-200 radio-dot"></div>
                    </div>
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors">I&apos;ve visited before</span>
                  </div>
                </label>
                <label className="cursor-pointer group relative">
                  <input
                    type="radio"
                    name="visitStatus"
                    value="joining"
                    checked={visitStatus === 'joining'}
                    onChange={(e) => setVisitStatus(e.target.value)}
                    className="peer sr-only custom-radio"
                  />
                  <div className="p-4 rounded-sm border border-white/10 group-hover:border-white/30 transition-all flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center group-hover:border-sand transition-colors">
                      <div className="w-2 h-2 rounded-full bg-brand transform scale-0 transition-transform duration-200 radio-dot"></div>
                    </div>
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors">Interested in joining</span>
                  </div>
                </label>
                <label className="cursor-pointer group relative">
                  <input
                    type="radio"
                    name="visitStatus"
                    value="info"
                    checked={visitStatus === 'info'}
                    onChange={(e) => setVisitStatus(e.target.value)}
                    className="peer sr-only custom-radio"
                  />
                  <div className="p-4 rounded-sm border border-white/10 group-hover:border-white/30 transition-all flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center group-hover:border-sand transition-colors">
                      <div className="w-2 h-2 rounded-full bg-brand transform scale-0 transition-transform duration-200 radio-dot"></div>
                    </div>
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors">Looking for info</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Interests */}
            <div className="flex flex-col gap-6 pt-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-brand font-medium border-b border-white/5 pb-2">
                I&apos;m Interested In
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {INTEREST_OPTIONS.map((interest) => {
                  const checked = interests.includes(interest);
                  return (
                    <label key={interest} className="cursor-pointer group relative flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleInterest(interest)}
                      />
                      <div
                        className="w-5 h-5 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          backgroundColor: checked ? 'var(--color-brand)' : 'transparent',
                          borderColor: checked ? 'var(--color-brand)' : 'rgba(255,255,255,0.3)',
                        }}
                      >
                        {checked && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm transition-colors ${checked ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{interest}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-6 pt-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-brand font-medium border-b border-white/5 pb-2">
                How can we help?
              </h3>
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-xs uppercase tracking-wider text-white/60">
                  Is there anything you&apos;d like us to know?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm text-sm focus:ring-1 focus:ring-brand focus:border-brand"
                ></textarea>
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-4 rounded-sm border border-red-500/30 bg-red-500/10 text-red-300 text-sm font-sans">
                {submitError}
              </div>
            )}

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-magnetic bg-brand py-4 text-white uppercase tracking-[0.2em] text-xs font-semibold shadow-xl hover:shadow-brand/20 transition-all border border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : 'Submit Connection Card'}
                </span>
              </button>
              <p className="text-center text-white/30 text-xs mt-4 font-sans">
                Your information is safe and will only be used to connect with you.
              </p>
            </div>
          </form>
          )}
        </div>
      </section>

      {/* 3. NEXT STEPS EXPLANATION */}
      <section className="px-6 md:px-12 pb-24 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-playfair text-center text-white mb-12">What Happens Next?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center gap-4 group">
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-navy-dark group-hover:border-sand transition-colors duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-brand"
                >
                  <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
                  <path d="m21.854 2.147-10.94 10.939"></path>
                </svg>
              </div>
              <h3 className="text-lg font-playfair text-white">We Receive It</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Our team reviews your card immediately. We pray over every request we receive.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center gap-4 group">
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-navy-dark group-hover:border-sand transition-colors duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-brand"
                >
                  <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-playfair text-white">We Connect</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                A member of our team will reach out via email or phone within 24-48 hours.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center gap-4 group">
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-navy-dark group-hover:border-sand transition-colors duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-brand"
                >
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg>
              </div>
              <h3 className="text-lg font-playfair text-white">We Plan</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                If you&apos;re planning a visit, we&apos;ll help you find parking, kids check-in, and a seat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="overflow-hidden text-white z-[60] pt-24 pb-12 relative bg-navy-dark border-t border-white/5">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(var(--color-sand) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>

        <div className="container md:px-12 z-10 mr-auto ml-auto pr-6 pl-6 relative">
          {/* Top Section: CTA */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 border-b border-white/10 pb-12">
            <div className="">
              <h2 className="text-4xl md:text-6xl font-playfair mb-4">Welcome Home!</h2>
              <p className="text-white/60 font-sans font-normal max-w-md">We can&apos;t wait to see you this Sunday.</p>
            </div>
            <a
              href="https://maps.app.goo.gl/3yBw7ar4FcTxM7PA8"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 md:mt-0 flex items-center gap-4 group"
            >
              <span className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-sand group-hover:border-sand group-hover:text-navy transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </span>
              <span className="text-sm uppercase tracking-widest font-sans group-hover:text-sand transition-colors">Get Directions</span>
            </a>
          </div>

          {/* Middle Section: Content & Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            {/* Left: Navigation & Info */}
            <div className="flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="">
                  <h4 className="text-sand text-xs uppercase tracking-[0.2em] mb-6 font-semibold">Service Times</h4>
                  <ul className="space-y-4 font-sans text-sm text-white/70">
                    <li>Wednesday Bible Study — 7:00 PM</li>
                    <li>Sunday Morning Service — 11:45 AM</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sand text-xs uppercase tracking-[0.2em] mb-6 font-semibold">Contact</h4>
                  <ul className="space-y-4 font-sans text-sm text-white/70">
                    <li className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 mt-1 text-brand"
                      >
                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>
                        1701 Dr. Andrew J Brown Ave<br />
                        Indianapolis, Indiana 46202
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-brand"
                      >
                        <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>
                      </svg>
                      <span>317-797-3838</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/newbirthpwcindy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-brand hover:text-brand transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a
                  href="https://youtube.com/@NewBirthPWCIndy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-brand hover:text-brand transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                    <path d="m10 15 5-3-5-3z"></path>
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: Map */}
            <div className="w-full h-[350px] bg-navy-dark relative rounded-lg overflow-hidden border border-white/10 map-container group">
              <iframe
                src="https://maps.google.com/maps?q=1701+Dr+Andrew+J+Brown+Ave,+Indianapolis,+IN+46202&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) invert(90%) hue-rotate(180deg) brightness(90%) contrast(90%)', transition: 'filter 0.5s ease' }}
                allowFullScreen
                loading="lazy"
                className="group-hover:filter-none"
              ></iframe>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-difference z-10">
                <div className="w-12 h-12 rounded-full bg-brand/20 animate-ping absolute"></div>
                <div className="w-4 h-4 rounded-full bg-brand border-2 border-white relative z-20"></div>
              </div>
            </div>
          </div>

          {/* Bottom: Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-xs text-white/40 font-sans">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <img
                src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/f80c87a1-9a26-489f-8bf5-42191beea9c1_1600w.png"
                alt="Logo"
                className="h-6 brightness-0 invert opacity-50"
              />
              <span>© 2024 New Birth Praise & Worship Center</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-brand transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-brand transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
