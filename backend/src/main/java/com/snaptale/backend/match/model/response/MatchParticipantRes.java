package com.snaptale.backend.match.model.response;

import com.snaptale.backend.deck.entity.DeckPreset;
import com.snaptale.backend.match.entity.Match;
import com.snaptale.backend.match.entity.MatchParticipant;

public record MatchParticipantRes(
        Long matchParticipantId,
        Integer finalScore,
        Integer playerIndex,
        DeckPreset deckPreset,
        Match match) {
    public static MatchParticipantRes from(MatchParticipant matchParticipant) {
        return new MatchParticipantRes(matchParticipant.getId(),
                matchParticipant.getFinalScore(),
                matchParticipant.getPlayerIndex(),
                matchParticipant.getDeckPreset(),
                matchParticipant.getMatch());
    }
}
