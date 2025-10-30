const API_BASE = import.meta.env.VITE_API_BASE;

async function parseJson(res) {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.result ?? data;
}

export async function fetchDeckPreset(deckPresetId) {
  const res = await fetch(`${API_BASE}/api/deck-presets/${deckPresetId}`);
  return parseJson(res);
}

export async function fetchDeckPresetCards(deckPresetId) {
  const res = await fetch(
    `${API_BASE}/api/deck-preset-cards/deck/${deckPresetId}`,
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
