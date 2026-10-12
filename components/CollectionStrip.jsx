import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api, img } from '../../services/api';
import { Reveal } from '../ui';

/** Horizontal strip of curated collections (Love Lab, Photo Gifts, Corporate…). */
export default function CollectionStrip({ items }) {
  const [cols, setCols] = useState([]);

  useEffect(() => {
    if (items !== undefined) { setCols(items || []); return; }
    api.collections('collection').then((d) => setCols(d.collections || [])).catch(() => {});
  }, [items]);

  if (!cols.length) return null;

  return (
    <div className="rail-wrap">
      <div className="rail">
        {cols.map((c, i) => (
          <Reveal key={c.id} delay={Math.min(i * 0.06, 0.3)}>
            <Link to={`/collection/${c.slug}`} className="folder" style={{ height: '100%' }}>
              <div className="folder-media" style={{ aspectRatio: '16/10' }}>
                <img src={img(c.image)} alt={c.name} loading="lazy" />
              </div>
              <div className="folder-body" style={{ paddingBottom: 22 }}>
                <h3 style={{ fontSize: '1.1rem' }}>{c.name}</h3>
                <p style={{ fontSize: '0.84rem' }}>{c.description}</p>
                <span className="folder-link">Discover <ArrowRight size={15} /></span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
