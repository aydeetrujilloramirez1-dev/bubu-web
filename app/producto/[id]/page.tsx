import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/data";
import ProductView from "@/components/ProductView";
export const revalidate = 60;
type P = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await getProduct((await params).id);
  if (!p) return {};
  const title = p.metaTitle || p.title;
  const description = p.metaDescription || p.cardDescription || p.title;
  return {
    title,
    description,
    openGraph: {
      title, description, type: "website",
      images: p.metaImage ? [{ url: p.metaImage, width: 1000, height: 1000, alt: p.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title, description,
      images: p.metaImage ? [p.metaImage] : [],
    },
  };
}

export default async function Page({ params }: P) {
  const p = await getProduct((await params).id);
  if (!p) notFound();
  return <ProductView p={p} />;
}