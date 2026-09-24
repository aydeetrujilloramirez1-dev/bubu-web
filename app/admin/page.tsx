"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/data";
import { loadAdmin, saveProduct, deleteProduct, reorder, uploadImage, logout } from "./actions";

const empty = { title: "", cardDescription: "", description: "", features: "", price: "", metaTitle: "", metaDescription: "" };
type Form = typeof empty;
const L = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <label className="grid gap-1 text-sm font-semibold text-[#4e4550]">{t}{children}</label>
);

export default function Admin() {
  const router = useRouter();
  const [list, setList] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [f, setF] = useState<Form>(empty);
  const [imgs, setImgs] = useState<string[]>([]);
  const [soldOut, setSoldOut] = useState(false);
  const [editId, setEditId] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => setList((await loadAdmin()).products);
  useEffect(() => { loadAdmin().then((d) => setList(d.products)); }, []);
  const toast = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };
  const inp = (k: keyof Form) => ({
    value: f[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value }),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? list.filter((p) => p.title.toLowerCase().includes(q)) : list;
  }, [list, search]);

  const openNew = () => { setF(empty); setImgs([]); setSoldOut(false); setEditId(""); setOpen(true); };
  const edit = (p: Product) => {
    setF({
      title: p.title, cardDescription: p.cardDescription, description: p.description,
      features: p.features.join("\n"), price: String(p.price), metaTitle: p.metaTitle, metaDescription: p.metaDescription,
    });
    setImgs(p.images); setSoldOut(!!p.soldOut); setEditId(p.id); setOpen(true);
  };

  async function upload(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData(); fd.append("file", file);
      const r = await uploadImage(fd);
      if (r.url) urls.push(r.url); else toast(r.error ?? "Error al subir");
    }
    setImgs((x) => [...x, ...urls].slice(0, 8));
    setBusy(false);
  }
  const moveImg = (i: number, d: number) => setImgs((a) => {
    const b = [...a], j = i + d;
    if (j < 0 || j >= b.length) return a;
    [b[i], b[j]] = [b[j], b[i]];
    return b;
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const r = await saveProduct(editId, { ...f, features: f.features.split("\n"), images: imgs, soldOut });
    if (r.error) return toast(r.error);
    setOpen(false); toast("Producto guardado ✔"); load();
  }

  // Mueve el producto en la posición `i` a la posición `pos` (1-indexado, como lo escribe el usuario)
  async function moveTo(i: number, pos: number) {
    if (!pos || pos < 1 || pos > list.length || pos === i + 1) return;
    const a = [...list];
    const [item] = a.splice(i, 1);
    a.splice(pos - 1, 0, item);
    setList(a);
    await reorder(a.map((p) => p.id));
  }
  async function move(i: number, d: number) {
    const a = [...list], j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    setList(a);
    await reorder(a.map((p) => p.id));
  }

  const avg = list.length ? list.reduce((s, p) => s + p.price, 0) / list.length : 0;
  const stats = [
    ["📦", "Productos", String(list.length)],
    ["🟢", "Disponibles", String(list.filter((p) => !p.soldOut).length)],
    ["🔴", "Agotados", String(list.filter((p) => p.soldOut).length)],
    ["💰", "Precio promedio", `S/ ${avg.toFixed(2)}`],
  ];

  return (
    <div className="min-h-screen bg-[#faf6fa]">
      <div className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <h1 className="text-xl font-black">BUBU <span className="text-pink">Admin</span></h1>
          <div className="flex gap-2">
            <Link href="/" target="_blank" className="btn btn-secondary !py-2 text-sm">Ver tienda ↗</Link>
            <button className="btn btn-primary !py-2 text-sm" onClick={openNew}>+ Nuevo producto</button>
            <button className="btn btn-secondary !py-2 text-sm" onClick={async () => { await logout(); router.push("/admin/login"); }}>Salir</button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(([i, t, v]) => (
            <div key={t} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 sm:p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-pale text-xl">{i}</span>
              <div><small className="text-muted">{t}</small><div className="text-xl font-black sm:text-2xl">{v}</div></div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Tus productos</h2>
            <p className="text-sm text-muted">
              El número de la izquierda es su posición en la portada. Escribe un número nuevo para moverlo directo, o usa ◀ ▶. Los agotados siempre van al final.
            </p>
          </div>
          <input
            className="fld max-w-xs"
            placeholder="🔍 Buscar producto para editar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {!list.length && (
          <div className="rounded-2xl border border-dashed border-pink-soft bg-white p-12 text-center text-muted">
            Aún no hay productos. Presiona “+ Nuevo producto”.
          </div>
        )}
        {!!list.length && !filtered.length && (
          <div className="rounded-2xl border border-dashed border-pink-soft bg-white p-12 text-center text-muted">
            Ningún producto coincide con “{search}”.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => {
            const i = list.findIndex((x) => x.id === p.id); // posición real, para reordenar aunque esté filtrado
            return (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                <div className="relative aspect-square bg-pale">
                  {p.image && <img src={p.image} alt="" className={`size-full object-cover ${p.soldOut ? "opacity-60 grayscale" : ""}`} />}
                  <input
                    type="number"
                    min={1}
                    max={list.length}
                    defaultValue={i + 1}
                    key={`${p.id}-${i}`}
                    onBlur={(e) => { const v = Number(e.target.value); moveTo(i, v); }}
                    onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                    className="absolute left-2 top-2 h-7 w-12 rounded-lg border-0 bg-ink px-1 text-center text-xs font-bold text-white outline-none focus:ring-2 focus:ring-pink"
                    aria-label="Posición en la portada"
                  />
                  {p.images.length > 1 && (
                    <span className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold">🖼 {p.images.length}</span>
                  )}
                  {p.soldOut && (
                    <span className="absolute bottom-2 left-2 rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white">AGOTADO</span>
                  )}
                </div>
                <div className="p-3">
                  <div className="line-clamp-1 text-sm font-bold">{p.title}</div>
                  <div className="font-black text-pink-dark">S/ {p.price.toFixed(2)}</div>
                  <div className="mt-3 flex justify-between">
                    <button className="icon-btn" onClick={() => move(i, -1)} aria-label="Mover antes">◀</button>
                    <button className="icon-btn" onClick={() => move(i, 1)} aria-label="Mover después">▶</button>
                    <button className="icon-btn" onClick={() => edit(p)} aria-label="Editar">✎</button>
                    <button
                      className="icon-btn"
                      aria-label="Eliminar"
                      onClick={async () => { if (confirm("¿Eliminar producto?")) { await deleteProduct(p.id); load(); } }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <form onSubmit={save} className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-5">
              <h3 className="text-lg font-black">{editId ? "Editar producto" : "Nuevo producto"}</h3>
              <button type="button" className="icon-btn" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="grid flex-1 content-start gap-4 overflow-auto p-5">
              <div>
                <div className="mb-2 text-sm font-semibold text-[#4e4550]">
                  Imágenes (máx. 8) — la primera es la principal y la meta imagen
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {imgs.map((src, i) => (
                    <div key={src} className="relative aspect-square overflow-hidden rounded-xl border border-line">
                      <img src={src} alt="" className="size-full object-cover" />
                      {i === 0 && <span className="absolute left-1 top-1 rounded bg-pink px-1.5 text-[10px] font-bold text-white">Principal</span>}
                      <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 px-1 text-xs text-white">
                        <button type="button" onClick={() => moveImg(i, -1)}>◀</button>
                        <button type="button" onClick={() => setImgs((a) => a.filter((_, n) => n !== i))}>✕</button>
                        <button type="button" onClick={() => moveImg(i, 1)}>▶</button>
                      </div>
                    </div>
                  ))}
                  <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-pink-soft text-center text-xs font-bold text-pink-dark hover:bg-pale">
                    {busy ? "Subiendo…" : "+ Agregar"}
                    <input
                      type="file" multiple hidden accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => { upload(e.target.files); e.target.value = ""; }}
                    />
                  </label>
                </div>
              </div>

              <L t="Título / nombre"><input className="fld" required {...inp("title")} /></L>
              <L t="Precio (S/)"><input className="fld" type="number" step="0.01" min="0" required {...inp("price")} /></L>

              <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${soldOut ? "border-red-300 bg-red-50" : "border-line bg-white"}`}>
                <span>
                  <strong className="block text-sm">{soldOut ? "🔴 Agotado" : "🟢 Disponible"}</strong>
                  <small className="text-muted">
                    {soldOut ? "Se muestra “Agotado” y pasa al final de la portada" : "El cliente puede comprarlo"}
                  </small>
                </span>
                <input type="checkbox" checked={soldOut} onChange={(e) => setSoldOut(e.target.checked)} className="size-5 accent-red-600" />
              </label>

              <L t="Descripción para tarjeta"><input className="fld" maxLength={200} {...inp("cardDescription")} /></L>
              <L t="Descripción"><textarea className="fld" rows={4} {...inp("description")} /></L>
              <L t="Características (una por línea)"><textarea className="fld" rows={4} {...inp("features")} /></L>
              <L t="Meta título (SEO)"><input className="fld" maxLength={70} {...inp("metaTitle")} /></L>
              <L t="Meta descripción (SEO)"><input className="fld" maxLength={160} {...inp("metaDescription")} /></L>
            </div>

            <div className="border-t border-line p-5">
              <button className="btn btn-primary block w-full" disabled={busy}>
                {editId ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>
          </form>
        </div>
      )}

      {msg && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white shadow-xl">
          {msg}
        </div>
      )}
    </div>
  );
}