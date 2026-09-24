"use client";
import Link from "next/link";
import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

export type Item = { id: string; title: string; price: number; image: string; qty: number };
const money = (n: number) => `S/ ${n.toFixed(2)}`;
export function waLink(wa: string, items: Item[]) {
  if (!wa || !items.length) return "#";
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const text = `Hola, quiero hacer este pedido:\n${items.map((i) => `• ${i.qty} x ${i.title} - ${money(i.price * i.qty)}`).join("\n")}\nTotal: ${money(total)}`;
  try { const u = new URL(wa); u.searchParams.set("text", text); return u.toString(); } catch { return "#"; }
}

type Ctx = { items: Item[]; count: number; total: number; wa: string;
  add: (p: Omit<Item, "qty">) => void; setQty: (id: string, q: number) => void; setOpen: (b: boolean) => void };
const C = createContext<Ctx>(null!);
export const useCart = () => useContext(C);

export default function CartProvider({ wa, children }: { wa: string; children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const ready = useRef(false);
  useEffect(() => {
    let saved: Item[] = [];
    try { saved = JSON.parse(localStorage.getItem("bubu_cart") || "[]"); } catch {}
    const t = setTimeout(() => { ready.current = true; setItems(saved); }, 0);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => { if (ready.current) localStorage.setItem("bubu_cart", JSON.stringify(items)); }, [items]);

  const add: Ctx["add"] = (p) => { setItems((c) => c.some((i) => i.id === p.id) ? c.map((i) => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...c, { ...p, qty: 1 }]); setOpen(true); };
  const setQty = (id: string, q: number) => setItems((c) => c.map((i) => i.id === id ? { ...i, qty: q } : i).filter((i) => i.qty > 0));
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <C.Provider value={{ items, count, total, wa, add, setQty, setOpen }}>
      {children}
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
          className="fixed bottom-4 right-4 z-30 grid size-14 place-items-center rounded-full bg-[#25d366] text-2xl text-white shadow-xl">💬</a>
      )}
      <div className={`fixed inset-0 z-50 bg-black/40 ${open ? "" : "hidden"}`} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <aside className="absolute right-0 top-0 flex h-full w-[min(430px,100%)] flex-col bg-white p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <h3 className="text-lg font-bold">Tu carrito 🛒</h3>
            <button className="icon-btn" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="flex-1 overflow-auto py-3">
            {!items.length && <p className="py-12 text-center text-muted">Tu carrito está vacío.</p>}
            {items.map((i) => (
              <div key={i.id} className="row grid-cols-[60px_1fr_auto]">
                {i.image ? <img src={i.image} alt={i.title} className="size-15 rounded-[10px] object-cover" /> : <div className="size-15 rounded-[10px] bg-pale" />}
                <div><strong className="block text-[13px]">{i.title}</strong><small className="font-extrabold text-pink-dark">{money(i.price)} × {i.qty}</small></div>
                <button className="cursor-pointer text-gray-400" onClick={() => setQty(i.id, 0)}>✕</button>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-line pt-4">
            <div className="flex justify-between text-xl font-black"><span>Total</span><span>{money(total)}</span></div>
            <Link href="/carrito" onClick={() => setOpen(false)} className="btn btn-secondary block">Ver carrito completo</Link>
            <a href={waLink(wa, items)} target="_blank" rel="noopener noreferrer" className="btn btn-primary block">Pedir todo por WhatsApp</a>
          </div>
        </aside>
      </div>
    </C.Provider>
  );
}
