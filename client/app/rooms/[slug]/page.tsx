import { Suspense } from "react";
import type { Metadata } from "next";
import { PageLoader } from "@/global/components/ui";
import RoomDetail from "./_components/RoomDetail";

const API_URL = process.env.API_URL || "http://localhost:4000";

// Per-apartment title/description/preview image for search engines and link sharing.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_URL}/api/v1/rooms/${encodeURIComponent(slug)}`, { next: { revalidate: 300 } });
    if (!res.ok) return { title: "Apartment" };
    const { data } = (await res.json()) as { data: { name: string; tagline: string; description: string; images: string[] } };
    return {
      title: data.name,
      description: `${data.tagline}. ${data.description}`.slice(0, 160),
      openGraph: { title: `${data.name} · Serene Heights Nathia Gali`, images: data.images[0] ? [data.images[0]] : undefined },
    };
  } catch {
    return { title: "Apartment" };
  }
}

export default function RoomDetailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RoomDetail />
    </Suspense>
  );
}
