import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, img } from '../../services/api';
import { Reveal } from '../ui';

/** "Gifts For Every Relationship" image cards. */
export default function RelationshipGrid({ items, limit = 12 }) {
  const [rels, setRels] = useState([]);

  useEffect(() => {
    if (items !== undefined) { setRels(items || []); return; }
    api.collections('relationship')
      .then((d) => setRels((d.collections || []).slice(0, limit)))
      .catch(() => {});
  }, [items, limit]);

  if (!rels.length) return null;

  return (
    <div className="grid-4">
      {rels.map((r, i) => (
        <Reveal key={r.id} delay={(i % 4) * 0.06}>
          <Link to={`/relationship/${r.slug}`} className="rel-card">
            <img src={img(r.image)} alt={r.name} loading="lazy" />
            <div className="rel-meta">
              <h3>{r.name}</h3>
              <p>{r.description}</p>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
