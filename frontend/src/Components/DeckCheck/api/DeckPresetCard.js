export async function fetchDeckPresetCards(deckPresetId) {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE}/api/deck-preset-cards/${deckPresetId}`,
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

  const data = await res.json();
  const result = [data.result]; //배열로 주고 있다면 [] 빼야함

  return result;
}