"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaShoppingCart, FaSearch } from "react-icons/fa";
import { useCart } from "./CartProvider";
import Socials from "./Socials";

export default function Header() {
  const { count, setOpen } = useCart();
  const router = useRouter();
  const [q, setQ] = useState("");

  function search(e: React.FormEvent) {
    e.preventDefault();
    const t = q.trim();
    router.push(t ? `/?q=${encodeURIComponent(t)}#productos` : "/#productos");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <nav className="wrap grid min-h-[64px] grid-cols-[auto_1fr_auto] items-center gap-3 py-2 sm:min-h-[80px] md:gap-8">
        <Link href="/" className="shrink-0">
          <img src="/bubu.png" alt="BUBU" className="h-12 w-auto object-contain sm:h-20 md:h-24" />
        </Link>

        <form onSubmit={search} className="relative min-w-0">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar productos…"
            aria-label="Buscar productos"
            className="w-full min-w-0 rounded-full border border-[#e7dce7] bg-white py-2.5 pl-4 pr-11 text-sm outline-none transition focus:border-pink focus:ring-4 focus:ring-pink/10 sm:py-3 sm:pl-5 sm:pr-14 sm:text-base"
          />
          <button
            aria-label="Buscar"
            className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-pink text-white hover:bg-pink-dark sm:right-1.5 sm:size-9"
          >
            <FaSearch size={13} />
          </button>
        </form>

        <div className="flex items-center gap-2 justify-self-end">
          <Socials className="hidden md:flex" />
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir carrito"
            className="relative flex cursor-pointer items-center gap-2 rounded-full bg-pale p-2.5 font-bold text-pink-dark transition hover:bg-pink hover:text-white sm:px-3.5"
          >
            <FaShoppingCart size={18} />
            <span className="hidden lg:inline">Carrito</span>
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-ink px-1 text-[11px] text-white">
              {count}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}