import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Structured Learning',
    desc: 'guides n shit.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="landing-feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Campaign Manager',
    desc: 'we track, you run.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="landing-feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    title: 'Character Creation',
    desc: 'build allat.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="landing-feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'Interactive Tools',
    desc: 'lets interact buddy',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="landing-feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1 className="landing-header-title">The DM’s Grimoire</h1>
        <nav>
          <Link to="/login" className="landing-nav-link">
            Log In
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <h2 className="landing-hero-title">The DM's Grimoire</h2>
        <p className="landing-hero-desc">Slogan slog</p>
        <Link to="/register" className="landing-hero-btn">
          Get Started
        </Link>
      </section>

      <section className="landing-features-grid">
        {features.map((feat, idx) => (
          <div key={idx} className="landing-feature-card">
            <div className="landing-feature-icon-container">{feat.icon}</div>
            <h3 className="landing-feature-title">{feat.title}</h3>
            <p className="landing-feature-desc">{feat.desc}</p>
          </div>
        ))}
      </section>

      <footer className="landing-footer">Footer life</footer>
    </div>
  );
}