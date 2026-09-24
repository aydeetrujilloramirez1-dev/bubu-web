"use client";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/data";
import { useCart } from "./CartProvider";

export default function ProductView({ p }: { p: Product }) {
  const { add, wa } = useCart();
  const [i, setI] = useState(0);
  const item = { id: p.id, title: p.title, price: p.price, image: p.image };
  const text = `Hola, estoy interesado en este producto: ${p.title} (S/ ${p.price.toFixed(2)})`;
  return (
    <main className="wrap py-8">
      <Link href="/#productos" className="text-sm font-bold text-pink-dark">← Volver a productos</Link>
      <div className="mt-5 grid gap-8 md:grid-cols-2">
        <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-[#f8f4f8]">
            {p.images[i] && <img src={p.images[i]} alt={p.title} className={`size-full object-cover ${p.soldOut ? "opacity-70 grayscale" : ""}`} />}
            {p.soldOut && (
              <span className="absolute right-3 top-3 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-black uppercase tracking-wide text-white shadow-lg">
                Agotado
              </span>
            )}
          </div>
          {p.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {p.images.map((src, n) => (
                <button key={src} onClick={() => setI(n)}
                  className={`size-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 ${n === i ? "border-pink" : "border-line"}`}>
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{p.title}</h1>
          <p className="mt-2 text-muted">{p.cardDescription}</p>
          <div className="my-5 text-4xl font-black text-pink-dark">S/ {p.price.toFixed(2)}</div>
                    {p.soldOut ? (
            <div className="rounded-xl bg-red-50 p-4 text-center font-bold text-red-600">
              Producto agotado por el momento
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <button className="btn btn-primary" onClick={() => add(item)}>🛒 Agregar al carrito</button>
              <a className="btn bg-[#25d366] text-white" target="_blank" rel="noopener noreferrer"
                href={`${wa}?text=${encodeURIComponent(text)}`}>💬 Pedir por WhatsApp</a>
            </div>
          )}
          {!!p.features.length && (
            <ul className="mt-7 grid gap-2 rounded-2xl bg-pale p-5">
              {p.features.map((c) => <li key={c} className="flex gap-2 text-sm"><span className="text-pink-dark">✔</span>{c}</li>)}
            </ul>
          )}
          {p.description && <p className="mt-6 whitespace-pre-line leading-relaxed text-[#4e4550]">{p.description}</p>}
        </div>
      </div>
    </main>
  );
}