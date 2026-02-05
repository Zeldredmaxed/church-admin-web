'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Church, X, PlayCircle, ArrowRight, MapPin, Phone, Facebook, Youtube } from 'lucide-react';
import api from '@/utils/api';

export default function HomePage() {
  // Menu State
  const [menuOpen, setMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [navAtTop, setNavAtTop] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [latestMessages, setLatestMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Refs for animations
  const heroSliderRef = useRef<HTMLDivElement>(null);
  const pinnedNavRef = useRef<HTMLDivElement>(null);

  // Fetch Latest Messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get('/media');
        setLatestMessages(response.data.slice(0, 3)); // Get first 3
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  // Hero Slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Navigation Scroll Effect
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 20) {
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

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (url: string) => {
    if (!url) return '';
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  return (
    <div className="overflow-x-hidden w-full bg-[#030712] text-white font-light scroll-smooth selection:bg-[#d4b483] selection:text-black">
      <style jsx global>{`
        body {
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          color: white;
          background-color: #030712;
        }
        .font-serif { font-family: 'Playfair Display', serif; }
        :root {
          --color-bg: #030712;
          --color-card: #0f172a;
          --color-accent: #d4b483;
          --color-text-muted: #94a3b8;
        }
        .bg-theme { background-color: var(--color-bg); }
        .bg-card-theme { background-color: var(--color-card); }
        .text-accent { color: var(--color-accent); }
        .border-accent { border-color: var(--color-accent); }
        .bg-accent { background-color: var(--color-accent); }
        .hover\:text-accent:hover { color: var(--color-accent); }
        .hover\:bg-accent:hover { background-color: var(--color-accent); }
        .hover\:border-accent:hover { border-color: var(--color-accent); }
        .gradient-overlay-bottom {
          background: linear-gradient(to top, var(--color-bg) 0%, rgba(3, 7, 18, 0.6) 50%, transparent 100%);
        }
        .gradient-overlay-full {
          background: linear-gradient(180deg, rgba(3, 7, 18, 0.7) 0%, rgba(3, 7, 18, 0.4) 100%);
        }
        .img-dim { background-color: rgba(3, 7, 18, 0.4); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--color-bg); }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--color-accent); }
        .menu-item {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .menu-open .menu-item {
          opacity: 1;
          transform: translateY(0);
        }
        .menu-link { transition: color 0.3s ease, padding-left 0.3s ease; }
        .menu-link:hover { padding-left: 1rem; color: var(--color-accent); }
        @keyframes flashPass {
          0% { transform: skewX(-20deg) translateX(-150%); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: skewX(-20deg) translateX(250%); opacity: 0; }
        }
        .animate-flash-pass {
          animation: flashPass 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .img-hover-scale {
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .group:hover .img-hover-scale { transform: scale(1.08); }
        .sticky-card {
          position: sticky;
          top: 0;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          box-shadow: 0 -10px 40px rgba(0,0,0,0.7);
        }
        .sticky-card.is-active .text-reveal-item {
          opacity: 1;
          transform: translateY(0);
        }
        .text-reveal-item {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
        .delay-500 { transition-delay: 500ms; }
        .btn-magnetic { position: relative; overflow: hidden; }
        .btn-magnetic::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; width: 100%; height: 100%;
          background-color: white;
          transform: translateY(100%);
          transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
          z-index: -1;
        }
        .btn-magnetic:hover::after { transform: translateY(0); }
        .btn-magnetic:hover { color: black; border-color: white; }
        .map-container iframe {
          filter: grayscale(100%) invert(90%) hue-rotate(180deg) contrast(85%);
          transition: filter 0.5s ease;
        }
        .map-container:hover iframe { filter: grayscale(0%) invert(0%); }
        @keyframes fadeIn {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* GLOBAL NAVIGATION */}
      <nav
        className={`fixed z-50 w-full md:px-12 flex pt-6 pr-6 pb-6 pl-6 top-0 left-0 items-center justify-between transition-all duration-400 ${
          navAtTop
            ? 'bg-transparent border-b border-transparent'
            : navVisible
            ? 'bg-[#030712]/80 backdrop-blur-md border-b border-white/5'
            : '-translate-y-full'
        }`}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group z-50 relative">
          <span className="w-10 h-10 border border-white/20 flex items-center justify-center rounded-full group-hover:border-accent transition-colors duration-300">
            <Church className="w-5 h-5 text-white group-hover:text-accent transition-colors" />
          </span>
          <span className="hidden md:block font-serif text-lg tracking-tight font-medium">New Birth</span>
        </Link>

        {/* CTA & Menu */}
        <div className="flex items-center gap-6 z-50">
          <Link
            href="/connect"
            className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-3 text-xs tracking-[0.15em] font-medium uppercase transition-all duration-300 hover:border-white text-white btn-magnetic z-10 rounded-full"
          >
            <span className="font-sans relative z-10">Plan Your Visit</span>
          </Link>

          <button
            onClick={() => setMenuOpen(true)}
            className="group flex flex-col items-center justify-center gap-[6px] w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white hover:border-white backdrop-blur-md transition-all duration-300 focus:outline-none text-white hover:text-black"
          >
            <span className="h-[1px] w-5 transition-all duration-300 bg-current"></span>
            <span className="h-[1px] w-5 transition-all duration-300 bg-current"></span>
          </button>
        </div>
      </nav>

      {/* FULLSCREEN MENU OVERLAY */}
      <div
        className={`fixed inset-0 z-[60] transition-transform duration-[800ms] cubic-bezier(0.76, 0, 0.24, 1) flex flex-col ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        } bg-theme`}
      >
        {/* Close Button */}
        <div className="w-full flex justify-end p-6 md:p-12 z-20">
          <button
            onClick={() => setMenuOpen(false)}
            className="group flex items-center gap-3 transition-colors text-white/50 hover:text-white"
          >
            <span className="text-xs uppercase tracking-[0.2em] font-sans font-medium">Close</span>
            <div className="relative w-10 h-10 flex items-center justify-center border rounded-full group-hover:border-white transition-all duration-300 group-hover:rotate-90 border-white/20">
              <X className="w-5 h-5 text-white stroke-[1.5]" />
            </div>
          </button>
        </div>

        {/* Menu Links */}
        <div className="flex-1 flex flex-col md:flex-row px-6 md:px-12 pb-12 gap-12 overflow-y-auto z-10">
          <div className="w-full md:w-2/3 flex flex-col justify-center">
            <nav className="flex flex-col gap-1">
              <div className="menu-link-wrapper overflow-hidden cursor-pointer group">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className={`menu-item block text-5xl md:text-7xl lg:text-8xl tracking-tight menu-link font-serif font-medium text-white/90 ${
                    menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
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
                    menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
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
                    menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                >
                  <span className="text-xs tracking-widest align-top mr-4 inline-block -mt-4 opacity-50 font-sans text-accent">03</span>Media
                </Link>
              </div>
            </nav>
          </div>

          {/* Menu Info */}
          <div className="w-full md:w-1/3 flex flex-col justify-end gap-10 border-t md:border-t-0 md:border-l pt-8 md:pt-0 md:pl-12 border-white/10">
            <div className={`menu-item delay-500 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              <h3 className="text-xs uppercase tracking-[0.2em] text-accent mb-3 font-medium">Service Times</h3>
              <p className="text-sm leading-relaxed text-white/60">
                Sunday Morning Service — 11:45 AM<br />
                Wednesday Bible Study — 7:00 PM
              </p>
            </div>
            <div className={`menu-item delay-500 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              <h3 className="text-xs uppercase tracking-[0.2em] text-accent mb-3 font-medium">Contact</h3>
              <p className="text-sm leading-relaxed text-white/60">
                317-797-3838<br />
                newbirthpwcindy@gmail.com
              </p>
            </div>
            <div className={`menu-item delay-500 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
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

      {/* HERO SECTION */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Background Slider */}
        <div ref={heroSliderRef} className="absolute inset-0 z-0">
          {/* Slide 1: Worship */}
          <img
            src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/9b3e0866-57e9-4ccd-9c0a-0ba89f0353ad_3840w.jpg"
            alt="Worship"
            className={`hero-slide absolute inset-0 h-full w-full object-cover transition-all duration-[2000ms] ease-in-out ${
              currentSlide === 0 ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
          />
          {/* Slide 2: Community */}
          <img
            src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/d53d6b18-e4a7-43af-8d21-ba54a352dfeb_3840w.jpg"
            alt="Community"
            className={`hero-slide absolute inset-0 h-full w-full object-cover transition-all duration-[2000ms] ease-in-out ${
              currentSlide === 1 ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
          />
          {/* Slide 3: Building/Light */}
          <img
            src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/b3c08853-8725-4429-8c99-4aac3821c371_800w.jpg"
            alt="Sanctuary"
            className={`hero-slide absolute inset-0 h-full w-full object-cover transition-all duration-[2000ms] ease-in-out ${
              currentSlide === 2 ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
          />

          <div className="absolute inset-0 z-10 bg-black/50"></div>
          <div className="absolute inset-0 z-10 gradient-overlay-bottom"></div>
        </div>

        {/* Main Content */}
        <main className="flex flex-col select-none text-center w-full h-full z-20 pb-20 relative items-center justify-center px-4">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl lg:text-[6rem] leading-none tracking-tight font-serif font-medium text-white opacity-0 translate-y-8 animate-[fadeIn_1s_ease-out_0.5s_forwards]">
              New Life Begins
            </h1>
            <div className="opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards]">
              <span className="text-2xl md:text-4xl font-serif text-accent italic font-normal">in His Presence</span>
            </div>
            <p className="max-w-md mx-auto text-sm md:text-base text-white/70 uppercase tracking-[0.2em] mt-8 opacity-0 animate-[fadeIn_1s_ease-out_1.5s_forwards]">
              New Birth Praise & Worship Center
            </p>
          </div>

          <div className="mt-12 opacity-0 animate-[fadeIn_1s_ease-out_2s_forwards]">
            <Link
              href="/media/"
              className="inline-flex items-center gap-3 border border-white/20 px-8 py-3 text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300 rounded-full backdrop-blur-md"
            >
              <span>Watch Online</span>
              <PlayCircle className="w-4 h-4 stroke-1" />
            </Link>
          </div>
        </main>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-0 right-0 mx-auto flex w-fit flex-col items-center gap-y-4 animate-bounce z-20 opacity-60">
          <div className="text-[10px] tracking-[0.3em] uppercase font-sans text-white">Scroll</div>
          <div className="h-10 w-px bg-gradient-to-b from-transparent via-white to-transparent"></div>
        </div>
      </div>

      {/* INTRO GRID SECTION */}
      <section className="relative z-10 bg-white text-slate-900 py-24 md:py-32 px-6 md:px-12 lg:px-20 overflow-hidden" id="intro">
        <div className="max-w-3xl mx-auto text-center mb-24">
          <p className="text-sm md:text-base leading-loose uppercase tracking-[0.15em] font-medium text-slate-500">
            A community where faith is forged, families are strengthened, and futures are rewritten.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20 max-w-[1600px] mx-auto">
          {/* Left Column */}
          <div className="flex flex-col space-y-20 md:pt-20">
            <div className="w-full relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 mb-8 tracking-tight">Belonging Before Believing</h2>
              <div className="w-full md:w-[85%]">
                <div className="relative aspect-[4/3] overflow-hidden mb-6 rounded-sm shadow-2xl reveal-wrapper">
                  <div className="absolute inset-0 z-20 pointer-events-none opacity-0 bg-accent mix-blend-overlay w-[150%] h-full -left-1/4" data-flash="true"></div>
                  <img
                    src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/7f848033-af75-4726-be2e-2e39e592cc1c_1600w.jpg"
                    alt="Community Gathering"
                    className="img-hover-scale parallax-img absolute w-full h-[120%] object-cover top-0"
                  />
                </div>
              </div>
              <div className="pl-2 md:w-[80%]">
                <h3 className="uppercase text-slate-400 text-xs font-semibold tracking-[0.15em] mb-3">Authentic Community</h3>
                <p className="text-slate-600 leading-relaxed font-light">
                  We are not just a building; we are a family. Discover a place where you are known, loved, and encouraged to grow.
                </p>
              </div>
            </div>

            <div className="w-full md:w-[85%] md:ml-auto">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm shadow-2xl reveal-wrapper group">
                <div className="absolute inset-0 z-20 pointer-events-none opacity-0 bg-accent mix-blend-overlay w-[150%] h-full -left-1/4" data-flash="true"></div>
                <img
                  src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/343ce909-bb76-42c1-87cf-df840254c92f_1600w.jpg"
                  alt="Friends laughing"
                  className="img-hover-scale parallax-img absolute w-full h-[120%] object-cover top-0"
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col space-y-20">
            <div className="w-full md:w-[85%] md:mr-auto">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm shadow-2xl reveal-wrapper group">
                <div className="absolute inset-0 z-20 pointer-events-none opacity-0 bg-accent mix-blend-overlay w-[150%] h-full -left-1/4" data-flash="true"></div>
                <img
                  src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/429839b2-2a15-4f52-a16b-39c58aa71565_1600w.jpg"
                  alt="Teaching"
                  className="img-hover-scale parallax-img absolute w-full h-[120%] object-cover top-0"
                />
              </div>
            </div>

            <div className="w-full relative md:w-full self-end">
              <div className="w-full md:w-[85%] ml-auto">
                <div className="relative aspect-[16/10] overflow-hidden mb-6 rounded-sm shadow-2xl reveal-wrapper group">
                  <div className="absolute inset-0 z-20 pointer-events-none opacity-0 bg-accent mix-blend-overlay w-[150%] h-full -left-1/4" data-flash="true"></div>
                  <img
                    src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/b0b467fe-dec3-490d-be66-b3104d4fa7c8_1600w.jpg"
                    alt="Worship Moment"
                    className="img-hover-scale parallax-img absolute w-full h-[120%] object-cover top-0"
                  />
                </div>
              </div>
              <div className="md:text-right pr-2 md:w-[80%] md:ml-auto">
                <h3 className="uppercase text-slate-400 text-xs font-semibold tracking-[0.15em] mb-3">Transformative Teaching</h3>
                <p className="text-slate-600 leading-relaxed font-light">
                  Rooted in scripture and relevant for today. We believe the Word of God has the power to change situations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STICKY EXPERIENCES CONTAINER */}
      <div className="relative w-full bg-theme">
        {/* Pinned Nav */}
        <nav
          ref={pinnedNavRef}
          className="hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 z-[40] flex-col gap-5 items-end transition-opacity duration-500 opacity-0 pointer-events-none"
          id="pinned-nav"
        >
          <Link href="/connect" className="group flex items-center gap-3 nav-link pointer-events-auto" data-target="section-worship">
            <span className="text-[10px] uppercase tracking-[0.2em] hidden group-hover:block transition-all font-sans font-medium text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Worship</span>
            <div className="w-1.5 h-1.5 rounded-full group-[.active]:bg-accent group-[.active]:scale-150 transition-all duration-300 bg-white/30 ring-1 ring-transparent group-[.active]:ring-accent/50"></div>
          </Link>
          <a href="#section-community" className="group flex items-center gap-3 nav-link pointer-events-auto" data-target="section-community">
            <span className="text-[10px] uppercase tracking-[0.2em] hidden group-hover:block transition-all font-sans font-medium text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Community</span>
            <div className="w-1.5 h-1.5 rounded-full group-[.active]:bg-accent group-[.active]:scale-150 transition-all duration-300 bg-white/30 ring-1 ring-transparent group-[.active]:ring-accent/50"></div>
          </a>
          <a href="#section-sermons" className="group flex items-center gap-3 nav-link pointer-events-auto" data-target="section-sermons">
            <span className="text-[10px] uppercase tracking-[0.2em] hidden group-hover:block transition-all font-sans font-medium text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Teaching</span>
            <div className="w-1.5 h-1.5 rounded-full group-[.active]:bg-accent group-[.active]:scale-150 transition-all duration-300 bg-white/30 ring-1 ring-transparent group-[.active]:ring-accent/50"></div>
          </a>
          <a href="#section-ministries" className="group flex items-center gap-3 nav-link pointer-events-auto" data-target="section-ministries">
            <span className="text-[10px] uppercase tracking-[0.2em] hidden group-hover:block transition-all font-sans font-medium text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Ministries</span>
            <div className="w-1.5 h-1.5 rounded-full group-[.active]:bg-accent group-[.active]:scale-150 transition-all duration-300 bg-white/30 ring-1 ring-transparent group-[.active]:ring-accent/50"></div>
          </a>
          <a href="#section-events" className="group flex items-center gap-3 nav-link pointer-events-auto" data-target="section-events">
            <span className="text-[10px] uppercase tracking-[0.2em] hidden group-hover:block transition-all font-sans font-medium text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Events</span>
            <div className="w-1.5 h-1.5 rounded-full group-[.active]:bg-accent group-[.active]:scale-150 transition-all duration-300 bg-white/30 ring-1 ring-transparent group-[.active]:ring-accent/50"></div>
          </a>
        </nav>

        {/* 01: WORSHIP */}
        <section id="section-worship" className="sticky-card z-10 bg-theme">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1510936111840-65e151ad71bb?q=80&w=2690&auto=format&fit=crop"
              alt="Worship Atmosphere"
              className="w-full h-full object-cover transition-transform duration-[3s] hover:scale-105 opacity-80"
            />
            <div className="absolute inset-0 img-dim"></div>
            <div className="absolute inset-0 gradient-overlay-full"></div>
          </div>
          <div className="flex flex-col md:flex-row z-10 w-full h-full pt-24 px-6 md:px-16 md:pt-32 relative items-start">
            <div className="w-full md:w-2/3 lg:w-1/2">
              <div className="overflow-hidden">
                <span className="text-reveal-item inline-flex items-center gap-2 px-3 py-1 mb-6 border border-white/10 bg-white/5 backdrop-blur-md rounded-full text-[10px] tracking-[0.2em] uppercase font-medium text-accent">
                  <span className="w-1 h-1 rounded-full bg-accent"></span> Sunday Service
                </span>
              </div>
              <div className="overflow-hidden">
                <h2 className="text-reveal-item delay-100 text-6xl md:text-8xl lg:text-9xl font-serif font-medium text-white tracking-tight mb-8 leading-[0.9]">
                  <span className="text-accent/40 font-serif italic text-6xl align-top pr-4">01.</span>Worship
                </h2>
              </div>
              <div className="border-t border-white/20 pt-8 text-reveal-item delay-200">
                <p className="text-lg md:text-xl font-light text-white/80 leading-relaxed max-w-lg mb-8">
                  Experience dynamic, spirit-filled worship that connects you to the heart of God. Come as you are, leave changed.
                </p>
                <Link
                  href="/connect"
                  className="btn-magnetic inline-block px-8 py-3 border border-white/30 text-xs tracking-[0.2em] uppercase font-medium text-white hover:border-white transition-colors"
                >
                  Plan Your Visit
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 02: COMMUNITY */}
        <section id="section-community" className="sticky-card z-20 bg-theme">
          <div className="absolute inset-0 z-0">
            <img
              src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/afa68a6a-0d7d-4c44-9bed-02cbe46afd0c_3840w.jpg"
              alt="Small Group"
              className="w-full h-full object-cover transition-transform duration-[3s] hover:scale-105 opacity-70"
            />
            <div className="absolute inset-0 img-dim"></div>
            <div className="absolute inset-0 gradient-overlay-full"></div>
          </div>
          <div className="flex flex-col md:flex-row z-10 w-full h-full pt-24 px-6 md:px-16 md:pt-32 relative items-start">
            <div className="w-full md:w-2/3 lg:w-1/2">
              <div className="overflow-hidden">
                <span className="text-reveal-item inline-flex items-center gap-2 px-3 py-1 mb-6 border border-white/10 bg-white/5 backdrop-blur-md rounded-full text-[10px] tracking-[0.2em] uppercase font-medium text-accent">
                  <span className="w-1 h-1 rounded-full bg-accent"></span> Connect Groups
                </span>
              </div>
              <div className="overflow-hidden">
                <h2 className="text-reveal-item delay-100 text-6xl md:text-8xl lg:text-9xl font-serif font-medium text-white tracking-tight mb-8 leading-[0.9]">
                  <span className="text-accent/40 font-serif italic text-6xl align-top pr-4">02.</span>Family
                </h2>
              </div>
              <div className="border-t border-white/20 pt-8 text-reveal-item delay-200">
                <p className="text-lg md:text-xl font-light text-white/80 leading-relaxed max-w-lg mb-8">
                  Life is better together. Join a Connect Group to build lasting friendships and grow in your faith journey through the week.
                </p>
                <Link
                  href="/connect"
                  className="btn-magnetic inline-block px-8 py-3 border border-white/30 text-xs tracking-[0.2em] uppercase font-medium text-white hover:border-white transition-colors"
                >
                  Find a Group
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 03: SERMONS */}
        <section id="section-sermons" className="sticky-card z-30 bg-theme">
          <div className="absolute inset-0 z-0">
            <img
              src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/469ff7b7-efbb-4cad-a752-57b19e8da490_3840w.jpg"
              alt="Bible Study"
              className="w-full h-full object-cover transition-transform duration-[3s] hover:scale-105 opacity-80"
            />
            <div className="absolute inset-0 img-dim"></div>
            <div className="absolute inset-0 gradient-overlay-full"></div>
          </div>
          <div className="flex flex-col md:flex-row z-10 w-full h-full pt-24 px-6 md:px-16 md:pt-32 relative items-start">
            <div className="w-full md:w-2/3 lg:w-1/2">
              <div className="overflow-hidden">
                <span className="text-reveal-item inline-flex items-center gap-2 px-3 py-1 mb-6 border border-white/10 bg-white/5 backdrop-blur-md rounded-full text-[10px] tracking-[0.2em] uppercase font-medium text-accent">
                  <span className="w-1 h-1 rounded-full bg-accent"></span> The Word
                </span>
              </div>
              <div className="overflow-hidden">
                <h2 className="text-reveal-item delay-100 text-6xl md:text-8xl lg:text-9xl font-serif font-medium text-white tracking-tight mb-8 leading-[0.9]">
                  <span className="text-accent/40 font-serif italic text-6xl align-top pr-4">03.</span>Truth
                </h2>
              </div>
              <div className="border-t border-white/20 pt-8 text-reveal-item delay-200">
                <p className="text-lg md:text-xl font-light text-white/80 leading-relaxed max-w-lg mb-8">
                  Dive deep into scripture with our latest sermon series. Practical teaching that applies biblical truth to modern life.
                </p>
                <Link
                  href="/media/"
                  className="btn-magnetic inline-block px-8 py-3 border border-white/30 text-xs tracking-[0.2em] uppercase font-medium text-white hover:border-white transition-colors"
                >
                  Watch Messages
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 04: MINISTRIES */}
        <section id="section-ministries" className="sticky-card z-40 bg-theme">
          <div className="absolute inset-0 z-0">
            <img
              src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/3ad07875-59fd-4aab-ad6b-d32a69a89791_3840w.jpg"
              alt="Youth Ministry"
              className="w-full h-full object-cover transition-transform duration-[3s] hover:scale-105 opacity-75"
            />
            <div className="absolute inset-0 img-dim"></div>
            <div className="absolute inset-0 gradient-overlay-full"></div>
          </div>
          <div className="flex flex-col md:flex-row z-10 w-full h-full pt-24 px-6 md:px-16 md:pt-32 relative items-start">
            <div className="w-full md:w-2/3 lg:w-1/2">
              <div className="overflow-hidden">
                <span className="text-reveal-item inline-flex items-center gap-2 px-3 py-1 mb-6 border border-white/10 bg-white/5 backdrop-blur-md rounded-full text-[10px] tracking-[0.2em] uppercase font-medium text-accent">
                  <span className="w-1 h-1 rounded-full bg-accent"></span> Next Gen
                </span>
              </div>
              <div className="overflow-hidden">
                <h2 className="text-reveal-item delay-100 text-6xl md:text-8xl lg:text-9xl font-serif font-medium text-white tracking-tight mb-8 leading-[0.9]">
                  <span className="text-accent/40 font-serif italic text-6xl align-top pr-4">04.</span>Growth
                </h2>
              </div>
              <div className="border-t border-white/20 pt-8 text-reveal-item delay-200">
                <p className="text-lg md:text-xl font-light text-white/80 leading-relaxed max-w-lg mb-8">
                  From Kids to Youth to Outreach, there is a place for everyone to serve and be served. Investing in the next generation.
                </p>
                <Link
                  href="/media/"
                  className="btn-magnetic inline-block px-8 py-3 border border-white/30 text-xs tracking-[0.2em] uppercase font-medium text-white hover:border-white transition-colors"
                >
                  View Ministries
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 05: EVENTS */}
        <section id="section-events" className="sticky-card z-50 bg-theme">
          <div className="absolute inset-0 z-0">
            <img
              src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/05bb44de-e268-4be8-ba09-6965da530c0e_3840w.jpg"
              alt="Events"
              className="w-full h-full object-cover transition-transform duration-[3s] hover:scale-105 opacity-80"
            />
            <div className="absolute inset-0 img-dim"></div>
            <div className="absolute inset-0 gradient-overlay-full"></div>
          </div>
          <div className="flex flex-col md:flex-row z-10 w-full h-full pt-24 px-6 md:px-16 md:pt-32 relative items-start">
            <div className="w-full md:w-2/3 lg:w-1/2">
              <div className="overflow-hidden">
                <span className="text-reveal-item inline-flex items-center gap-2 px-3 py-1 mb-6 border border-white/10 bg-white/5 backdrop-blur-md rounded-full text-[10px] tracking-[0.2em] uppercase font-medium text-accent">
                  <span className="w-1 h-1 rounded-full bg-accent"></span> Calendar
                </span>
              </div>
              <div className="overflow-hidden">
                <h2 className="text-reveal-item delay-100 text-6xl md:text-8xl lg:text-9xl font-serif font-medium text-white tracking-tight mb-8 leading-[0.9]">
                  <span className="text-accent/40 font-serif italic text-6xl align-top pr-4">05.</span>Events
                </h2>
              </div>
              <div className="border-t border-white/20 pt-8 text-reveal-item delay-200">
                <p className="text-lg md:text-xl font-light text-white/80 leading-relaxed max-w-lg mb-8">
                  Join us for upcoming conferences, worship nights, and community outreach opportunities throughout the year.
                </p>
                <a
                  href="#"
                  className="btn-magnetic inline-block px-8 py-3 border border-white/30 text-xs tracking-[0.2em] uppercase font-medium text-white hover:border-white transition-colors"
                >
                  Full Calendar
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* LATEST MESSAGES SECTION */}
      {latestMessages.length > 0 && (
        <section className="relative z-[60] bg-theme py-24 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Latest Messages</h2>
              <p className="text-white/60 text-sm md:text-base">Watch our most recent sermons and teachings</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestMessages.map((message: any) => {
                const thumbnailUrl = message.videoUrl ? getYouTubeThumbnail(message.videoUrl) : '';
                return (
                  <Link
                    key={message.id}
                    href={`/media/${message.id}`}
                    className="group relative overflow-hidden rounded-lg bg-card-theme border border-white/10 hover:border-accent transition-all duration-300"
                  >
                    {thumbnailUrl && (
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={thumbnailUrl}
                          alt={message.title || 'Sermon'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-serif text-white mb-2 group-hover:text-accent transition-colors">
                        {message.title || 'Untitled'}
                      </h3>
                      {message.description && (
                        <p className="text-white/60 text-sm line-clamp-2">{message.description}</p>
                      )}
                      {message.createdAt && (
                        <p className="text-white/40 text-xs mt-4">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/media/"
                className="inline-flex items-center gap-2 border border-white/20 px-8 py-3 text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300 rounded-full"
              >
                View All Messages
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="relative z-[60] bg-theme pt-24 pb-12 overflow-hidden border-t border-white/5">
        {/* Dot Pattern */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(var(--color-accent) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        ></div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          {/* CTA */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 border-b border-white/10 pb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-3 text-white">Welcome Home</h2>
              <p className="text-white/50 text-sm md:text-base font-light max-w-md">We can&apos;t wait to see you this Sunday.</p>
            </div>
            <a
              href="https://maps.app.goo.gl/3yBw7ar4FcTxM7PA8"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 md:mt-0 flex items-center gap-4 group"
            >
              <span className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-black transition-all duration-300">
                <ArrowRight className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-widest text-white group-hover:text-accent transition-colors">Get Directions</span>
            </a>
          </div>

          {/* Middle Section: Content & Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            {/* Left: Navigation & Info */}
            <div className="flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="">
                  <h4 className="text-accent text-xs uppercase tracking-[0.2em] mb-6 font-semibold">Service Times</h4>
                  <ul className="space-y-4 font-sans text-sm text-white/70">
                    <li>Wednesday Bible Study — 7:00 PM</li>
                    <li>Sunday Morning Service — 11:45 AM</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-accent text-xs uppercase tracking-[0.2em] mb-6 font-semibold">Contact</h4>
                  <ul className="space-y-4 font-sans text-sm text-white/70">
                    <li className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 mt-1 text-accent" />
                      <span>
                        1701 Dr. Andrew J Brown Ave<br />
                        Indianapolis, Indiana 46202
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-accent" />
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
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com/@NewBirthPWCIndy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right: Map */}
            <div className="w-full h-[350px] bg-card-theme relative rounded-lg overflow-hidden border border-white/10 map-container group">
              <iframe
                src="https://maps.google.com/maps?q=1701+Dr+Andrew+J+Brown+Ave,+Indianapolis,+IN+46202&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              ></iframe>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-difference z-10">
                <div className="w-12 h-12 rounded-full bg-accent/20 animate-ping absolute"></div>
                <div className="w-4 h-4 rounded-full bg-accent border-2 border-white relative z-20"></div>
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
              <a href="#" className="hover:text-accent transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
