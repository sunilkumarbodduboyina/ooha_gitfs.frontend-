import { useEffect, useState } from 'react';
import { Quote } from 'lucide-react';
import { api, formatDate } from '../../services/api';
import { Reveal, SectionHead, Stars } from '../ui';

/** "What Our Customers Say" — approved review cards. */
export default function ReviewsSection({ items }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (items !== undefined) { setReviews((items || []).slice(0, 9)); return; }
    api.reviews({ status: 'approved' })
      .then((d) => setReviews((d.reviews || []).slice(0, 9)))
      .catch(() => {});
  }, [items]);

  if (!reviews.length) return null;

  return (
    <section className="section">
      <div className="container">
        <SectionHead
          eyebrow="Real people, real moments"
          title="What Our Customers Say"
          sub="Every review is verified against a real Ooha Gifts order."
          center
        />
        <div className="grid-3">
          {reviews.map((r, i) => (
            <Reveal key={r.id} delay={(i % 3) * 0.08}>
              <article className="review-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stars value={r.rating} size={16} />
                  <Quote size={22} color="var(--gold)" opacity={0.6} />
                </div>
                {r.title && <h4 style={{ fontSize: '1.02rem' }}>{r.title}</h4>}
                <p className="review-text">“{r.comment}”</p>
                <div className="review-who">
                  <span className="review-avatar">{String(r.customer_name || 'O').charAt(0).toUpperCase()}</span>
                  <div>
                    <div className="review-name">{r.customer_name}</div>
                    <div className="review-prod">
                      {r.product_purchased || r.product_name || 'Ooha Gifts'} · {formatDate(r.review_date || r.created_at)}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
