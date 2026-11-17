import EraHero from "./_components/EraHero";
import EraArch from "./_components/EraArch";
import EraConcept from "./_components/EraConcept";
import EraPlace from "./_components/EraPlace";
import EraResidences from "./_components/EraResidences";
import EraSpace from "./_components/EraSpace";
import EraArchitecture from "./_components/EraArchitecture";
import EraFacts from "./_components/EraFacts";
import EraCta from "./_components/EraCta";

import { isPastStay, parseStay } from "@/global/lib/stay";
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Editorial home page: full-screen hero with a season switch, the sky arch with three reasons, the concept,
// the location, the apartment slider, the space, the architecture, the facts and a closing booking panel.
export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  // Dates and guests can arrive in the URL (?checkIn&checkOut&adults…), e.g. from the Serene Heights Group
  // site's "Check availability" form; pre-fill the hero search with them. Past or invalid dates are ignored.
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(raw)) if (typeof v === "string") params.set(k, v);
  const parsed = parseStay(params);
  const initial = parsed && !isPastStay(parsed) ? parsed : null;

  return (
    <>
      <EraHero initial={initial} />
      <EraArch />
      <EraConcept />
      <EraPlace />
      <EraResidences />
      <EraSpace />
      <EraArchitecture />
      <EraFacts />
      <EraCta />
    </>
  );
}
