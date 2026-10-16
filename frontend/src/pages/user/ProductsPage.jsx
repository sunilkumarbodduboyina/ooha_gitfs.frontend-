import { useSearchParams } from 'react-router-dom';
import Listing from '../../components/Listing';
import { Breadcrumb } from '../../components/ui';

/** All products page with budget / search query support. */
export default function ProductsPage() {
  const [params] = useSearchParams();
  const q = params.get('q');
  const max = params.get('max');
  const featured = params.get('featured');

  const base = {};
  if (q) base.search = q;
  if (max) base.max_price = max;
  if (featured) base.featured = featured;

  const title = q ? `Search: “${q}”` : max ? `Gifts Under ₹${Number(max).toLocaleString('en-IN')}` : 'All Gifts';

  return (
    <div className="container">
      <div className="page-head">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'All Products' }]} />
        <h1 className="page-title">{title}</h1>
        <p className="page-sub">Every gift, freshly synced from the Ooha Gifts store.</p>
      </div>
      <Listing baseParams={base} />
      <div style={{ height: 60 }} />
    </div>
  );
}
