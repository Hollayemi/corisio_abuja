/**
 * Sample Abuja stores. Replace with the real API response — the `Store` shape
 * is what the map and briefing card consume.
 */
export type StoreProduct = { name: string; price: number; image: string };

export type Store = {
  slug: string;
  image: string; // /public path or full URL
  name: string;
  category: string; // matches siteConfig.categories slugs
  categoryLabel: string;
  tagline: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  hours: { open: number; close: number }; // 24h clock
  phone: string;
  products: StoreProduct[];
};

export const ABUJA_CENTER = { lat: 9.0765, lng: 7.4986 };

export const stores: Store[] = [
  { slug: "wuse-fresh-mart", image: "/images/market.webp", name: "Wuse Fresh Mart", category: "food-groceries", categoryLabel: "Food & Groceries", tagline: "Daily groceries, fresh produce and household staples.", address: "Aminu Kano Crescent, Wuse II", area: "Wuse II", lat: 9.0823, lng: 7.4745, rating: 4.6, reviews: 212, hours: { open: 7, close: 22 }, phone: "+234 800 000 0001", products: [{ name: "Rice (5kg)", price: 9500, image: "/images/prod2.png" }, { name: "Vegetable oil (1L)", price: 2800, image: "/images/prod3.png" }, { name: "Eggs (crate)", price: 4200, image: "/images/prod4.png" }] },
  { slug: "garki-tech-hub", image: "/images/cate4.png", name: "Garki Tech Hub", category: "electronics", categoryLabel: "Electronics", tagline: "Chargers, phones, accessories and quick repairs.", address: "Area 11 Shopping Complex, Garki", area: "Garki", lat: 9.0334, lng: 7.4892, rating: 4.4, reviews: 134, hours: { open: 9, close: 20 }, phone: "+234 800 000 0002", products: [{ name: "USB-C charger", price: 15000, image: "/images/prod5.png" }, { name: "Power bank 10,000mAh", price: 18500, image: "/images/prod6.png" }, { name: "Earbuds", price: 12000, image: "/images/prod7.png" }] },
  { slug: "maitama-pharmacy", image: "/images/cate6.png", name: "Maitama Care Pharmacy", category: "health-wellness", categoryLabel: "Health & Wellness", tagline: "Prescriptions, supplements and wellness essentials.", address: "IBB Way, Maitama", area: "Maitama", lat: 9.0907, lng: 7.4932, rating: 4.8, reviews: 301, hours: { open: 0, close: 24 }, phone: "+234 800 000 0003", products: [{ name: "Vitamin C (60 tabs)", price: 3500, image: "/images/prod8.png" }, { name: "Hand sanitiser", price: 1500, image: "/images/prod9.png" }, { name: "First-aid kit", price: 8000, image: "/images/prod10.png" }] },
  { slug: "jabi-lake-bites", image: "/images/meat.png", name: "Jabi Lake Bites", category: "restaurants", categoryLabel: "Restaurants", tagline: "Jollof, grills and quick lunch plates by the lake.", address: "Jabi Lake Mall Road, Jabi", area: "Jabi", lat: 9.0716, lng: 7.4252, rating: 4.3, reviews: 188, hours: { open: 10, close: 23 }, phone: "+234 800 000 0004", products: [{ name: "Jollof & chicken", price: 4500, image: "/images/prod11.png" }, { name: "Suya platter", price: 5000, image: "/images/prod12.png" }, { name: "Chapman", price: 1800, image: "/images/prod13.png" }] },
  { slug: "utako-style-house", image: "/images/cate2.png", name: "Utako Style House", category: "fashion", categoryLabel: "Fashion", tagline: "Ready-to-wear, ankara and tailoring on demand.", address: "Ibrahim Babangida Way, Utako", area: "Utako", lat: 9.0661, lng: 7.4372, rating: 4.5, reviews: 96, hours: { open: 9, close: 19 }, phone: "+234 800 000 0005", products: [{ name: "Ankara shirt", price: 14000, image: "/images/prod14.png" }, { name: "Corporate trousers", price: 16500, image: "/images/prod15.png" }, { name: "Leather belt", price: 6000, image: "/images/prod16.png" }] },
  { slug: "gwarinpa-home-store", image: "/images/cate7.png", name: "Gwarinpa Home Store", category: "home-living", categoryLabel: "Home & Living", tagline: "Kitchenware, bedding and everyday home needs.", address: "3rd Avenue, Gwarinpa", area: "Gwarinpa", lat: 9.1131, lng: 7.4048, rating: 4.2, reviews: 77, hours: { open: 8, close: 20 }, phone: "+234 800 000 0006", products: [{ name: "Non-stick pot set", price: 32000, image: "/images/prod17.png" }, { name: "Bedsheet set", price: 18000, image: "/images/prod18.png" }, { name: "Electric kettle", price: 11500, image: "/images/prod19.png" }] },
  { slug: "asokoro-glow-beauty", image: "/images/cate5.png", name: "Asokoro Glow Beauty", category: "beauty-personal-care", categoryLabel: "Beauty & Personal Care", tagline: "Skincare, haircare and fragrances from trusted brands.", address: "Yakubu Gowon Crescent, Asokoro", area: "Asokoro", lat: 9.0412, lng: 7.5231, rating: 4.7, reviews: 158, hours: { open: 9, close: 20 }, phone: "+234 800 000 0007", products: [{ name: "Shea body butter", price: 4800, image: "/images/prod20.png" }, { name: "Face wash", price: 6500, image: "/images/prod1.png" }, { name: "Perfume (50ml)", price: 22000, image: "/images/prod2.png" }] },
  { slug: "kubwa-mega-supermarket", image: "/images/full-basket.webp", name: "Kubwa Mega Supermarket", category: "food-groceries", categoryLabel: "Food & Groceries", tagline: "Bulk groceries and household goods at friendly prices.", address: "Phase 4 Road, Kubwa", area: "Kubwa", lat: 9.1517, lng: 7.3293, rating: 4.1, reviews: 245, hours: { open: 7, close: 21 }, phone: "+234 800 000 0008", products: [{ name: "Beans (5kg)", price: 8800, image: "/images/prod3.png" }, { name: "Tomato paste (carton)", price: 14000, image: "/images/prod4.png" }, { name: "Bottled water (pack)", price: 3000, image: "/images/prod5.png" }] },
];

export function isOpenNow(s: Store, now = new Date()) {
  const h = now.getHours();
  return s.hours.open === 0 && s.hours.close === 24 ? true : h >= s.hours.open && h < s.hours.close;
}

/** Haversine distance in km — computed locally, no Maps API call needed. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export const getStore = (slug: string) => stores.find((s) => s.slug === slug);