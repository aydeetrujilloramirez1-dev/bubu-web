import Store from "@/components/Store";
import { getProducts } from "@/lib/data";
export const revalidate = 60;

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = q.trim().toLowerCase();
  const all = await getProducts();
  const products = term ? all.filter((p) => p.title.toLowerCase().includes(term)) : all;

  return (
    <main>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_80%_20%,rgba(0,232,245,.13),transparent_30%),radial-gradient(circle_at_10%_70%,rgba(228,100,211,.13),transparent_30%)] px-5 py-12 sm:py-20">
        <div className="mx-auto grid max-w-[1220px] items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f0d9ed] bg-white px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-pink-dark">
              <i className="size-1.5 rounded-full bg-[#00e8f5]" /> Tu nueva tienda favorita
            </span>
            <h1 className="my-4 max-w-[700px] text-5xl font-black leading-[.98] tracking-tighter sm:text-7xl">
              Compra bonito.<br /><span className="text-pink">Compra inteligente.</span>
            </h1>
            <p className="mb-7 max-w-xl text-lg leading-relaxed text-muted">
              Descubre productos prácticos, modernos y a precios increíbles.
            </p>
            <a href="#productos" className="btn btn-primary">Ver productos →</a>
          </div>

          {/* Decoración: solo desde pantallas grandes */}
          <div className="relative hidden aspect-square lg:block">
            <div className="absolute right-0 top-4 size-56 rounded-full bg-gradient-to-br from-pink to-pink-soft opacity-90" />
            <div className="absolute left-6 top-24 size-24 rounded-full border-8 border-[#00e8f5]/40" />
            <div className="absolute bottom-10 left-0 size-32 rotate-12 rounded-3xl bg-pale" />
            <div className="absolute bottom-24 right-10 size-16 rotate-45 rounded-xl bg-ink/90" />
            <svg viewBox="0 0 200 200" className="absolute inset-0 m-auto size-64 drop-shadow-[0_20px_35px_rgba(112,55,108,0.18)]">
              <rect x="40" y="70" width="120" height="100" rx="18" fill="#ffffff" stroke="#eee5ee" strokeWidth="2" />
              <path d="M70 70 V52 a30 30 0 0 1 60 0 V70" fill="none" stroke="#e464d3" strokeWidth="8" strokeLinecap="round" />
              <circle cx="100" cy="120" r="10" fill="#e464d3" />
              <path d="M85 120 h30" stroke="#fff1fb" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      <div className="border-b border-line">
        <div className="wrap grid grid-cols-2 gap-4 py-5 md:grid-cols-4">
          {[
            ["🚚", "Envíos rápidos", "A todo el Perú"],
            ["🔒", "Compra segura", "Protegemos tus datos"],
            ["💬", "Pedido por WhatsApp", "Atención directa"],
            ["💗", "Precios bajos", "Ofertas cada semana"],
          ].map(([i, t, s]) => (
            <div key={t} className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-pale text-lg">{i}</span>
              <div>
                <strong className="block text-sm">{t}</strong>
                <small className="text-muted">{s}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Store products={products} query={q} />
    </main>
  );
}
