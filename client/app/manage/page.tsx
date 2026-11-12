import type { Metadata } from "next";
import Link from "next/link";
import LookupForm from "./_components/LookupForm";

export const metadata: Metadata = { title: "Find your booking" };

export default function ManagePage() {
  return (
    <div className="container-page grid gap-10 py-14 lg:grid-cols-2">
      <div>
        <p className="eyebrow">Manage booking</p>
        <h1 className="mt-2 text-3xl font-medium sm:text-4xl">Find your booking</h1>
        <p className="mt-3 max-w-md text-zinc-600">
          Use the reference from your confirmation and the email you booked with to view details, print your confirmation or cancel.
        </p>
        <p className="mt-6 text-sm text-zinc-500">
          Booked with an account? <Link href="/login?next=/account" className="font-medium text-brand-700 underline">Sign in</Link> to see every booking.
        </p>
      </div>
      <LookupForm />
    </div>
  );
}
