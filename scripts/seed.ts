import "dotenv/config";
import { supabase, unwrap } from "../lib/supabase";

const products = [
  { name: "Silk Pleat Top", category: "tops", subcategory: null, price: 1490, stock: 12, overview: "Soft texture and elegant drape for day-to-night styling.", image_url: "/images/topsfeatured.jpg" },
  { name: "Rose Blazer", category: "tops", subcategory: null, price: 1890, stock: 8, overview: "Polished layering piece with a confident silhouette.", image_url: "/images/topsfeatured.jpg" },
  { name: "Satin Midi Dress", category: "dresses", subcategory: null, price: 2490, stock: 10, overview: "Fluid satin finish that moves beautifully with every step.", image_url: "/images/dressesfeatured.jpg" },
  { name: "Luna Evening Gown", category: "dresses", subcategory: null, price: 3290, stock: 5, overview: "Graceful fit for celebrations and unforgettable evenings.", image_url: "/images/dressesfeatured.jpg" },
  { name: "Crescent Wide-Leg Trousers", category: "bottoms", subcategory: null, price: 1790, stock: 10, overview: "Comfort-meets-elegance with a modern relaxed fit.", image_url: "/images/bottomsfeatured.jpg" },
  { name: "Ember Pleated Skirt", category: "bottoms", subcategory: null, price: 1990, stock: 7, overview: "A statement skirt with crisp movement and luminous texture.", image_url: "/images/bottomsfeatured.jpg" },
  { name: "Velvet Bloom Heels", category: "shoes", subcategory: "heels", price: 2790, stock: 6, overview: "Elevated daily heels with a refined, feminine shape.", image_url: "/images/shoesfeatured.jpg" },
  { name: "Cora Sandals", category: "shoes", subcategory: "sandals", price: 2190, stock: 9, overview: "Lightweight leather sandals for effortless warm-weather styling.", image_url: "/images/shoesfeatured.jpg" },
  { name: "Elysian Gold Necklace", category: "accessories", subcategory: "necklace", price: 1290, stock: 15, overview: "Timeless jewelry detailing to finish your signature look.", image_url: "/images/accessoriesfeatured.jpg" },
  { name: "Mira Statement Earrings", category: "accessories", subcategory: "earrings", price: 990, stock: 20, overview: "A subtle gleam for elevated outfits and gallery nights.", image_url: "/images/accessoriesfeatured.jpg" },
  { name: "Noor Perfume", category: "perfumes", subcategory: null, price: 1890, stock: 14, overview: "A warm floral signature with soft amber undertones.", image_url: "/images/perfumefeatured.jpg", features: { "50ml": 1890, "100ml": 2990 } },
  { name: "Aster Perfume", category: "perfumes", subcategory: null, price: 1990, stock: 11, overview: "Fresh, layered notes crafted for graceful everyday wear.", image_url: "/images/perfumefeatured.jpg", features: { "50ml": 1990, "100ml": 3190 } },
];

async function main() {
  // The admin account needs no seeding: it's created on first login from ADMIN_EMAIL / ADMIN_PASSWORD.
  const { count, error } = await supabase.from("products").select("*", { count: "exact", head: true });
  if (error) throw error;
  if (count === 0) {
    unwrap(await supabase.from("products").insert(products));
    console.log(`Seeded ${products.length} sample products.`);
  } else {
    console.log("Products already exist — skipping product seed.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
