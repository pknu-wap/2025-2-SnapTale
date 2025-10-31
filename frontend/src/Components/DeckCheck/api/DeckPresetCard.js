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

// export async function fetchCardsAll() {
//   const res = await fetch(
//     `${import.meta.env.VITE_API_BASE}/api/cards`,
//     {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   if (!res.ok) {
//     const body = await res.text();
//     throw new Error(`HTTP ${res.status}: ${body}`);
//   }

//   const data = await res.json();
//   const result = data.result;
  
//   return result;
// }

export const updateSelectedDeck = async (userId, deckPresetId) => {
  const url = `${import.meta.env.VITE_API_BASE}/api/users/${userId}/selected-deck`;

  const body = {
    deckPresetId: deckPresetId,
  };

  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body), // JavaScript 객체를 JSON 문자열로 변환
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    return data;
  } catch (error) {

    console.error("덱 선택 API 실패:", error);
    throw error;
  }
};