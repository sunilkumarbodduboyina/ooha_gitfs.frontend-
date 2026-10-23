import { Link } from 'react-router-dom';

/* Announcement ticker — pink scrolling bar as requested. */
const MESSAGES = [
  { label: 'Celebrate Today', to: '/occasions' },
  { label: 'Happy Anniversary', to: '/occasion/anniversary' },
  { label: 'Happy Birthday', to: '/occasion/birthday' },
  { label: "You're Amazing", to: '/gifts/appreciation' },
  { label: 'I Love You', to: '/gifts/love' },
  { label: 'Surprise Someone', to: '/gifts/surprise' },
];

/** Infinite scrolling announcement bar below the hero slider. */
export default function MarqueeBar() {
  const copies = [0, 1, 2, 3];
  return (
    <div className="announcement-bar" aria-label="Ooha Gifts announcements">
      <nav className="marquee" aria-label="Shop by gifting moment">
        <div className="marquee-track">
          {copies.map((copy) => (
            <span key={copy} className="marquee-group" aria-hidden={copy > 0 ? 'true' : undefined}>
              {MESSAGES.map((m, idx) => (
                <Link key={copy + '-' + idx} to={m.to} className="marquee-item" tabIndex={copy > 0 ? -1 : undefined}>
                  {m.label}
                </Link>
              ))}
            </span>
          ))}
        </div>
      </nav>
    </div>
  );
}
