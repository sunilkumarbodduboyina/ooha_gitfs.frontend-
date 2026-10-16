import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api, img } from '../../services/api';
import { Reveal } from '../ui';

/** "Gifts For Every Occasion" cards with image + name + description. */
export default function OccasionGrid({ items, limit = 9 }) {
  const [occs, setOccs] = useState([]);

  useEffect(() => {
    if (items !== undefined) { setOccs(items || []); return; }
    api.collections('occasion')
      .then((d) => setOccs((d.collections || []).slice(0, limit)))
      .catch(() => {});
  }, [items, limit]);

  if (!occs.length) return null;

  return (
    <div className="grid-3">
      {occs.map((o, i) => (
        <Reveal key={o.id} delay={(i % 3) * 0.08}>
          <Link to={`/occasion/${o.slug}`} className="occ-card">
            <div className="occ-media">
              <img src={img(o.image)} alt={o.name} loading="lazy" />
            </div>
            <div className="occ-body">
              <h3>{o.name} <ArrowRight size={17} color="var(--primary)" /></h3>
              <p>{o.description}</p>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
