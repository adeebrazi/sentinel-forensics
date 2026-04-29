import React from 'react';
import { FaLinkedin, FaGithub, FaWhatsapp, FaInstagram, FaEnvelope } from 'react-icons/fa';
import styles from './AboutSection.module.css';

const teamMembers = [
  {
    name: 'Adeeb Razi',
    role: 'UI/UX Designer',
    contribution: 'Crafted the look and feel, user flows, and polished the interface for Sentinal Forensics.',
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
    name: 'Awesh Hussain           ',
    role: '',
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

export default function AboutSection() {
  return (
    <section className={styles.aboutSection} id="about">
      <div className={styles.topSection}>
        <div className={styles.infoBlock}>
        </div>
      </div>

      <div className={styles.clubSection}>
        <h3>About Cybernetic Crusaders</h3>
        <p>
          Cybernetic Crusaders is a student-led club dedicated to cybersecurity, digital forensics,
          and ethical research. Our members collaborate on projects, build tools, and share deep
          knowledge across defense, incident response, and threat intelligence.
        </p>
      </div>

      <div className={styles.teamSection}>
        <div className={styles.teamHeading}>
          <span className={styles.teamLabel}>Meet the Crusaders</span>
          <h2>Our Team</h2>
        </div>
        <div className={styles.teamGrid}>
          {teamMembers.map((member) => (
            <article key={member.name} className={styles.memberCard}>
              <div className={styles.imageWrapper}>
                <img src={member.image} alt={member.name} />
              </div>
              <div className={styles.memberInfo}>
                <h4>{member.name}</h4>
                <p className={styles.memberRole}>{member.role}</p>
                <p>{member.contribution}</p>
                <div className={styles.socialRow}>
                  {member.socials?.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      className={styles.socialLink}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.footerNote}>
        <p>Built by Cybernetic Crusaders</p>
      </div>
    </section>
  );
}
