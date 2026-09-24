"use client";
import { useCart, waLink } from "@/components/CartProvider";

export default function CartPage() {
  const { items, total, wa, setQty } = useCart();
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h2 className="mb-4 text-3xl font-black">Tu carrito</h2>
      {!items.length && <p className="py-12 text-center text-muted">Tu carrito está vacío.</p>}
      {items.map((i) => (
        <div key={i.id} className="row grid-cols-[60px_1fr_auto_auto]">
          {i.image ? <img src={i.image} alt={i.title} className="size-15 rounded-[10px] object-cover" /> : <div className="size-15 rounded-[10px] bg-pale" />}
          <div><strong className="block text-sm">{i.title}</strong><small className="font-extrabold text-pink-dark">S/ {(i.price * i.qty).toFixed(2)}</small></div>
          <div className="flex items-center gap-2">
            <button className="icon-btn" onClick={() => setQty(i.id, i.qty - 1)}>−</button>
            <span className="w-5 text-center">{i.qty}</span>
            <button className="icon-btn" onClick={() => setQty(i.id, i.qty + 1)}>+</button>
          </div>
          <button className="cursor-pointer text-gray-400" onClick={() => setQty(i.id, 0)}>✕</button>
        </div>
      ))}
      {!!items.length && (
        <>
          <div className="my-5 flex justify-between text-xl font-black"><span>Total</span><span>S/ {total.toFixed(2)}</span></div>
          <a href={waLink(wa, items)} target="_blank" rel="noopener noreferrer" className="btn btn-primary block">Pedir todo esto por WhatsApp</a>
        </>
      )}
    </main>
  );
}
