import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Camp Compass Backend',
  description: 'Backend API and auth service for Camp Compass',
};

export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Camp Compass Backend</h1>
      <p>Use <code>/api/health</code> to verify this service is running.</p>
    </main>
  );
}
