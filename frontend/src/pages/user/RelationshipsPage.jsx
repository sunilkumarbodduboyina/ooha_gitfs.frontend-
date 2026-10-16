import RelationshipGrid from '../../components/home/RelationshipGrid';
import { Breadcrumb, SectionHead } from '../../components/ui';

export default function RelationshipsPage() {
  return (
    <div className="container">
      <div className="page-head">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Relationships' }]} />
      </div>
      <section className="section tight" style={{ paddingTop: 10 }}>
        <SectionHead
          eyebrow="Shop for someone special"
          title="Gifts For Every Relationship"
          sub="For her, for him, for the one who means everything."
        />
        <RelationshipGrid limit={24} />
      </section>
      <div style={{ height: 40 }} />
    </div>
  );
}
