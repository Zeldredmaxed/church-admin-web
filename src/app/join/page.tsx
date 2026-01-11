'use client';

import { useState } from 'react';
import api from '@/utils/api';

export default function JoinPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [visitStatus, setVisitStatus] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/users', {
        firstName,
        lastName,
        email,
        phone,
        password,
        visitStatus,
        interests,
        message,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#2d3d4d] text-white flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 rounded-full bg-[#00a1a2] mx-auto flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-playfair text-white mb-4">Thank You!</h1>
            <p className="text-lg text-white/80 font-sans">
              Your registration has been submitted successfully. We&apos;ll be in touch soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2d3d4d] text-white overflow-x-hidden">
      {/* Hero Section */}
      <header className="relative w-full h-[60vh] min-h-[500px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1543165796-5426273eaab3?q=80&w=2670&auto=format&fit=crop" 
            alt="Connect Background" 
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 z-10 bg-[#2d3d4d]/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#2d3d4d]/40 via-transparent to-[#2d3d4d]"></div>
        </div>

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

      {/* Form Section */}
      <section className="relative z-30 px-6 pb-24 -mt-24">
        <div className="max-w-3xl mx-auto bg-[#23303d] border border-white/5 shadow-2xl rounded-sm p-8 md:p-12 animate-[fadeIn_1s_ease-out_0.8s_forwards] opacity-0 translate-y-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Personal Info */}
            <div className="flex flex-col gap-6">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#00a1a2] font-medium border-b border-white/5 pb-2">
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
                    className="w-full px-4 py-3 rounded-sm text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#00a1a2] focus:ring-1 focus:ring-[#00a1a2] focus:bg-white/5"
                    placeholder="First Name"
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
                    className="w-full px-4 py-3 rounded-sm text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#00a1a2] focus:ring-1 focus:ring-[#00a1a2] focus:bg-white/5"
                    placeholder="Last Name"
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
                    className="w-full px-4 py-3 rounded-sm text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#00a1a2] focus:ring-1 focus:ring-[#00a1a2] focus:bg-white/5"
                    placeholder="you@example.com"
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
                    className="w-full px-4 py-3 rounded-sm text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#00a1a2] focus:ring-1 focus:ring-[#00a1a2] focus:bg-white/5"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-xs uppercase tracking-wider text-white/60">
                  Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#00a1a2] focus:ring-1 focus:ring-[#00a1a2] focus:bg-white/5"
                  placeholder="Create a password"
                />
              </div>
            </div>

            {/* Visit Status */}
            <div className="flex flex-col gap-6 pt-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#00a1a2] font-medium border-b border-white/5 pb-2">
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
                    <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center group-hover:border-[#d6b796] transition-colors">
                      <div className="w-2 h-2 rounded-full bg-[#00a1a2] transform scale-0 transition-transform duration-200 radio-dot"></div>
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
                    <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center group-hover:border-[#d6b796] transition-colors">
                      <div className="w-2 h-2 rounded-full bg-[#00a1a2] transform scale-0 transition-transform duration-200 radio-dot"></div>
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
                    <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center group-hover:border-[#d6b796] transition-colors">
                      <div className="w-2 h-2 rounded-full bg-[#00a1a2] transform scale-0 transition-transform duration-200 radio-dot"></div>
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
                    <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center group-hover:border-[#d6b796] transition-colors">
                      <div className="w-2 h-2 rounded-full bg-[#00a1a2] transform scale-0 transition-transform duration-200 radio-dot"></div>
                    </div>
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors">Looking for info</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Interests */}
            <div className="flex flex-col gap-6 pt-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#00a1a2] font-medium border-b border-white/5 pb-2">
                I&apos;m Interested In
              </h3>
              <div className="flex flex-wrap gap-4">
                <label className="cursor-pointer group relative">
                  <input
                    type="checkbox"
                    name="interest"
                    value="sunday_service"
                    checked={interests.includes('sunday_service')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInterests([...interests, 'sunday_service']);
                      } else {
                        setInterests(interests.filter(i => i !== 'sunday_service'));
                      }
                    }}
                    className="peer sr-only custom-checkbox"
                  />
                  <div className="px-5 py-2 rounded-full border border-white/10 group-hover:border-white/30 transition-all flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white opacity-0 transition-all duration-200 transform scale-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-xs uppercase tracking-wider text-white/70 group-hover:text-white transition-colors select-none">Sunday Service</span>
                  </div>
                </label>
                <label className="cursor-pointer group relative">
                  <input
                    type="checkbox"
                    name="interest"
                    value="wednesday_service"
                    checked={interests.includes('wednesday_service')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInterests([...interests, 'wednesday_service']);
                      } else {
                        setInterests(interests.filter(i => i !== 'wednesday_service'));
                      }
                    }}
                    className="peer sr-only custom-checkbox"
                  />
                  <div className="px-5 py-2 rounded-full border border-white/10 group-hover:border-white/30 transition-all flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white opacity-0 transition-all duration-200 transform scale-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-xs uppercase tracking-wider text-white/70 group-hover:text-white transition-colors select-none">Wednesday Service</span>
                  </div>
                </label>
                <label className="cursor-pointer group relative">
                  <input
                    type="checkbox"
                    name="interest"
                    value="small_groups"
                    checked={interests.includes('small_groups')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInterests([...interests, 'small_groups']);
                      } else {
                        setInterests(interests.filter(i => i !== 'small_groups'));
                      }
                    }}
                    className="peer sr-only custom-checkbox"
                  />
                  <div className="px-5 py-2 rounded-full border border-white/10 group-hover:border-white/30 transition-all flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white opacity-0 transition-all duration-200 transform scale-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-xs uppercase tracking-wider text-white/70 group-hover:text-white transition-colors select-none">Small Groups</span>
                  </div>
                </label>
                <label className="cursor-pointer group relative">
                  <input
                    type="checkbox"
                    name="interest"
                    value="ministries"
                    checked={interests.includes('ministries')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInterests([...interests, 'ministries']);
                      } else {
                        setInterests(interests.filter(i => i !== 'ministries'));
                      }
                    }}
                    className="peer sr-only custom-checkbox"
                  />
                  <div className="px-5 py-2 rounded-full border border-white/10 group-hover:border-white/30 transition-all flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white opacity-0 transition-all duration-200 transform scale-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-xs uppercase tracking-wider text-white/70 group-hover:text-white transition-colors select-none">Ministries</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-6 pt-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#00a1a2] font-medium border-b border-white/5 pb-2">
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
                  className="w-full px-4 py-3 rounded-sm text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#00a1a2] focus:ring-1 focus:ring-[#00a1a2] focus:bg-white/5 resize-y"
                  placeholder="Your message..."
                ></textarea>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-sm text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00a1a2] py-4 text-white uppercase tracking-[0.2em] text-xs font-semibold shadow-xl hover:shadow-[#00a1a2]/20 transition-all border border-transparent disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </span>
                <span className="absolute inset-0 bg-[#d6b796] translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0"></span>
              </button>
              <p className="text-center text-white/30 text-xs mt-4 font-sans">
                Your information is safe and will only be used to connect with you.
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
