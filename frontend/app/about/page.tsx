"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { FaLinkedin, FaGithub, FaWhatsapp, FaInstagram, FaEnvelope } from 'react-icons/fa';

const teamMembers = [
  {
    name: 'Adeeb Razi',
    role: 'UI/UX Designer',
    contribution: 'Crafted the look and feel, user flows, and polished the interface for Sentinel Forensics.',
    image: '/images/adeeb photo.jpeg',
    socials: [
      { icon: FaLinkedin, href: 'https://in.linkedin.com/in/raziadeeb', label: 'LinkedIn' },
      { icon: FaGithub, href: 'https://github.com/adeebrazi', label: 'GitHub' },
      { icon: FaWhatsapp, href: 'https://wa.me/916206782574', label: 'WhatsApp' },
      { icon: FaInstagram, href: 'https://www.instagram.com/raziadeeb/', label: 'Instagram' },
      { icon: FaEnvelope, href: 'mailto:adeebrazi22@gmail.com', label: 'Email' },
    ],
  },
  {
    name: 'Minhaj Hussain',
    role: 'Front-End Development',
    contribution: 'Built responsive pages, animations, and connected the UI with live data endpoints.',
    image: '/images/minhaj photo.jpeg',
    socials: [
      { icon: FaLinkedin, href: 'https://www.linkedin.com/in/minhaj-hussain-64b8b9328/', label: 'LinkedIn' },
      { icon: FaGithub, href: 'https://github.com/Minhaj9925', label: 'GitHub' },
      { icon: FaWhatsapp, href: 'wa.me/918825343597', label: 'WhatsApp' },
      { icon: FaInstagram, href: 'https://www.instagram.com/mr_hussain_8825/', label: 'Instagram' },
      { icon: FaEnvelope, href: 'mailto:inhajhussain107@gmail.com', label: 'Email' },
    ],
  },
  {
    name: 'Awesh Hussain',
    role: 'Threat Analysis',
    contribution: 'Led threat analysis, forensic methodology, and technical documentation for the project.',
    image: '/images/awesh.png',
    socials: [
      { icon: FaLinkedin, href: 'https://www.linkedin.com/in/awesh06/', label: 'LinkedIn' },
      { icon: FaGithub, href: 'https://github.com/aweshhussain', label: 'GitHub' },
      { icon: FaWhatsapp, href: 'http://wa.me/919113152295', label: 'WhatsApp' },
      { icon: FaInstagram, href: 'https://www.instagram.com/awesh_2209/', label: 'Instagram' },
      { icon: FaEnvelope, href: 'mailto:aweshh875@gmail.com', label: 'Email' },
    ],
  },
  {
    name: 'Samia Syeed',
    role: 'Back-End Development',
    contribution: 'Implemented the data pipeline, API integrations, and backend logic for secure investigations.',
    image: '/images/samia photo.jpeg',
    socials: [
      { icon: FaLinkedin, href: 'https://www.linkedin.com/in/samia-sayeed-391871350/', label: 'LinkedIn' },
      { icon: FaGithub, href: 'https://github.com/samiasayeed305', label: 'GitHub' },
      { icon: FaWhatsapp, href: 'http://wa.me/919546239076', label: 'WhatsApp' },
      { icon: FaInstagram, href: 'https://www.instagram.com/keul_tae/', label: 'Instagram' },
      { icon: FaEnvelope, href: 'mailto:samiasayeed305@gmail.com', label: 'Email' },
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="h-full w-full bg-black text-white font-corpta overflow-y-auto custom-scrollbar relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-black to-black opacity-80" />
      <div className="absolute inset-0 z-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col gap-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <button className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-all group flex items-center gap-3">
              <ArrowLeft className="text-cyan-400 group-hover:-translate-x-1 transition-transform" size={20} />
              <span className="text-cyan-400 text-[10px] font-black uppercase tracking-widest hidden sm:block">Return to Terminal</span>
            </button>
          </Link>
          <div className="flex items-center gap-4 text-cyan-400 opacity-50">
             <Shield size={24} />
             <span className="text-[10px] font-black tracking-[0.4em] uppercase">Level_10_Clearance</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <p className="text-[10px] text-cyan-500 font-black tracking-[0.5em] uppercase animate-pulse">Cybersecurity • Forensics • Research</p>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(0,210,255,0.3)]">
            Sentinel Forensics
          </h1>
          <p className="text-cyan-100/60 text-lg leading-relaxed max-w-2xl mx-auto font-mono-tech tracking-wider">
            Sentinel Forensics is a modern cyber incident analysis platform built to detect, investigate, and document digital threats with speed and clarity. It combines intuitive reporting, automated evidence capture, and teamwork-friendly insights to help analysts close cases faster.
          </p>
        </section>

        {/* Club Section */}
        <section className="hacker-card bg-[#09090b]/80 border border-cyan-900/50 p-10 rounded-[2rem] max-w-4xl mx-auto text-center relative overflow-hidden shadow-[0_0_40px_rgba(0,210,255,0.05)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/30 blur-sm" />
          <h3 className="text-2xl font-black uppercase tracking-widest text-cyan-400 mb-6">About Cybernetic Crusaders</h3>
          <p className="text-zinc-400 leading-loose text-sm font-bold max-w-3xl mx-auto">
            Cybernetic Crusaders is a student-led club dedicated to cybersecurity, digital forensics, and ethical research. Our members collaborate on projects, build tools, and share deep knowledge across defense, incident response, and threat intelligence.
          </p>
        </section>

        {/* Team Section */}
        <section className="space-y-12">
          <div className="text-center">
            <span className="text-[10px] text-cyan-700 font-black tracking-[0.4em] uppercase mb-2 block">Meet the Crusaders</span>
            <h2 className="text-4xl font-black italic tracking-wider text-white">Our Team</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <article key={member.name} className="hacker-card bg-[#09090b]/90 border border-cyan-900/40 rounded-3xl overflow-hidden group hover:border-cyan-500/50 transition-colors duration-500">
                <div className="relative h-64 w-full overflow-hidden bg-zinc-900">
                  <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay z-10 group-hover:bg-transparent transition-colors duration-500" />
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105"
                  />
                  {/* Scanner line effect on hover */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/80 blur-sm opacity-0 group-hover:opacity-100 group-hover:animate-[scan-sweep_2s_linear_infinite] z-20" />
                </div>
                
                <div className="p-6 relative z-10 bg-gradient-to-b from-black/0 to-black/80">
                  <h4 className="text-xl font-black uppercase tracking-wider text-white mb-1">{member.name}</h4>
                  <p className="text-[10px] text-cyan-400 font-black tracking-[0.2em] uppercase mb-4">{member.role || 'Crusader'}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6 line-clamp-3 group-hover:line-clamp-none transition-all">
                    {member.contribution}
                  </p>
                  
                  <div className="flex items-center gap-3 pt-4 border-t border-cyan-900/30">
                    {member.socials?.map(({ icon: Icon, href, label }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={label}
                        className="p-2 bg-cyan-950/30 text-cyan-500 rounded-lg hover:bg-cyan-500 hover:text-black transition-all hover:-translate-y-1"
                      >
                        <Icon size={16} />
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-10 border-t border-cyan-900/30 mt-12">
          <p className="text-[10px] text-cyan-800 font-black tracking-[0.5em] uppercase">Built by Cybernetic Crusaders</p>
        </footer>
      </div>
    </div>
  );
}
