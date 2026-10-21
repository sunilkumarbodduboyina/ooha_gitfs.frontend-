'use strict';

/**
 * Adds a curated batch of extra products to the catalogue.
 *
 * Idempotent: products whose slug already exists are skipped, so this can be
 * re-run safely (locally or against a hosted database) without duplicating
 * anything or overwriting hand-edited products.
 *
 *   node setup/add-products.js
 *
 * Then run `node setup/assets.js` to (re)generate the SVG artwork for the new
 * products (each product gets a main image plus two alternates).
 */
const { query, one, pool } = require('../config/db');

const PRODUCTS = [
  {
    name: 'Birthday Photo Collage Puzzle',
    slug: 'birthday-photo-collage-puzzle',
    description:
      'A 120-piece wooden jigsaw printed with your favourite photos and birthday wishes. Comes in a kraft gift box with a card — a gift they build, then keep.',
    category: 'Puzzles',
    collection: 'birthday',
    occasion: 'Birthday',
    relationship: 'For Best Friend',
    subcategory: 'Photo Puzzles',
    original_price: 899,
    selling_price: 649,
    sku: 'OOHA-PZL-101',
    tags: 'puzzle,photo,personalized,birthday',
    featured: 1,
    new_arrival: 1,
    rating: 4.8,
    review_count: 74,
  },
  {
    name: 'Couple Name Ceramic Mug Set',
    slug: 'couple-name-ceramic-mug-set',
    description:
      'Two hand-glazed ceramic mugs with your names and a tiny heart on the handle. Dishwasher safe, packed as a pair in a cushioned gift box.',
    category: 'Mugs',
    collection: 'anniversary',
    occasion: 'Anniversary',
    relationship: 'For Couples',
    subcategory: 'Couple Sets',
    original_price: 749,
    selling_price: 549,
    sku: 'OOHA-MUG-102',
    tags: 'mug,couple,anniversary,personalized',
    bestseller: 1,
    rating: 4.9,
    review_count: 132,
  },
  {
    name: 'Personalized Car Dashboard Frame',
    slug: 'personalized-car-dashboard-frame',
    description:
      'A compact wooden frame that clips onto the dashboard, engraved with a name, date or short line. A daily reminder of someone special on every drive.',
    category: 'Frames',
    collection: 'housewarming',
    occasion: 'Housewarming',
    relationship: 'For Husband',
    subcategory: 'Car Accessories',
    original_price: 599,
    selling_price: 449,
    sku: 'OOHA-FRM-103',
    tags: 'frame,car,personalized,dashboard',
    rating: 4.6,
    review_count: 41,
  },
  {
    name: 'Custom Soundwave Engraved Plaque',
    slug: 'custom-soundwave-engraved-plaque',
    description:
      'Send us a voice note, a song or a first "I love you" — we turn the waveform into a precision-engraved wooden plaque with the date underneath.',
    category: 'Engravings',
    collection: 'valentine-s-day',
    occasion: "Valentine's Day",
    relationship: 'For Wife',
    subcategory: 'Soundwave Art',
    original_price: 1499,
    selling_price: 1099,
    sku: 'OOHA-ENG-104',
    tags: 'engraving,soundwave,personalized,valentine',
    featured: 1,
    rating: 4.9,
    review_count: 96,
  },
  {
    name: 'Family Birthday Calendar Board',
    slug: 'family-birthday-calendar-board',
    description:
      'A perpetual wooden calendar that keeps every birthday and anniversary in one place. Twelve engraved discs rotate month by month — no app, no batteries.',
    category: 'Calendars',
    collection: 'birthday',
    occasion: 'Birthday',
    relationship: 'For Mother',
    subcategory: 'Perpetual Calendars',
    original_price: 1199,
    selling_price: 899,
    sku: 'OOHA-CAL-105',
    tags: 'calendar,birthday,family,wooden',
    rating: 4.7,
    review_count: 58,
  },
  {
    name: 'Long Distance Hug Care Package',
    slug: 'long-distance-hug-care-package',
    description:
      'A little box of closeness: a handwritten note, a soft blanket square, their favourite chocolate and a "hug coupon" for when you finally meet.',
    category: 'Long Distance',
    collection: 'special-moments',
    occasion: 'Special Moments',
    relationship: 'For Girlfriend',
    subcategory: 'Care Packages',
    original_price: 1599,
    selling_price: 1249,
    sku: 'OOHA-LDR-106',
    tags: 'long-distance,care-package,hamper,letters',
    bestseller: 1,
    rating: 4.8,
    review_count: 87,
  },
  {
    name: 'Luxury Chocolate & Dry Fruit Hamper',
    slug: 'luxury-chocolate-dry-fruit-hamper',
    description:
      'An elegant hamper with single-origin chocolate, roasted almonds and cashews, and a hand-tied gold ribbon. Ideal for housewarmings, thank-yous and clients.',
    category: 'Gift Hampers',
    collection: 'housewarming',
    occasion: 'Housewarming',
    relationship: 'For Father',
    subcategory: 'Premium Hampers',
    original_price: 2499,
    selling_price: 1999,
    sku: 'OOHA-HMP-107',
    tags: 'hamper,chocolate,dry-fruit,luxury',
    featured: 1,
    rating: 4.9,
    review_count: 63,
  },
  {
    name: 'Personalized Name Neon Desk Light',
    slug: 'personalized-name-neon-desk-light',
    description:
      'A warm LED name light, cut to order and mounted on a wooden base. USB powered with three brightness levels — a glow-up for any desk or bedside.',
    category: 'Customized Name Gifts',
    collection: 'make-them-smile',
    occasion: 'Make Them Smile',
    relationship: 'For Sister',
    subcategory: 'Name Lights',
    original_price: 1899,
    selling_price: 1499,
    sku: 'OOHA-NEO-108',
    tags: 'neon,name,personalized,desk,lamp',
    new_arrival: 1,
    rating: 4.7,
    review_count: 45,
  },
  {
    name: 'Engraved Wooden Recipe Board',
    slug: 'engraved-wooden-recipe-board',
    description:
      'A solid-wood board engraved with a family recipe in a loved one\u2019s handwriting. Equal parts kitchen tool and keepsake — a favourite housewarming gift.',
    category: 'Engravings',
    collection: 'housewarming',
    occasion: 'Housewarming',
    relationship: 'For Mother',
    subcategory: 'Kitchen Keepsakes',
    original_price: 1299,
    selling_price: 999,
    sku: 'OOHA-ENG-109',
    tags: 'engraving,recipe-board,wooden,kitchen',
    rating: 4.8,
    review_count: 52,
  },
];

const money = (n) => Number(n).toFixed(2);

async function insert(table, row) {
  const keys = Object.keys(row);
  const sql = `INSERT INTO \`${table}\` (${keys.map((k) => `\`${k}\``).join(', ')})
               VALUES (${keys.map(() => '?').join(', ')})`;
  const result = await query(sql, keys.map((k) => row[k]));
  return result.insertId;
}

async function main() {
  const categories = await query('SELECT id, name FROM categories');
  const categoryId = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  const collections = await query('SELECT id, slug FROM collections');
  const collectionId = Object.fromEntries(collections.map((c) => [c.slug, c.id]));

  let added = 0;
  let skipped = 0;
  const problems = [];

  for (const p of PRODUCTS) {
    if (await one('SELECT id FROM products WHERE slug = ?', [p.slug])) {
      skipped += 1;
      console.log(`  = ${p.name} (already exists)`);
      continue;
    }

    const discountAmount = Math.max(0, p.original_price - p.selling_price);
    const discountPercentage =
      p.original_price > 0 ? Math.round((discountAmount / p.original_price) * 100) : 0;

    if (!categoryId[p.category]) problems.push(`${p.name}: category "${p.category}" not found`);
    if (!collectionId[p.collection]) problems.push(`${p.name}: collection "${p.collection}" not found`);

    const id = await insert('products', {
      name: p.name,
      slug: p.slug,
      description: p.description,
      category_id: categoryId[p.category] ?? null,
      collection_id: collectionId[p.collection] ?? null,
      occasion: p.occasion,
      relationship: p.relationship,
      subcategory: p.subcategory || null,
      original_price: money(p.original_price),
      selling_price: money(p.selling_price),
      discount_amount: money(discountAmount),
      discount_percentage: discountPercentage,
      stock: p.stock ?? 100,
      sku: p.sku,
      brand: p.brand || 'Ooha Gifts',
      tags: p.tags,
      rating: p.rating ?? 4.7,
      review_count: p.review_count ?? 0,
      featured: p.featured ? 1 : 0,
      bestseller: p.bestseller ? 1 : 0,
      new_arrival: p.new_arrival ? 1 : 0,
      status: 1,
    });

    /* Same naming scheme setup/assets.js uses, so the artwork lines up. */
    const images = [
      `images/products/${p.slug}.svg`,
      `images/products/${p.slug}-alt1.svg`,
      `images/products/${p.slug}-alt2.svg`,
    ];
    for (let i = 0; i < images.length; i += 1) {
      await insert('product_images', { product_id: id, image: images[i], sort_order: i });
    }

    added += 1;
    console.log(`  + ${p.name}`);
  }

  const total = await one('SELECT COUNT(*) AS c FROM products');

  console.log(`\nAdded ${added}, skipped ${skipped}. Catalogue now has ${total.c} products.`);
  if (problems.length) {
    console.log('\nWarnings:');
    for (const p of problems) console.log(`  ! ${p}`);
  }
  if (added > 0) console.log('Next: run `node setup/assets.js` to generate the new artwork.');

  await pool.end();
}

main().catch(async (error) => {
  console.error('Product seed failed:', error.message);
  try { await pool.end(); } catch { /* pool already closed */ }
  process.exit(1);
});
