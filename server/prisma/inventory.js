// Apartment inventory transcribed from the official floor plans
// (https://www.sereneheightsnathiagali.com/nathiagali/floor-plans/floors). Areas in sq ft as printed.
// Every unit is a one-bedroom apartment: bedroom, sitting room with kitchenette, bathroom, balcony
// (8th floor: private terrace). The site has no 4th-floor plan. 5th-floor units have no printed areas.

const floors = [
  { floor: 0, label: "G1 floor", prefix: "G-", areas: [771, 574, 593, 593, 481, 544, 501, 674], numbers: (i) => `G-${i + 1}` },
  { floor: 1, label: "1st floor", areas: [771, 573, 593, 594, 480, 544, 501, 627, 666, 673, 681, 739, 770, 681, 621, 744] },
  { floor: 2, label: "2nd floor", areas: [771, 573, 593, 594, 480, 544, 501, 627, 667, 674, 680, 691, 673, 734, 727, 671, 720, 681, 621, 744] },
  { floor: 3, label: "3rd floor", areas: [771, 572, 593, 594, 480, 544, 501, 629, 666, 672, 681, 690, 673, 734, 923, 993, 727, 671, 720, 681, 621, 744] },
  // 5th floor: same layouts as 101, 102, 115, 116 respectively, so typed by layout; areas not printed.
  { floor: 5, label: "5th floor", areas: [null, null, null, null], typeOverride: ["grand-one-bedroom", "classic-one-bedroom", "premier-one-bedroom", "grand-one-bedroom"] },
  { floor: 6, label: "6th floor", areas: [770, 573, 593, 544, 480, 544, 501, 627, 666, 673, 680, 693, 673, 791, 784, 671, 720, 681, 621, 744] },
  { floor: 7, label: "7th floor", areas: [766, 574, 593, 593, 480, 544, 501, 627, 664, 673, 679, 693, 671, 849, 840, 671, 720, 679, 621, 743] },
  { floor: 8, label: "8th floor", areas: [854, 620, 631, 604, 510, 626, 501, 640, 680, 689, 696, 709, 684, 983, 969, 684, 737, 696, 641, 733], terrace: true },
];

function classify(area, floor) {
  if (floor.terrace) return "terrace-apartment";
  if (area >= 800) return "signature-corner-suite";
  if (area >= 700) return "grand-one-bedroom";
  if (area >= 600) return "premier-one-bedroom";
  return "classic-one-bedroom";
}

const apartments = floors.flatMap((f) =>
  f.areas.map((areaSqft, i) => ({
    number: f.numbers ? f.numbers(i) : `${f.floor}${String(i + 1).padStart(2, "0")}`,
    floor: f.floor,
    floorLabel: f.label,
    areaSqft,
    outdoorSpace: f.terrace ? "Private terrace" : "Private balcony",
    roomTypeSlug: f.typeOverride ? f.typeOverride[i] : classify(areaSqft, f),
  }))
);

module.exports = { apartments };
