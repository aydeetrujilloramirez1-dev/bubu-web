"use client";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/data";
import { useCart } from "./CartProvider";

const SORTS = [
  ["order", "Destacados"],
  ["asc", "Menor precio"],
  ["desc", "Mayor precio"],
];

export default function Store({ products, query = "" }: { products: Product[]; query?: string }) {
  const { add } = useCart();
  const [sort, setSort] = useState("order");

  // Los agotados siempre al final; dentro de cada grupo se aplica el orden elegido
  const list = [...products].sort(
    (a, b) =>
      Number(!!a.soldOut) - Number(!!b.soldOut) ||
      (sort === "asc" ? a.price - b.price : sort === "desc" ? b.price - a.price : a.order - b.order)
  );

  return (
    <section id="productos" className="wrap pt-12">
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Productos destacados</h2>
        {query && (
          <p className="mt-1 text-sm text-muted">
            Resultados para “{query}” ·{" "}
            <Link href="/#productos" className="font-bold text-pink-dark">Ver todo</Link>
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {SORTS.map(([k, t]) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-bold transition ${
                sort === k ? "border-pink bg-pink text-white" : "border-line bg-white text-muted hover:border-pink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {!list.length && <p className="py-12 text-center text-muted">No hay productos.</p>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {list.map((p) => (
          <article
            key={p.id}
            className="group overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-pink/10"
          >
            <div className="relative aspect-square overflow-hidden bg-[#f8f4f8]">
              <Link href={`/producto/${p.id}`} aria-label={p.title} className={`absolute inset-0 ${p.soldOut ? "opacity-60 grayscale" : ""}`}>
                {p.image && (
                  <img src={p.image} alt={p.title} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                )}
                {p.images[1] && !p.soldOut && (
                  <img src={p.images[1]} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" />
                )}
              </Link>

              {p.soldOut && (
                <span className="absolute right-2 top-2 z-10 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow sm:text-[11px]">
                  Agotado
                </span>
              )}

              <button
                aria-label={p.soldOut ? "Producto agotado" : "Agregar al carrito"}
                disabled={p.soldOut}
                onClick={() => add({ id: p.id, title: p.title, price: p.price, image: p.image })}
                className="absolute bottom-3 left-3 z-10 grid size-11 cursor-pointer place-items-center rounded-full bg-pink text-lg text-white shadow-lg shadow-pink/40 transition hover:scale-110 hover:bg-pink-dark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none disabled:hover:scale-100"
              >
                🛒
              </button>
            </div>

            <Link href={`/producto/${p.id}`} className="block p-3 sm:p-4">
              <h3 className="line-clamp-2 min-h-10 text-[13px] font-semibold leading-snug sm:text-[15px]">{p.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted sm:text-[13px]">{p.cardDescription}</p>
              <div className={`mt-3 text-lg font-black sm:text-xl ${p.soldOut ? "text-gray-400" : "text-pink-dark"}`}>
                S/ {p.price.toFixed(2)}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}