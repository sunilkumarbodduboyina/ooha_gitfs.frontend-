import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Clock, TrendingUp } from 'lucide-react';
import Listing from '../../components/Listing';
import { Breadcrumb, Reveal } from '../../components/ui';

const POPULAR = [
  'birthday gift for girlfriend', 'anniversary gift for wife', 'personalized photo frame',
  'couple mug', 'gift under 499', 'long distance gift', 'name lamp', 'gift hamper',
];

const RECENT_KEY = 'ooha_recent_searches';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')); } catch { setRecent([]); }
  }, []);

  return (
    <div className="container">
      <div className="page-head">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Search' }]} />
        <h1 className="page-title">{q ? <>Results for “{q}”</> : 'Search gifts'}</h1>
        <p className="page-sub">Search by product, category, occasion or relationship.</p>
      </div>

      <div className="filter-bar" style={{ paddingTop: 0 }}>
        <form
          style={{ display: 'flex', gap: 10, flex: 1, maxWidth: 520 }}
          onSubmit={(e) => {
            e.preventDefault();
            const v = new FormData(e.target).get('q');
            if (String(v).trim()) setParams({ q: String(v).trim() });
          }}
        >
          <input className="input" name="q" defaultValue={q} placeholder="Try “birthday gift for girlfriend”…" />
          <button className="btn btn-primary" type="submit"><Search size={17} /> Search</button>
        </form>
      </div>

      {!q && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 30 }}>
          {recent.length > 0 && (
            <div>
              <div className="eyebrow"><Clock size={13} /> Recent searches</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {recent.map((r) => (
                  <Link key={r} to={`/search?q=${encodeURIComponent(r)}`} className="pill">{r}</Link>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="eyebrow"><TrendingUp size={13} /> Popular right now</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {POPULAR.map((r) => (
                <Link key={r} to={`/search?q=${encodeURIComponent(r)}`} className="pill">{r}</Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {q ? <Listing baseParams={{ search: q }} /> : (
        <Reveal>
          <div className="empty-state" style={{ padding: '40px 20px 70px' }}>
            <div className="es-icon" style={{ fontSize: '2.2rem' }}>🔎</div>
            <h3>Find the perfect gift</h3>
            <p>Start typing a name, occasion or relationship above.</p>
          </div>
        </Reveal>
      )}
      <div style={{ height: 50 }} />
    </div>
  );
}
