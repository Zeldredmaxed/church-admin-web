'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, MapPin, Phone, Mail, Facebook, Youtube, X } from 'lucide-react';
import api from '@/utils/api';

export default function MediaPage() {
  // Menu State
  const [menuOpen, setMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [navAtTop, setNavAtTop] = useState(true);

  // Media State
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveStream, setLiveStream] = useState<any | null>(null);

  // Fetch Media
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await api.get('/media');
        const items = response.data || [];
        
        // Find live stream
        const stream = items.find((item: any) => item.type === 'LIVESTREAM');
        setLiveStream(stream || null);
        
        // Filter out live stream from regular items
        setMediaItems(items.filter((item: any) => item.type !== 'LIVESTREAM'));
      } catch (error) {
        console.error('Failed to fetch media:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

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

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (url: string) => {
    if (!url) return '';
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  // Format duration (if available)
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
        .hover\:bg-brand:hover { background-color: var(--color-brand); }
        .hover\:text-brand:hover { color: var(--color-brand); }
        .hover\:text-sand:hover { color: var(--color-sand); }
        .hover\:bg-sand:hover { background-color: var(--color-sand); }
        .gradient-overlay {
          background: linear-gradient(to bottom, rgba(35, 48, 61, 0.4) 0%, rgba(35, 48, 61, 0.9) 100%);
        }
        .img-dim-overlay {
          background-color: rgba(30, 40, 50, 0.35);
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--color-navy); }
        ::-webkit-scrollbar-thumb { background: var(--color-sand); border-radius: 3px; }
        .menu-item {
          opacity: 0;
          transform: translateY(40px) skewY(2deg);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .menu-open .menu-item { opacity: 1; transform: translateY(0) skewY(0); }
        .menu-link:hover { font-style: italic; padding-left: 20px; color: var(--color-sand); }
        .menu-link { transition: all 0.4s ease; }
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
        @keyframes pulse-ring {
          0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(214, 183, 150, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(214, 183, 150, 0); }
          100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(214, 183, 150, 0); }
        }
        .play-btn-pulse { animation: pulse-ring 2s infinite; }
        .img-hover-scale {
          transition: transform 0.8s cubic-bezier(0.2, 1, 0.3, 1), filter 0.5s ease;
        }
        .group:hover .img-hover-scale {
          transform: scale(1.05);
          filter: brightness(1.05);
        }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
            href="/connect"
            className="hidden md:flex items-center gap-2 bg-brand px-6 py-3 text-xs tracking-[0.15em] font-medium uppercase transition-all duration-300 shadow-lg hover:shadow-brand/20 text-white btn-magnetic z-10 border border-transparent"
          >
            <span className="font-sans relative z-10">Plan Your Visit</span>
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
              <X className="w-5 h-5 text-white group-hover:text-sand stroke-[1.5]" />
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
      <header className="relative w-full h-[70vh] min-h-[600px] overflow-hidden flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2673&auto=format&fit=crop"
            alt="Worship Background"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 z-10 bg-navy/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-navy via-transparent to-navy/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <div className="animate-[fadeIn_1s_ease-out_0.5s_forwards] opacity-0 translate-y-4">
            <span className="inline-block py-1 px-3 border border-brand/50 rounded-full bg-navy/40 backdrop-blur-md text-brand text-xs uppercase tracking-[0.2em] font-medium mb-6">
              Online Campus
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair text-white tracking-tight leading-none mb-6">
              Watch &amp; Grow
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-sans font-light max-w-2xl mx-auto leading-relaxed mb-10">
              Live worship and on-demand messages wherever you are. Join our community in spirit and truth.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 animate-[fadeIn_1s_ease-out_0.8s_forwards] opacity-0 translate-y-4">
            <a
              href="#live-stream"
              className="btn-magnetic px-8 py-4 bg-brand text-white text-xs md:text-sm uppercase tracking-[0.2em] font-medium border border-transparent shadow-xl hover:shadow-brand/20 transition-all"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" />
                Watch Live
              </span>
            </a>
            <a
              href="#sermons"
              className="px-8 py-4 border border-white/30 text-white text-xs md:text-sm uppercase tracking-[0.2em] font-medium hover:bg-white hover:text-navy transition-all duration-300"
            >
              Browse Sermons
            </a>
          </div>
        </div>
      </header>

      {/* 2. LIVE STREAM SECTION */}
      <section id="live-stream" className="relative z-20 -mt-20 md:-mt-24 px-6 md:px-12 pb-24">
        <div className="max-w-[1600px] mx-auto">
          {/* Video Container */}
          <div className="relative w-full aspect-video bg-black rounded-lg shadow-2xl overflow-hidden group border border-white/10">
            {liveStream && liveStream.videoUrl ? (
              // Live Stream Active
              <iframe
                src={liveStream.videoUrl}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; encrypted-media"
              ></iframe>
            ) : (
              // Stream Offline
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy-dark">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 play-btn-pulse cursor-pointer">
                  <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1" />
                </div>
                <p className="mt-8 text-white/50 text-sm uppercase tracking-[0.2em] font-sans">Stream Offline</p>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-navy-dark p-6 md:p-8 rounded-sm border border-white/5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {liveStream ? (
                  <>
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <h3 className="text-white font-playfair text-xl md:text-2xl italic">Live Now</h3>
                  </>
                ) : (
                  <>
                    <span className="flex h-3 w-3 relative">
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
                    </span>
                    <h3 className="text-white font-playfair text-xl md:text-2xl italic">Live Broadcast Times</h3>
                  </>
                )}
              </div>
              <p className="text-white/60 font-sans text-sm md:text-base">
                Join us every Sunday @ 11:45 AM &amp; Wednesday Bible Study @ 7:00 PM
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-white/40 text-xs uppercase tracking-widest hidden md:block">
                {liveStream ? 'Currently Live — Watch Above' : 'Currently Offline — Watch Previous Services Below'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MEDIA CATEGORIES & FILTERS */}
      <section className="px-6 md:px-12 py-12 border-t border-white/5 bg-navy">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <h2 className="text-3xl md:text-4xl font-playfair text-white">Latest Messages</h2>

          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <button className="px-6 py-2 rounded-full border border-brand text-brand bg-brand/10 text-xs uppercase tracking-[0.15em] font-medium transition-all">
              All
            </button>
            <button className="px-6 py-2 rounded-full border border-white/10 hover:border-sand hover:text-sand text-white/60 text-xs uppercase tracking-[0.15em] font-medium transition-all">
              Sermons
            </button>
            <button className="px-6 py-2 rounded-full border border-white/10 hover:border-sand hover:text-sand text-white/60 text-xs uppercase tracking-[0.15em] font-medium transition-all">
              Worship
            </button>
            <button className="px-6 py-2 rounded-full border border-white/10 hover:border-sand hover:text-sand text-white/60 text-xs uppercase tracking-[0.15em] font-medium transition-all">
              Events
            </button>
          </div>
        </div>
      </section>

      {/* 3. RECENT SERMONS GRID */}
      <section id="sermons" className="px-6 md:px-12 pb-32 bg-navy">
        {loading ? (
          <div className="max-w-[1600px] mx-auto text-center py-24">
            <p className="text-white/60">Loading messages...</p>
          </div>
        ) : (
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {mediaItems.map((item: any) => {
              const thumbnailUrl = item.videoUrl ? getYouTubeThumbnail(item.videoUrl) : item.thumbnailUrl || '';
              const formattedDate = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '';
              
              return (
                <Link
                  key={item.id}
                  href={`/media/${item.id}`}
                  className="group cursor-pointer flex flex-col gap-6"
                >
                  <div className="relative overflow-hidden aspect-[4/3] rounded-sm">
                    <div className="absolute inset-0 bg-brand mix-blend-overlay opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10"></div>
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={item.title || 'Sermon thumbnail'}
                        className="w-full h-full object-cover img-hover-scale"
                      />
                    ) : (
                      <div className="w-full h-full bg-navy-dark flex items-center justify-center">
                        <Play className="w-16 h-16 text-white/30" />
                      </div>
                    )}
                    {item.duration && (
                      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-white rounded-full z-20">
                        {formatDuration(item.duration)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-sand font-medium">
                      {formattedDate && <span>{formattedDate}</span>}
                      {formattedDate && item.author && <span className="w-1 h-1 rounded-full bg-white/30"></span>}
                      {item.author && <span>{item.author}</span>}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-playfair text-white group-hover:text-brand transition-colors duration-300">
                      {item.title || 'Untitled'}
                    </h3>
                    {item.description && (
                      <p className="text-white/60 text-sm leading-relaxed line-clamp-2">{item.description}</p>
                    )}
                    <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-white group-hover:text-sand transition-colors">
                      Watch Now
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {mediaItems.length === 0 && !loading && (
          <div className="max-w-[1600px] mx-auto text-center py-24">
            <p className="text-white/60">No messages available yet.</p>
          </div>
        )}

        {mediaItems.length > 0 && (
          <div className="flex justify-center pt-12">
            <button className="btn-magnetic px-10 py-4 border border-white/20 text-sm uppercase tracking-[0.2em] font-medium hover:border-sand hover:text-navy transition-all">
              Load More
            </button>
          </div>
        )}
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
              <h2 className="text-4xl md:text-6xl font-playfair mb-4">New Here?</h2>
              <p className="text-white/60 font-sans font-normal max-w-md">
                Plan a visit this Sunday and experience the community for yourself.
              </p>
            </div>
            <Link href="/connect" className="mt-8 md:mt-0 flex items-center gap-4 group">
              <span className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-sand group-hover:border-sand group-hover:text-navy transition-all duration-300">
                <ArrowRight className="w-6 h-6" />
              </span>
              <span className="text-sm uppercase tracking-widest font-sans group-hover:text-sand transition-colors">
                Plan Your Visit
              </span>
            </Link>
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
                      <MapPin className="w-4 h-4 mt-1 text-brand" />
                      <span>
                        1701 Dr. Andrew J Brown Ave<br />
                        Indianapolis, Indiana 46202
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-brand" />
                      <span>317-797-3838</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-brand" />
                      <span>newbirthpwcindy@gmail.com</span>
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
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com/@NewBirthPWCIndy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-brand hover:text-brand transition-all"
                >
                  <Youtube className="w-4 h-4" />
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
              <span>© 2024 New Birth Praise &amp; Worship Center</span>
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
