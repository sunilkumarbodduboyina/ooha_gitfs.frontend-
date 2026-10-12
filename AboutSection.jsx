import { Link } from 'react-router-dom';
import { Heart, Sparkles, Users, Leaf, ArrowRight } from 'lucide-react';
import { Reveal, SectionHead } from '../ui';

const VALUES = [
  { icon: Heart, title: 'Made with love', text: 'Every gift is packed by hand in our Pune studio with a handwritten note.' },
  { icon: Sparkles, title: 'Truly personal', text: 'Names, photos, dates and inside jokes — we make gifts that belong to one person.' },
  { icon: Users, title: 'Loved by 50,000+', text: 'From first anniversaries to farewell cards, Indians trust Ooha for their moments.' },
  { icon: Leaf, title: 'Responsible gifting', text: 'Recyclable packaging, FSC paper and local artisans wherever possible.' },
];

/** Homepage "About Ooha Gifts" section — story, studio image and values. */
export default function AboutSection() {
  return (
    <section
      className="section"
      id="about"
      style={{ background: 'linear-gradient(180deg, var(--blush) 0%, #fff 100%)' }}
    >
      <div className="container">
        <SectionHead center eyebrow="About Ooha Gifts" title="Making every moment meaningful." />

        <div className="contact-grid" style={{ alignItems: 'center' }}>
          <Reveal>
            <div>
              <div className="prose">
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
              <Link to="/about" className="btn btn-dark btn-sm" style={{ marginTop: 20 }}>
                Read our full story <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div style={{ borderRadius: 28, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <img src="/images/banners/banner-2.svg" alt="Ooha Gifts studio" style={{ width: '100%', display: 'block' }} />
            </div>
          </Reveal>
        </div>

        <div className="grid-4" style={{ marginTop: 44 }}>
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
      </div>
    </section>
  );
}
