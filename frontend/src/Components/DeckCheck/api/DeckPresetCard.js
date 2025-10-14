export async function fetchDeckPresetCards(deckPresetId) {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE}/api/deck-preset-cards/deck/${deckPresetId}`,
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

export async function fetchCardsAll() {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE}/api/cards`,
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
  const result = data.result;
  
  return result;
}