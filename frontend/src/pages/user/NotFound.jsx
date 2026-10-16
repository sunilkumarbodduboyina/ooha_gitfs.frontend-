import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container">
      <div className="empty-state" style={{ padding: '90px 20px' }}>
        <div className="es-icon" style={{ fontSize: '2.6rem' }}>🎁</div>
        <h1 style={{ fontSize: '2.4rem' }}>404 — This gift wrapped nothing</h1>
        <p>The page you are looking for was moved, renamed or never existed.</p>
        <div style={{ marginTop: 24, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary"><Home size={17} /> Back to home</Link>
          <Link to="/products" className="btn btn-outline">Browse gifts</Link>
        </div>
      </div>
    </div>
  );
}
