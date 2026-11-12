import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Floor plans",
  description: "Floor-by-floor plans of the 130 one-bedroom hotel apartments at Serene Heights, Nathia Gali, with apartment numbers and areas.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
