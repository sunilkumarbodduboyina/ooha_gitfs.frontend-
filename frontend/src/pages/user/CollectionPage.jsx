import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import Listing from '../../components/Listing';
import { Breadcrumb, Spinner } from '../../components/ui';

const KIND = {
  category: { label: 'Category', param: 'category', crumb: 'All Gifts' },
  collection: { label: 'Collection', param: 'collection', crumb: 'Collections' },
  occasion: { label: 'Occasion', param: 'occasion', crumb: 'Occasions' },
  relationship: { label: 'Relationship', param: 'relationship', crumb: 'Relationships' },
};

/** Collection page — driven by the URL segment (category/collection/occasion/relationship). */
export default function CollectionPage() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const kindKey = pathname.split('/')[1] || 'collection';
  const kind = KIND[kindKey] || KIND.collection;
  const [meta, setMeta] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    setMeta(null);
    setLoaded(false);
    const load = kindKey === 'category' ? api.categories() : api.collections();
    load.then((d) => {
      if (!alive) return;
      const list = d.categories || d.collections || [];
      setMeta(list.find((x) => x.slug === slug) || null);
      setLoaded(true);
    }).catch(() => alive && setLoaded(true));
    return () => { alive = false; };
  }, [slug, kindKey]);

  const title = meta?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="container">
      <div className="page-head">
        <Breadcrumb items={[
          { label: 'Home', to: '/' },
          { label: kind.crumb, to: kindKey === 'occasion' ? '/occasions' : kindKey === 'relationship' ? '/relationships' : '/products' },
          { label: title },
        ]} />
        <h1 className="page-title">{title} Gifts</h1>
        <p className="page-sub">
          {meta?.description || `Explore our handpicked ${title.toLowerCase()} gifting collection — personalized, premium and delivered across India.`}
        </p>
      </div>

      {!loaded ? <Spinner label="Loading gifts…" /> : (
        <Listing baseParams={{ [kind.param]: slug }} />
      )}
      <div style={{ height: 60 }} />
    </div>
  );
}
