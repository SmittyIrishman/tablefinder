export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { lat, lng } = await req.json();
    const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

    const searchTerms = [
      "tabletop game store",
      "hobby game shop",
      "trading card game store",
      "board game store",
      "comic book game store",
    ];

    const locationRestriction = {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 50000.0
      }
    };

    const results = await Promise.all(
      searchTerms.map(term =>
        fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY!,
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.id,places.googleMapsUri",
          },
          body: JSON.stringify({ textQuery: term, maxResultCount: 10, locationBias: locationRestriction })
        }).then(r => r.json())
      )
    );

    // Combine and deduplicate by place id
    const seen = new Set<string>();
    const places: any[] = [];
    results.forEach(r => {
      (r.places || []).forEach((p: any) => {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          places.push(p);
        }
      });
    });

    // Sort by rating
    places.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return new Response(JSON.stringify({ places }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
