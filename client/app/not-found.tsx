import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[50vh] place-items-center py-16 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-3xl font-medium">This page took a different trail</h1>
        <p className="mt-2 text-zinc-500">The page you&apos;re looking for doesn&apos;t exist.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="btn-primary">Home</Link>
          <Link href="/rooms" className="btn-secondary">Find an apartment</Link>
        </div>
      </div>
    </div>
  );
}
