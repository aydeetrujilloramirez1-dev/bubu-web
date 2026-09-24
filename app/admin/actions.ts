"use server";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { createHash } from "crypto";
import { COOKIE, signSession, verifySession } from "@/lib/auth";
import { clean, getProducts, getWhatsapp, productsCol, settingsCol } from "@/lib/data";

type R = Promise<{ error?: string }>;
const tries = new Map<string, { n: number; t: number }>();
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

async function guard() {
  if (!(await verifySession((await cookies()).get(COOKIE)?.value))) throw new Error("No autorizado");
}
const products = productsCol;

// ---------- Sesión ----------
export async function login(user: string, password: string): R {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "x";
  const now = Date.now(), rec = tries.get(ip);
  if (rec && now - rec.t < 900_000 && rec.n >= 5) return { error: "Demasiados intentos. Espera 15 minutos." };
  const ok = String(user) === process.env.ADMIN_USER &&
    (await bcrypt.compare(String(password), process.env.ADMIN_PASSWORD_HASH!));
  if (!ok) {
    const fresh = !rec || now - rec.t > 900_000;
    tries.set(ip, { n: fresh ? 1 : rec!.n + 1, t: fresh ? now : rec!.t });
    return { error: "Credenciales incorrectas" };
  }
  tries.delete(ip);
  (await cookies()).set(COOKIE, await signSession(), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 8 * 3600,
  });
  return {};
}
export async function logout() { (await cookies()).delete(COOKIE); }

// ---------- Lectura ----------
export async function loadAdmin() {
  await guard();
  return { products: await getProducts(), whatsapp: await getWhatsapp() };
}

// ---------- Productos ----------
export async function saveProduct(id: string, body: unknown): R {
  await guard();
  const data = clean(body);
  if (!data) return { error: "Datos inválidos" };
  if (!data.image) return { error: "Sube una imagen antes de guardar" };
  const col = await products();
  if (id) {
    if (!ObjectId.isValid(id)) return { error: "ID inválido" };
    await col.updateOne({ _id: new ObjectId(id) }, { $set: data });
    revalidatePath(`/producto/${id}`);
  } else {
    const last = await col.find().sort({ order: -1 }).limit(1).next();
    await col.insertOne({ ...data, order: (last?.order ?? -1) + 1 });
  }
  revalidatePath("/");
  return {};
}
export async function deleteProduct(id: string) {
  await guard();
  if (ObjectId.isValid(id)) await (await products()).deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/");
  revalidatePath(`/producto/${id}`);
}
export async function reorder(ids: string[]) {
  await guard();
  const valid = ids.filter((i) => ObjectId.isValid(i));
  await (await products()).bulkWrite(valid.map((id, order) => ({
    updateOne: { filter: { _id: new ObjectId(id) }, update: { $set: { order } } },
  })));
  revalidatePath("/");
}

// ---------- WhatsApp ----------
export async function saveWhatsapp(link: string): R {
  await guard();
  const w = String(link ?? "").trim().slice(0, 300);
  if (w && !/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(w))
    return { error: "El link debe ser de wa.me o api.whatsapp.com" };
  await (await settingsCol()).updateOne({ _id: "main" }, { $set: { whatsapp: w } }, { upsert: true });
  revalidatePath("/");
  return {};
}

// ---------- Imagen (Cloudinary) ----------
export async function uploadImage(fd: FormData): Promise<{ url?: string; error?: string }> {
  await guard();
  const file = fd.get("file");
  if (!(file instanceof File) || !TYPES[file.type] || file.size > 5 * 1024 * 1024)
    return { error: "Solo JPG, PNG o WEBP de máx. 5 MB" };

  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const folder = "bubu";
  const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", key!);
  body.append("timestamp", timestamp);
  body.append("folder", folder);
  body.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body });
  const data = await res.json();
  if (!res.ok) return { error: data?.error?.message ?? "Error al subir la imagen" };
  return { url: String(data.secure_url).replace("/upload/", "/upload/f_auto,q_auto,w_1000/") };
}