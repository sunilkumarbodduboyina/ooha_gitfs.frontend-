import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import ProductCard from '../ProductCard';
import QuickView from '../QuickView';
import { Reveal, SkeletonGrid } from '../ui';

/** "Unique Collection" — premium asymmetric/masonry product layout. */
export default function UniqueMasonry({ items }) {
  const [local, setLocal] = useState(null);
  const [quick, setQuick] = useState(null);
  const list = items !== undefined ? items : local;

  useEffect(() => {
    if (items !== undefined) { setLocal(items || []); return; }
    api.products({ limit: 8, sort: 'discount' })
      .then((d) => setLocal(d.products))
      .catch(() => setLocal([]));
  }, [items]);

  return (
    <>
      {!list ? <SkeletonGrid count={8} /> : (
        <div className="masonry">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.06}>
              <ProductCard p={p} onQuickView={setQuick} />
            </Reveal>
          ))}
        </div>
      )}
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </>
  );
}
