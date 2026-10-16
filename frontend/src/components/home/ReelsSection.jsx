import { useEffect, useRef, useState } from 'react';
import { Heart, Pause, Play, Share2 } from 'lucide-react';
import { api, img } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Reveal, SectionHead } from '../ui';

function Reel({ v }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const toast = useToast();

  /* autoplay when visible, muted by default */
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        } else {
          el.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.55 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().then(() => setPlaying(true)).catch(() => {});
    else { el.pause(); setPlaying(false); }
  };

  const share = async () => {
    const url = `${window.location.origin}/`;
    if (navigator.share) {
      try { await navigator.share({ title: v.title, url }); return; } catch { /* cancelled */ }
    }
    try { await navigator.clipboard.writeText(url); toast.success('Link copied!'); } catch { toast.error('Could not copy link'); }
  };

  return (
    <div className="reel">
      <video
        ref={ref}
        src={v.video_url}
        poster={img(v.thumbnail)}
        muted
        loop
        playsInline
        preload="metadata"
        onClick={toggle}
      />
      <div className="reel-grad" />
      {!playing && (
        <button className="reel-play" onClick={toggle} aria-label="Play video">
          <Play size={26} fill="currentColor" />
        </button>
      )}
      <div className="reel-actions">
        <button
          className={`reel-action ${liked ? 'liked' : ''}`}
          onClick={() => setLiked((x) => !x)}
          aria-label="Like"
        >
          <Heart size={19} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <button className="reel-action" onClick={share} aria-label="Share">
          <Share2 size={18} />
        </button>
        <button className="reel-action" onClick={toggle} aria-label="Play or pause">
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>
      <div className="reel-info">
        <h4>{v.title}</h4>
        <p>{v.description}</p>
      </div>
    </div>
  );
}

/** "Watch & Explore" — Instagram-Reels style vertical video rail. */
export default function ReelsSection({ items }) {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (items !== undefined) { setVideos(items || []); return; }
    api.videos().then((d) => setVideos(d.videos || [])).catch(() => {});
  }, [items]);

  if (!videos.length) return null;

  return (
    <section className="section" style={{ background: 'linear-gradient(180deg, #fff 0%, var(--primary-soft) 100%)' }}>
      <div className="container">
        <SectionHead
          eyebrow="Reels"
          title="Watch & Explore"
          sub="See the moments. Feel the stories."
        />
        <div className="reels">
          {videos.map((v, i) => (
            <Reveal key={v.id} delay={Math.min(i * 0.06, 0.3)}>
              <Reel v={v} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
