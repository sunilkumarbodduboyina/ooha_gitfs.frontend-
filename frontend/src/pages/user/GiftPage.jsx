import { Link, useParams } from 'react-router-dom';
import Listing from '../../components/Listing';
import { Breadcrumb, EmptyState } from '../../components/ui';

/**
 * Curated gift pages behind the marquee / top-nav moments
 * (Surprise, Appreciation, Love, Celebration). Each page merges several
 * product sets client-side so every moment shows a rich, relevant grid.
 */
const CONFIG = {
  surprise: {
    title: 'Surprise Gifts',
    emoji: '🎁',
    sub: 'Unexpected joy in a box — delightful surprises for the people you love.',
    sets: [
      { occasion: 'make-them-smile' },
      { collection: 'photo-gifts' },
      { search: 'surprise' },
    ],
  },
  appreciation: {
    title: 'Appreciation Gifts',
    emoji: '✨',
    sub: 'Say “you’re amazing” with a gift — thoughtful ways to show you noticed.',
    sets: [
      { occasion: 'special-moments' },
      { collection: 'photo-gifts' },
    ],
  },
  love: {
    title: 'Love Gifts',
    emoji: '❤️',
    sub: 'Romantic, heartfelt and oh-so-you — gifts that say I Love You.',
    sets: [
      { search: 'love' },
      { collection: 'love-lab' },
      { relationship: 'for-girlfriend' },
      { relationship: 'for-boyfriend' },
    ],
  },
  celebration: {
    title: 'Celebration Gifts',
    emoji: '🎉',
    sub: 'Big wins, new chapters and everything worth cheering — party-ready gifting.',
    sets: [
      { occasion: 'birthday' },
      { occasion: 'anniversary' },
      { occasion: 'housewarming' },
      { occasion: 'farewell' },
    ],
  },
};

/** Curated multi-set gift page — same filters/grid as every listing. */
export default function GiftPage() {
  const { slug } = useParams();
  const cfg = CONFIG[slug];

  if (!cfg) {
    return (
      <div className="container">
        <div className="page-head">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Gifts' }]} />
        </div>
        <EmptyState
          icon="🎁"
          title="No such gift page"
          text="That gift moment doesn’t exist — browse every gift instead."
          action={<Link to="/products" className="btn btn-primary">Browse all gifts</Link>}
        />
        <div style={{ height: 60 }} />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-head">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: cfg.title }]} />
        <h1 className="page-title">{cfg.title}</h1>
        <p className="page-sub">{cfg.emoji} {cfg.sub}</p>
      </div>
      <Listing fetchSets={cfg.sets} />
      <div style={{ height: 60 }} />
    </div>
  );
}
