import { appLogger } from '@/lib/logger';

appLogger.info('Rendering homepage shell', { route: '/' });

export default function HomePage() {
  return (
    <main className="home-shell">
      <section className="hero-card">
        <p className="eyebrow">Campus Notifications</p>
        <h1>Frontend scaffold ready for the evaluation flow.</h1>
        <p className="copy">
          This milestone sets up the Next.js app, TypeScript, and the custom logging middleware.
          The rest of the application will be added in the next milestones after you commit this checkpoint.
        </p>
      </section>
    </main>
  );
}
