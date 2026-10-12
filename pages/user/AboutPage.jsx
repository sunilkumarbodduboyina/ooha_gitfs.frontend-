import { Heart, Sparkles, Users, Leaf } from 'lucide-react';
import { Breadcrumb, Reveal, SectionHead } from '../../components/ui';

const VALUES = [
  { icon: Heart, title: 'Made with love', text: 'Every gift is packed by hand in our Pune studio with a handwritten note.' },
  { icon: Sparkles, title: 'Truly personal', text: 'Names, photos, dates and inside jokes — we make gifts that belong to one person.' },
  { icon: Users, title: 'Loved by 50,000+', text: 'From first anniversaries to farewell cards, Indians trust Ooha for their moments.' },
  { icon: Leaf, title: 'Responsible gifting', text: 'Recyclable packaging, FSC paper and local artisans wherever possible.' },
];

export default function AboutPage() {
  return (
    <div className="container">
      <div className="page-head">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'About Us' }]} />
      </div>

      <section className="section tight" style={{ paddingTop: 10 }}>
        <div className="contact-grid" style={{ alignItems: 'center' }}>
          <Reveal>
            <div>
              <div className="eyebrow">About Ooha Gifts</div>
              <h1 className="section-title">Making every moment meaningful.</h1>
              <div className="prose" style={{ marginTop: 18 }}>
                <p>
                  Ooha Gifts began with a simple belief — the best gifts are not the most expensive ones,
                  but the ones that say <em>“I thought of you.”</em>
                </p>
                <p style={{ marginTop: 14 }}>
                  We craft personalized photo frames, engraved keepsakes, custom mugs, romantic hampers and
                  hundreds of thoughtful gifts for every relationship and occasion in your life. Each product
                  is designed in-house, produced in small batches and quality-checked before it is wrapped.
                </p>
                <p style={{ marginTop: 14 }}>
                  Today, a small team of designers, engravers and packing artists ship gifts to every corner
                  of India — usually within 24 hours of your order.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div style={{ borderRadius: 28, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <img src="/images/banners/banner-2.svg" alt="Ooha Gifts studio" style={{ width: '100%', display: 'block' }} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section tight">
        <SectionHead center eyebrow="What we stand for" title="Our Values" />
        <div className="grid-4">
          {VALUES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.07}>
              <div className="contact-tile" style={{ height: '100%', flexDirection: 'column', textAlign: 'center', alignItems: 'center' }}>
                <div className="ct-icon"><Icon size={24} /></div>
                <h3 style={{ fontSize: '1.08rem' }}>{title}</h3>
                <p className="small muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section tight">
        <div className="prose" style={{ margin: '0 auto' }}>
          <h3>Policies</h3>
          <p><strong>Privacy Policy:</strong> We collect only the details needed to deliver your order — name, address, phone and email. We never sell your data, and payment details are handled entirely by Razorpay.</p>
          <p style={{ marginTop: 12 }}><strong>Terms &amp; Conditions:</strong> Prices are inclusive of GST. Personalized items are made-to-order and can be replaced if damaged in transit. Cancellations are accepted before dispatch.</p>
          <p style={{ marginTop: 12 }}><strong>Careers:</strong> We are always looking for gift-loving people — say hello at hello@oohagifts.com.</p>
        </div>
      </section>
      <div style={{ height: 40 }} />
    </div>
  );
}
