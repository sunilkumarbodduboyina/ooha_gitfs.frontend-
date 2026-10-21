import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/*
 * Homepage intro — "Every gift has a story".
 * Six 3D cards that flip on hover, on keyboard focus, and on tap (touch).
 * The back of each card links to the matching storefront section.
 */
const CARDS = [
  {
    emoji: '🎂',
    title: 'Birthday Gifts',
    text: 'Make their whole day. Personalised keepsakes, surprise boxes and cards for every age.',
    to: '/occasion/birthday',
  },
  {
    emoji: '💍',
    title: 'Anniversary',
    text: 'Mark the years together with photo frames, engraved keepsakes and gifts made for two.',
    to: '/occasion/anniversary',
  },
  {
    emoji: '💌',
    title: 'Love & Valentine',
    text: 'Say it out loud. Heart-led gifts for the person who feels like home.',
    to: '/occasion/love',
  },
  {
    emoji: '🏡',
    title: 'Housewarming',
    text: 'New home, first memories. Warm, useful gifts that settle right in.',
    to: '/occasion/housewarming',
  },
  {
    emoji: '✨',
    title: 'Personalised',
    text: 'Names, dates, photos, even soundwaves. Turn something ordinary into something theirs.',
    to: '/category/customized-name-gifts',
  },
  {
    emoji: '🎁',
    title: 'Corporate Gifting',
    text: 'Thank clients and teams with premium hampers, engraved pens and branded keepsakes.',
    to: '/collection/corporate',
  },
];

export default function IntroFlip() {
  const [flipped, setFlipped] = useState(null);

  /* Mouse users flip on hover; touch users tap to flip. Guarding the click keeps
     a desktop click from leaving a card stuck face-down after the cursor moves. */
  const toggle = (index) => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
      setFlipped((current) => (current === index ? null : index));
    }
  };

  return (
    <section className="section intro-flip">
      <div className="container">
        <div className="intro-head">
          <div className="eyebrow">Welcome to Ooha Gifts</div>
          <h2 className="section-title">
            Every gift has a story. <span className="intro-accent">Flip to find yours.</span>
          </h2>
          <p className="section-sub">
            Personalised gifts, thoughtfully made in India — for the people who make your days matter.
          </p>
        </div>

        <div className="flip-grid">
          {CARDS.map((card, index) => (
            <div
              key={card.title}
              className={`flip-card${flipped === index ? ' is-flipped' : ''}`}
              onClick={() => toggle(index)}
            >
              <div className="flip-inner">
                <div className="flip-face flip-front">
                  <span className="flip-emoji" aria-hidden="true">{card.emoji}</span>
                  <h3>{card.title}</h3>
                  <span className="flip-hint">Flip <ArrowRight size={13} /></span>
                </div>
                <div className="flip-face flip-back">
                  <h4>{card.title}</h4>
                  <p>{card.text}</p>
                  <Link
                    to={card.to}
                    className="flip-link"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Shop now <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
