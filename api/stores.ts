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

  const { lat, lng } = await req.json();
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

  const response = await fetch(
    `https://places.googleapis.com/v1/places:searchNearby`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY!,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.regularOpeningHours,places.id,places.googleMapsUri",
      },

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
