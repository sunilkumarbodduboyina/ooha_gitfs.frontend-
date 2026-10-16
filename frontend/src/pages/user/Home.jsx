import { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeIndianRupee, Gift, RefreshCw, ShieldCheck, Truck, MessageCircle } from 'lucide-react';
import { api } from '../../services/api';
import HeroSlider from '../../components/HeroSlider';
import MarqueeBar from '../../components/MarqueeBar';
import TrustBar from '../../components/TrustBar';
import ProductRail from '../../components/ProductRail';
import PromoBanner from '../../components/PromoBanner';
import ProductCard from '../../components/ProductCard';
import QuickView from '../../components/QuickView';
import { Reveal, SectionHead, SkeletonGrid, EmptyState } from '../../components/ui';
import CategoryShowcase from '../../components/home/CategoryShowcase';
import CategoryExplorer from '../../components/home/CategoryExplorer';
import BudgetSection from '../../components/home/BudgetSection';
import RelationshipGrid from '../../components/home/RelationshipGrid';
import OccasionGrid from '../../components/home/OccasionGrid';
import CollectionStrip from '../../components/home/CollectionStrip';

/* Below-the-fold sections are code-split so the first paint stays fast. */
const LoveLab = lazy(() => import('../../components/home/LoveLab'));
const ReviewsSection = lazy(() => import('../../components/home/ReviewsSection'));
const ReelsSection = lazy(() => import('../../components/home/ReelsSection'));
const OffersSection = lazy(() => import('../../components/home/OffersSection'));
const ContactSection = lazy(() => import('../../components/home/ContactSection'));
const AboutSection = lazy(() => import('../../components/home/AboutSection'));

const TRUST = [
  { icon: Truck, title: 'Fast Delivery', sub: 'Delivered across India' },
  { icon: Gift, title: 'Gift Packaging', sub: 'Ready to gift' },
  { icon: ShieldCheck, title: 'Secure Payments', sub: 'UPI · Cards · Netbanking' },
  { icon: BadgeIndianRupee, title: 'Best Prices', sub: 'Fair, transparent pricing' },
  { icon: RefreshCw, title: 'Easy Returns', sub: 'Simple return support' },
  { icon: MessageCircle, title: 'WhatsApp Support', sub: 'Chat with our team' },
];

const LazySection = ({ children }) => (
  <Suspense fallback={<section className="section tight"><div className="container"><SkeletonGrid count={4} /></div></section>}>
    {children}
  </Suspense>
);

/* The whole homepage comes from ONE aggregated /api/home request, so the
   page no longer staggers through ~10 separate loading skeletons. */
export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [quick, setQuick] = useState(null);

  useEffect(() => {
    let alive = true;
    api.home()
      .then((d) => { if (alive) setData(d); })
      .catch(() => { if (alive) { setError(true); setData({}); } });
    return () => { alive = false; };
  }, []);

  const cols = data?.collections || [];
  const featured = data?.featured || [];
  const coupons = data?.coupons || [];
  const settings = data?.settings || {};
  const stats = data?.stats || {};
  const whatsapp = data?.whatsapp || null;
  const ready = data !== null;

  return (
    <>
      {/* Hero — auto-changing gift images every 3 seconds */}
      <HeroSlider slides={ready ? (data.banners || []) : []} />

      {/* Trust & benefits, right under the hero */}
      <TrustBar stats={stats} settings={settings} />

      <MarqueeBar />

      {/* Friendly error state if the store payload can't be fetched */}
      {error && (
        <section className="section tight">
          <div className="container">
            <EmptyState
              icon="⚠️"
              title="We couldn't load the store"
              text="Please check your connection and try again."
              action={<button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>}
            />
          </div>
        </section>
      )}

      {/* Every category in the store + moment quick-links */}
      {ready && <CategoryShowcase categories={data.categories || []} />}

      {/* Tabbed product explorer with a View All per category */}
      {ready && <CategoryExplorer categories={data.categories || []} />}

      {/* Featured products */}
      <section className="section tight">
        <div className="container">
          <SectionHead
            eyebrow="Curated for you"
            title="Featured Gifts"
            sub="The most-loved picks from Ooha Gifts."
            action={<Link to="/products" className="btn btn-outline btn-sm">View all <ArrowRight size={15} /></Link>}
          />
          {!ready ? <SkeletonGrid count={8} className="product-grid" /> : (
            <div className="product-grid">
              {featured.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.05}>
                  <ProductCard p={p} onQuickView={setQuick} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic product rails (only render when products exist) */}
      {ready && (
        <>
          <ProductRail eyebrow="Customer favourites" title="Best Sellers" sub="Gifts India keeps coming back for." items={data.bestSellers} to="/collection/best-sellers" />
          <ProductRail eyebrow="Make it their day" title="Birthday Gifts" sub="Fun, personal gifts for every birthday." items={data.birthday} to="/occasion/birthday" />
          <ProductRail eyebrow="Celebrate together" title="Anniversary Gifts" sub="Mark every year of togetherness." items={data.anniversary} to="/occasion/anniversary" />
          <ProductRail eyebrow="For two hearts" title="Gifts for Couples" sub="Matching gifts made for two." items={data.couples} to="/relationship/for-couples" />
          <ProductRail eyebrow="Made just for them" title="Personalized Gifts" sub="Names, photos and dates — uniquely theirs." items={data.personalized} to="/category/customized-name-gifts" />
          <ProductRail eyebrow="For teams & clients" title="Corporate Gifts" sub="Premium gifting for work relationships." items={data.corporate} to="/collection/corporate" />
          <ProductRail eyebrow="Biggest savings" title="Special Offers" sub="Top discounts live right now." items={data.discount} to="/offers" viewAllLabel="All offers" />
          <PromoBanner />
          <ProductRail eyebrow="Just landed" title="Recently Added" sub="Fresh off the studio bench." items={data.recentlyAdded} to="/collection/new-arrivals" />
        </>
      )}

      {/* Budget buckets */}
      <section className="section" style={{ background: 'var(--ink)', color: '#fff' }}>
        <div className="container">
          <div className="section-head center">
            <div className="eyebrow" style={{ justifyContent: 'center', color: 'var(--gold)' }}>Every budget</div>
            <h2 className="section-title" style={{ color: '#fff' }}>Gifts Under</h2>
            <p className="section-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>Thoughtful picks for every budget</p>
          </div>
          <BudgetSection />
        </div>
      </section>

      {/* Curated collections */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Handpicked edits" title="Gift Collections" sub="Stories, moods and moments grouped into collections you will love." />
          {ready ? (
            <CollectionStrip items={cols.filter((c) => c.type === 'collection')} />
          ) : (
            <div className="rail-wrap"><div className="rail"><SkeletonGrid count={3} /></div></div>
          )}
        </div>
      </section>

      {/* Love Lab */}
      <LazySection>{ready && <LoveLab items={data.loveLab} />}</LazySection>

      {/* Relationships */}
      <section className="section" style={{ background: 'linear-gradient(180deg, var(--blush) 0%, #fff 100%)' }}>
        <div className="container">
          <SectionHead
            eyebrow="Shop for someone special"
            title="Gifts For Every Relationship"
            sub="For her, for him, for the one who means everything."
            action={<Link to="/relationships" className="btn btn-outline btn-sm">All relationships <ArrowRight size={15} /></Link>}
          />
          {ready ? (
            <RelationshipGrid items={cols.filter((c) => c.type === 'relationship').slice(0, 12)} />
          ) : (
            <div className="grid-4"><SkeletonGrid count={4} /></div>
          )}
        </div>
      </section>

      {/* Occasions */}
      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Celebrate it all"
            title="Gifts For Every Occasion"
            sub="Birthdays to farewells — a gift for every moment."
            action={<Link to="/occasions" className="btn btn-outline btn-sm">All occasions <ArrowRight size={15} /></Link>}
          />
          {ready ? (
            <OccasionGrid items={cols.filter((c) => c.type === 'occasion').slice(0, 9)} />
          ) : (
            <div className="grid-3"><SkeletonGrid count={3} /></div>
          )}
        </div>
      </section>

      {/* Reviews */}
      <LazySection>{ready && <ReviewsSection items={data.reviews} />}</LazySection>

      {/* Reels */}
      <LazySection>{ready && <ReelsSection items={data.videos} />}</LazySection>

      {/* Offers & coupons */}
      <LazySection>{ready && <OffersSection coupons={coupons} />}</LazySection>

      {/* Contact */}
      <LazySection>{ready && <ContactSection settings={settings} whatsapp={whatsapp} />}</LazySection>

      {/* About */}
      <LazySection><AboutSection /></LazySection>

      {/* Trust strip */}
      <section className="trust">
        <div className="container">
          <div className="trust-grid">
            {TRUST.map(({ icon: Icon, title, sub }, i) => (
              <Reveal key={title} delay={i * 0.06}>
                <div className="trust-item">
                  <div className="trust-icon"><Icon size={26} /></div>
                  <h4>{title}</h4>
                  <p>{sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </>
  );
}
