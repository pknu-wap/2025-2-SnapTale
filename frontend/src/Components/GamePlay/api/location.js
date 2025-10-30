export async function fetchLocations() {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE}/api/locations`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }

  return res.json();
}