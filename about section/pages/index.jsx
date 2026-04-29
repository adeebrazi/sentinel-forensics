import Head from 'next/head';
import AboutSection from '../components/AboutSection';

export default function Home() {
  return (
    <>
      <Head>
        <title>Sentinal Forensics</title>
        <meta name="description" content="Sentinal Forensics by Cybernetic Crusaders" />
      </Head>

      <main className="pageContainer">
        <section className="heroSection">
          <div>
            <p className="eyebrow">Cybersecurity • Forensics • Research</p>
            <h1>Sentinal Forensics</h1>
            <p>
              Sentinal Forensics is a modern cyber incident analysis platform built to detect,
              investigate, and document digital threats with speed and clarity. It combines
              intuitive reporting, automated evidence capture, and teamwork-friendly insights
              to help analysts close cases faster.
            </p>
          </div>
        </section>

        <AboutSection />
      </main>
    </>
  );
}
