import { useEffect } from "react";

export default function useMatchWebSocket({
  matchId,
  user,
  subscribe,
  setIsWaitingForOpponent,
  setTurn,
  setEnergy,
  setMyPowers,
  setOpponentPowers,
  setOpponentBoardLanes,
  setGameEndModalState,
}) {
  useEffect(() => {
    if (!matchId) {
      return undefined;
    }

    const destination = `/topic/match/${matchId}`;
    const subscriptionKey = `game-layout-match-${matchId}`;

    const unsubscribe = subscribe(destination, {
      key: subscriptionKey,
      onMessage: (entry) => {
        const body = entry?.body;
        if (!body?.success) {
          return;
        }

        const wsMessage = body.data;
        const messageType = wsMessage?.type;
        const payload = wsMessage?.data;

        if (!messageType) {
          return;
        }

        if (messageType === "GAME_END") {
          const gameState = payload;

          setGameEndModalState({
            isOpen: true,
            detail: gameState?.lastPlayInfo || "",
          });
          return;
        }

        if (!payload) {
          return;
        }

        if (messageType === "LEAVE") {
          // 상대방 퇴장 로그만 처리 (GAME_END 따로 옴)
        }

        if (messageType === "TURN_WAITING") {
          const endedGuestId = payload?.endedGuestId;
          const waitingForOpponent = Boolean(payload?.waitingForOpponent);

          if (endedGuestId === user?.guestId && waitingForOpponent) {
            setIsWaitingForOpponent(true);
          } else if (!waitingForOpponent) {
            setIsWaitingForOpponent(false);
          } else if (endedGuestId !== user?.guestId) {
            setIsWaitingForOpponent(false);
          }

          const scores = payload?.gameState?.participantScores;
          if (Array.isArray(scores)) {
            const myParticipantId = user?.participantId;
            const myGuestId = user?.guestId;
            const meScore = scores.find(
              (score) =>
                score.participantId === myParticipantId || score.guestId === myGuestId
            );
            if (meScore && typeof meScore.energy === "number") {
              setEnergy(meScore.energy);
            }
          }
        }

        if (messageType === "TURN_START") {
          setIsWaitingForOpponent(false);

          if (typeof payload?.currentTurn === "number") {
            setTurn(payload.currentTurn);
          }

          const scores = payload?.gameState?.participantScores;
          if (Array.isArray(scores)) {
            const myParticipantId = user?.participantId;
            const myGuestId = user?.guestId;
            const meScore = scores.find(
              (score) =>
                score.participantId === myParticipantId || score.guestId === myGuestId
            );
            if (meScore && typeof meScore.energy === "number") {
              setEnergy(meScore.energy);
            }
          }
          if (payload?.locationPowerResult) {
            const normalizePowers = (source) => {
              if (Array.isArray(source)) {
                return source.map((value) => Number(value) || 0);
              }
              if (source && typeof source === "object") {
                return [0, 1, 2].map((idx) => Number(source[idx]) || 0);
              }
              return null;
            };
            const myGuestId = user?.guestId;
            const { player1Id, player2Id, player1Powers, player2Powers } =
              payload.locationPowerResult;

            if (myGuestId && player1Id && player2Id) {
              if (myGuestId === player1Id) {
                const myLocationPowers = normalizePowers(player1Powers);
                const opponentLocationPowers = normalizePowers(player2Powers);
                if (myLocationPowers) setMyPowers(myLocationPowers);
                if (opponentLocationPowers) setOpponentPowers(opponentLocationPowers);
              } else if (myGuestId === player2Id) {
                const myLocationPowers = normalizePowers(player2Powers);
                const opponentLocationPowers = normalizePowers(player1Powers);
                if (myLocationPowers) setMyPowers(myLocationPowers);
                if (opponentLocationPowers) setOpponentPowers(opponentLocationPowers);
              }
            }
          }

          if (payload?.playerCardPlays) {
            const myGuestId = user?.guestId;
            const allGuestIds = Object.keys(payload.playerCardPlays).map((id) =>
              parseInt(id)
            );
            const opponentGuestId = allGuestIds.find((id) => id !== myGuestId);

            if (opponentGuestId) {
              const opponentCards = payload.playerCardPlays[opponentGuestId];
              const cardsByLocation = [
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
              ];

              if (Array.isArray(opponentCards)) {
                opponentCards.forEach((card) => {
                  if (card.slotIndex !== null && card.slotIndex !== undefined) {
                    const locationIndex = card.slotIndex;
                    const position =
                      card.position !== null && card.position !== undefined
                        ? card.position
                        : 0;
                    if (
                      locationIndex >= 0 &&
                      locationIndex < 3 &&
                      position >= 0 &&
                      position < 4
                    ) {
                      cardsByLocation[locationIndex][position] = {
                        cardId: card.cardId,
                        name: card.cardName,
                        imageUrl: card.cardImageUrl,
                        cost: card.cost,
                        power: card.power,
                        faction: card.faction,
                      };
                    }
                  }
                });
              }
              setOpponentBoardLanes(cardsByLocation);
            }
          }
        }
      },
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, subscribe, user?.guestId, user?.participantId]);
}


