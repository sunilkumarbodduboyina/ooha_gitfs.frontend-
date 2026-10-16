import { Link } from 'react-router-dom';

/* Every marquee moment links to its own gift page. */
const MESSAGES = [
  { label: 'Happy Birthday ❤️', to: '/occasion/birthday' },
  { label: 'Surprise Someone 🎁', to: '/gifts/surprise' },
  { label: "You're Amazing ✨", to: '/gifts/appreciation' },
  { label: 'I Love You ❤️', to: '/gifts/love' },
  { label: 'Celebrate 🎉', to: '/gifts/celebration' },
  { label: 'Happy Anniversary 💍', to: '/occasion/anniversary' },
  { label: 'Celebrate Today 🎊', to: '/occasions' },
];

/** Infinite right→left celebration marquee — each moment is clickable. */
export default function MarqueeBar() {
  const copies = [0, 1, 2, 3];
  return (
    <nav className="marquee" aria-label="Shop by gifting moment">
      <div className="marquee-track">
        {copies.map((copy) => (
          <span key={copy} className="marquee-group" aria-hidden={copy > 0 ? 'true' : undefined}>
            {MESSAGES.map((m) => (
              <Link key={m.to} to={m.to} className="marquee-item" tabIndex={copy > 0 ? -1 : undefined}>
                {m.label}
              </Link>
            ))}
          </span>
        ))}
      </div>
    </nav>
  );
}
