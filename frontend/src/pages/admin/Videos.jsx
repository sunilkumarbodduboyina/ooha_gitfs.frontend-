import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save, Video, Upload, Play } from 'lucide-react';
import { api, img } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/ui';

const BLANK = { title: '', description: '', video_url: '', thumbnail: '', display_order: 0, active: 1 };

export default function AdminVideos() {
  const toast = useToast();
  const [videos, setVideos] = useState(null);
  const [form, setForm] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = () => api.adminVideos().then((d) => setVideos(d.videos || [])).catch(() => setVideos([]));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title.trim()) return toast.error('Video title is required');
    setBusy(true);
    try {
      if (videoFile || thumbFile) {
        /* upload files first, then save the record with returned URLs */
        let payload = { ...form };
        if (videoFile) {
          const fd = new FormData();
          fd.append('file', videoFile);
          const up = await api.upload(fd);
          payload.video_url = up.files[0].url;
        }
        if (thumbFile) {
          const fd = new FormData();
          fd.append('file', thumbFile);
          const up = await api.upload(fd);
          payload.thumbnail = up.files[0].url;
        }
        await api.saveVideo(payload);
      } else {
        await api.saveVideo(form);
      }
      toast.success(`Video ${form.id ? 'updated' : 'added'} 🎬`);
      setForm(null); setVideoFile(null); setThumbFile(null); load();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const remove = async (v) => {
    try {
      await api.deleteVideo(v.id);
      toast.success('Video deleted');
      setVideos((x) => x.filter((y) => y.id !== v.id));
    } catch (e) { toast.error(e.message); } finally { setConfirm(null); }
  };

  if (!videos) return <Spinner label="Loading videos…" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <p className="muted small">{videos.length} reels in “Watch &amp; Explore” · videos autoplay muted when scrolled into view</p>
        <button className="btn btn-primary btn-sm" onClick={() => setForm({ ...BLANK, display_order: videos.length })}><Plus size={15} /> Add video</button>
      </div>

      <div className="grid-4">
        {videos.map((v) => (
          <div key={v.id} className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', aspectRatio: '9/16', background: 'var(--ink)' }}>
              {v.thumbnail
                ? <img src={img(v.thumbnail)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'rgba(255,255,255,0.5)' }}><Video size={38} /></div>}
              <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <span style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.88)', display: 'grid', placeItems: 'center' }}>
                  <Play size={20} fill="var(--primary-dark)" color="var(--primary-dark)" />
                </span>
              </span>
              <span className={`status-chip ${Number(v.active) ? 'st-delivered' : 'st-cancelled'}`} style={{ position: 'absolute', top: 8, left: 8 }}>
                {Number(v.active) ? 'Live' : 'Hidden'}
              </span>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{v.title}</div>
              <div className="small muted" style={{ margin: '4px 0 10px', minHeight: 30 }}>{v.description}</div>
              <div className="row-actions">
                <button onClick={() => { setForm({ ...BLANK, ...v }); setVideoFile(null); setThumbFile(null); }}><Pencil size={13} /> Edit</button>
                <button className="danger" onClick={() => setConfirm(v)}><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
        {!videos.length && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="es-icon"><Video size={30} /></div>
            <h3>No reels yet</h3>
            <p>Upload a vertical video to power the homepage “Watch &amp; Explore” section.</p>
          </div>
        )}
      </div>

      {form && (
        <div className="modal-backdrop" onClick={() => setForm(null)}>
          <div className="modal" style={{ padding: 30, maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 20 }}>{form.id ? 'Edit video' : 'New video reel'}</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div className="field">
                <label>Title *</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Her reaction was everything 😍" />
              </div>
              <div className="field">
                <label>Description</label>
                <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Personalized name lamp unboxing" />
              </div>
              <div className="field">
                <label>Video URL</label>
                <input className="input" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="/uploads/videos/clip.mp4 or https://…" />
              </div>
              <div className="field">
                <label>Thumbnail URL</label>
                <input className="input" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="images/videos/poster-1.svg" />
              </div>
              <div className="form-grid-3" style={{ display: 'grid', gap: 16 }}>
                <div className="field">
                  <label>Upload video</label>
                  <label className="dropzone" style={{ padding: 14 }}>
                    <Upload size={17} style={{ margin: '0 auto 4px' }} />
                    <span className="small">{videoFile ? videoFile.name : 'MP4 / WEBM'}</span>
                    <input type="file" accept="video/*" hidden onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <div className="field">
                  <label>Upload thumbnail</label>
                  <label className="dropzone" style={{ padding: 14 }}>
                    <Upload size={17} style={{ margin: '0 auto 4px' }} />
                    <span className="small">{thumbFile ? thumbFile.name : 'JPG / PNG'}</span>
                    <input type="file" accept="image/*" hidden onChange={(e) => setThumbFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select className="input select" value={form.active} onChange={(e) => setForm({ ...form, active: Number(e.target.value) })}>
                    <option value={1}>Visible</option><option value={0}>Hidden</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
              <button className="btn btn-outline full" onClick={() => { setForm(null); setVideoFile(null); setThumbFile(null); }}>Cancel</button>
              <button className="btn btn-primary full" onClick={save} disabled={busy}>{busy ? 'Saving…' : <><Save size={16} /> Save video</>}</button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="modal-backdrop" onClick={() => setConfirm(null)}>
          <div className="modal" style={{ padding: 30, maxWidth: 430 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem' }}>Delete “{confirm.title}”?</h3>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn btn-outline full" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn full" style={{ background: '#dc2626', color: '#fff' }} onClick={() => remove(confirm)}><Trash2 size={15} /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
