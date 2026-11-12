import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Amenities & experiences",
  description: "Heated glass-roof pool, rooftop restaurant, ski slope, spa, zipline, mini golf and 50+ resort facilities at Serene Heights, Nathia Gali.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
