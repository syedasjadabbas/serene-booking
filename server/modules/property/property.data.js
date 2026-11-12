// Property content for Serene Heights Nathia Gali.
// Source: https://www.sereneheightsnathiagali.com/nathiagali (home, about, amenities, contact-us, floor-plans), Nov 2026.
// Items marked PLACEHOLDER are not on the official site and must be confirmed by management.

module.exports = {
  name: "Serene Heights Nathia Gali",
  brand: "Serene Heights Hotels & Resorts",
  established: 2017,
  tagline: "A haven in the highlands",
  headline: "Pakistan's first & largest winter resort",
  description:
    "A fully managed hotel-apartment resort at 7,906 ft in the Galiyat, beside PAF Airbase Nathia Gali. Fully furnished one-bedroom apartments with private balconies, a heated infinity pool, rooftop dining and 50+ resort facilities, two hours from Islamabad.",
  developer: "DM Consortium",
  altitudeFt: 7906,
  address: "1.5 KM, Kala Bagh Air Base Road, Nathia Gali, Khyber Pakhtunkhwa, Pakistan",
  mapsQuery: "Serene Heights, Kala Bagh Air Base Road, Nathia Gali", // swap for an exact pin when available
  contact: {
    phone: "042-111-111-744",
    whatsapp: "+92 300 8497999", // site's tel/WhatsApp links point to +92 321 4979447; confirm which is current
    headOffice: "DM Consortium, H. No. 71 C3 Gulberg III, Park View Lane, Lahore",
    social: {
      instagram: "https://www.instagram.com/sereneheightshotelsandresorts/",
      facebook: "https://www.facebook.com/sereneheightshotelsandresorts",
      linkedin: "https://www.linkedin.com/company/serene-heights-hotel-resort",
      youtube: "https://youtube.com/@sereneheightsnathiagali5573",
    },
  },
  distances: [
    { place: "PAF Airbase Nathia Gali", distance: "50 m" },
    { place: "Main Nathia Gali Road", distance: "1.5 km", drive: "3 min drive" },
    { place: "Main Bazar Nathia Gali", distance: "5 km", drive: "10 min drive" },
    { place: "Abbottabad city centre", distance: "35 km", drive: "50 min drive" },
    { place: "Islamabad", distance: "80 km", drive: "2 hr drive" },
  ],
  access: ["Murree Expressway", "Hazara Expressway", "Havelian Interchange"],
  policies: {
    checkIn: "From 2:00 PM", // PLACEHOLDER
    checkOut: "Until 12:00 PM", // PLACEHOLDER
    children: "Children of all ages are welcome. Children under 5 stay free using existing beds.", // PLACEHOLDER
    pets: "Pets are not allowed.", // PLACEHOLDER
    smoking: "Non-smoking apartments. Smoking is allowed in designated outdoor areas only.", // PLACEHOLDER
    id: "A valid CNIC or passport is required for every adult guest at check-in.", // PLACEHOLDER
    payment: "Pay at the property by cash or card. Online payment is coming soon.",
  },
  highlights: [
    { label: "Altitude", value: "7,906 ft" },
    { label: "Resort facilities", value: "50+" },
    { label: "Resort activities", value: "15+" },
    { label: "Front desk & concierge", value: "24/7" },
  ],
  amenities: [
    { key: "pool", name: "Heated infinity pool", group: "Wellness", description: "Heated year-round with lifeguard service and towels." },
    { key: "spa", name: "Sauna, jacuzzi & massage", group: "Wellness", description: "Steam room, sauna, jacuzzi and massage rooms." },
    { key: "gym", name: "Fitness gym", group: "Wellness" },
    { key: "restaurant", name: "Rooftop restaurant", group: "Dining", description: "Breakfast, lunch and dinner at 7,906 ft, plus room service." },
    { key: "roomService", name: "Room service", group: "Dining" },
    { key: "housekeeping", name: "Daily housekeeping & laundry", group: "Services" },
    { key: "concierge", name: "24/7 front desk & concierge", group: "Services", description: "Express check-in/out and luggage storage." },
    { key: "business", name: "Business & executive centre", group: "Services", description: "High-speed Wi-Fi and printing." },
    { key: "conference", name: "Conference room", group: "Events" },
    { key: "banquet", name: "Banquet hall", group: "Events" },
    { key: "lawn", name: "Dedicated lawn", group: "Events" },
    { key: "golf", name: "18-hole mini golf", group: "Activities" },
    { key: "zipline", name: "Zipline", group: "Activities" },
    { key: "climbing", name: "Rock climbing", group: "Activities" },
    { key: "archery", name: "Archery", group: "Activities" },
    { key: "shooting", name: "Air gun shooting range", group: "Activities" },
    { key: "telescope", name: "Refractor telescope stargazing", group: "Activities" },
    { key: "sports", name: "Sports room", group: "Activities", description: "Table tennis, snooker and video games." },
    { key: "heating", name: "Central & floor heating", group: "Comfort", description: "Italian-made central heating; heated floors in apartments and common areas." },
    { key: "power", name: "24/7 power backup", group: "Comfort" },
    { key: "parking", name: "Climate-controlled parking floor", group: "Comfort" },
    { key: "security", name: "24/7 CCTV & fire safety", group: "Comfort" },
    { key: "mosque", name: "Mosque", group: "Comfort" },
    { key: "wifi", name: "High-speed Wi-Fi", group: "Comfort" },
  ],
  // Official 3D renders and animation frames (Serene Heights Drive "3D Animation" folder).
  experiences: [
    { title: "Rooftop restaurant", image: "/images/dining/rooftop-restaurant.jpg" },
    { title: "Glass-roof pool", image: "/images/resort/glass-roof-pool.jpg" },
    { title: "Ski slope", image: "/images/activities/ski-slope.jpg" },
    { title: "Sky lounge", image: "/images/dining/sky-lounge.jpg" },
    { title: "Archery range", image: "/images/activities/archery.jpg" },
    { title: "Mini golf", image: "/images/activities/mini-golf.jpg" },
    { title: "Adventure park", image: "/images/activities/adventure-park.jpg" },
    { title: "Sunset terrace", image: "/images/dining/sunset-terrace.jpg" },
    { title: "Winter trails", image: "/images/activities/winter-trails.jpg" },
    { title: "Rooftop crown", image: "/images/resort/rooftop-crown.jpg" },
    { title: "Snowy slopes", image: "/images/activities/ski-slope-aerial.jpg" },
    { title: "Rooftop dining", image: "/images/dining/rooftop-dining-glass.jpg" },
  ],
  floors: [
    { key: "ground", label: "Ground floor", summary: "Banquet hall, two conference rooms and the main lift lobby.", plans: ["/images/floor-plans/ground-2.png"] },
    { key: "g1", label: "G1 floor", summary: "8 one-bedroom apartments (G-1 to G-8).", plans: ["/images/floor-plans/ground-1.png"] },
    { key: "1", label: "1st floor", summary: "16 one-bedroom apartments (101 to 116).", plans: ["/images/floor-plans/floor-1.png"] },
    { key: "2", label: "2nd floor", summary: "20 one-bedroom apartments (201 to 220).", plans: ["/images/floor-plans/floor-2.png"] },
    { key: "3", label: "3rd floor", summary: "22 one-bedroom apartments (301 to 322), including two corner suites.", plans: ["/images/floor-plans/floor-3.png"] },
    { key: "5", label: "5th floor", summary: "Hotel lobby and waiting area, restaurant, and 4 apartments (501 to 504).", plans: ["/images/floor-plans/floor-5.png"] },
    { key: "6", label: "6th floor", summary: "20 one-bedroom apartments (601 to 620).", plans: ["/images/floor-plans/floor-6.png"] },
    { key: "7", label: "7th floor", summary: "20 one-bedroom apartments (701 to 720).", plans: ["/images/floor-plans/floor-7.png"] },
    { key: "8", label: "8th floor", summary: "20 terrace apartments (801 to 820) with private terraces.", plans: ["/images/floor-plans/floor-8.png"] },
  ],
  // Official 3D renders. No apartment interior renders exist yet; add them here when available.
  gallery: [
    { src: "/images/resort/hero-tower-mist.jpg", alt: "Serene Heights tower rising above the pines and mist" },
    { src: "/images/resort/aerial-rooftop-pool.jpg", alt: "Aerial view with the glass-roof rooftop pool" },
    { src: "/images/resort/aerial-snow-resort.jpg", alt: "The resort and ski slope under snow" },
    { src: "/images/resort/glass-roof-pool.jpg", alt: "Glass-roof pool above the forest" },
    { src: "/images/dining/rooftop-restaurant.jpg", alt: "Rooftop restaurant with glass walls" },
    { src: "/images/resort/rooftop-sunset.jpg", alt: "Rooftop terraces at sunset" },
    { src: "/images/resort/tower-snow-night.jpg", alt: "The tower lit up on a snowy evening" },
    { src: "/images/activities/ski-slope.jpg", alt: "Ski slope beside the tower" },
  ],
};
