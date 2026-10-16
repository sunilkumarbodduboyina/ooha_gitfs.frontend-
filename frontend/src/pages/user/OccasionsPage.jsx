import OccasionGrid from '../../components/home/OccasionGrid';
import { Breadcrumb, SectionHead } from '../../components/ui';

export default function OccasionsPage() {
  return (
    <div className="container">
      <div className="page-head">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Occasions' }]} />
      </div>
      <section className="section tight" style={{ paddingTop: 10 }}>
        <SectionHead
          eyebrow="Celebrate it all"
          title="Gifts For Every Occasion"
          sub="Pick the moment — we will bring the perfect gift."
        />
        <OccasionGrid limit={24} />
      </section>
      <div style={{ height: 40 }} />
    </div>
  );
}
