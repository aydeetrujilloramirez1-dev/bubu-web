import type { Metadata } from "next";
import "./globals.css";
import CartProvider from "@/components/CartProvider";
import Header from "@/components/Header";
import Socials from "@/components/Socials";
import { getWhatsapp } from "@/lib/data";

export const metadata: Metadata = {
  metadataBase: new URL("https://TUDOMINIO.com"), // reemplaza por tu dominio real cuando lo tengas
  title: "BUBU | Compra más barato que Temu",
  description: "BUBU - tienda online moderna y responsive.",
};
export const revalidate = 60;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const wa = await getWhatsapp();
  return (
    <html lang="es">
      <body>
        <CartProvider wa={wa}>
          <div className="bg-ink px-4 py-2 text-center text-xs font-bold text-white sm:text-sm">
            ✨ Ofertas especiales · Envíos a todo el Perú · Compra fácil y segura
          </div>
          <Header />
          {children}
          <footer className="mt-16 bg-[#211d23] px-5 py-8 text-xs text-[#8f8791]">
            <Socials className="mx-auto mb-5 max-w-[1220px]" />
            <div className="mx-auto flex max-w-[1220px] flex-col justify-between gap-3 sm:flex-row">
              <span>© 2026 BUBU. Todos los derechos reservados.</span>
              <span>Compra más barato que Temu 💗</span>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}