import { MongoClient, ObjectId } from "mongodb";
const g = global as unknown as { _m?: Promise<MongoClient> };
const client = () => (g._m ??= new MongoClient(process.env.MONGODB_URI!).connect());
export const db = async () => (await client()).db();

const WA_NUMBER = "51960668851";

export type Product = {
  id: string; title: string; description: string; cardDescription: string; features: string[];
  metaTitle: string; metaDescription: string; image: string; images: string[]; metaImage: string; price: number; order: number; soldOut?: boolean;
};
type Doc = Omit<Product, "id"> & { _id: ObjectId };
export const toProduct = ({ _id, ...r }: Doc): Product => ({
  id: String(_id), ...r, soldOut: !!r.soldOut,
  images: r.images?.length ? r.images : r.image ? [r.image] : [],
});

export const productsCol = async () => (await db()).collection<Omit<Product, "id">>("products");
export const settingsCol = async () => (await db()).collection<{ _id: string; whatsapp: string }>("settings");

export async function getProducts(): Promise<Product[]> {
  try { return (await (await productsCol()).find().sort({ order: 1 }).toArray()).map(toProduct); }
  catch { return []; }
}
export async function getProduct(id: string): Promise<Product | null> {
  try {
    if (!ObjectId.isValid(id)) return null;
    const d = await (await productsCol()).findOne({ _id: new ObjectId(id) });
    return d ? toProduct(d as Doc) : null;
  } catch { return null; }
}
export async function getWhatsapp(): Promise<string> { return `https://wa.me/${WA_NUMBER}`; }

export function clean(b: unknown) {
  const o = (b ?? {}) as Record<string, unknown>;
  const s = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
  const price = Number(o.price);
  if (!s(o.title, 120) || !isFinite(price) || price < 0) return null;
  const base = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;
  const images = (Array.isArray(o.images) ? o.images : []).slice(0, 8).map((x) => s(x, 500)).filter((x) => x.startsWith(base));
  const image = images[0] ?? ""; 
  return {
    title: s(o.title, 120), description: s(o.description, 5000), cardDescription: s(o.cardDescription, 200),
    features: Array.isArray(o.features) ? o.features.slice(0, 20).map((f: unknown) => s(f, 150)).filter(Boolean) : [],
    metaTitle: s(o.metaTitle, 70), metaDescription: s(o.metaDescription, 160),
    images, image, metaImage: image,
    soldOut: o.soldOut === true,
    price: Math.round(price * 100) / 100,
  };
}