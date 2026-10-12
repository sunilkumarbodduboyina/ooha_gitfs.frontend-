import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { api, img } from '../../services/api';
import { Reveal } from '../ui';

/** "Meaningful Gifts Starting…" — premium folder-style category cards. */
export default function CategoryFolders({ items }) {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    if (items !== undefined) { setCats(items || []); return; }
    api.categories().then((d) => setCats(d.categories || [])).catch(() => {});
  }, [items]);

  if (!cats.length) return null;

  return (
    <div className="folder-grid">
      {cats.map((c, i) => (
        <Reveal key={c.id} delay={(i % 3) * 0.08}>
          <Link to={`/category/${c.slug}`} className="folder">
            <div className="folder-media">
              <img src={img(c.image)} alt={c.name} loading="lazy" />
            </div>
            <div className="folder-body">
              <h3>{c.name}</h3>
              <p>{c.description}</p>
              <span className="folder-link">Explore <span><ArrowUpRight size={16} /></span></span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
