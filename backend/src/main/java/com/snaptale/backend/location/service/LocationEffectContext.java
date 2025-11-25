package com.snaptale.backend.location.service;

import java.util.Collections;
import java.util.List;

import com.snaptale.backend.deck.entity.DeckPreset;
import com.snaptale.backend.location.entity.Location;
import com.snaptale.backend.match.entity.Match;
import com.snaptale.backend.match.entity.MatchLocation;
import com.snaptale.backend.match.entity.MatchParticipant;
import com.snaptale.backend.match.entity.Play;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder(toBuilder = true)
public class LocationEffectContext {
    private final Match match;
    private final Location location;
    private final MatchLocation matchLocation;
    private final MatchParticipant participant;
    private final DeckPreset deckPreset;
    private final List<Long> deckOrder;
    private final Play play;
    private final List<Play> slotPlays;
    private final List<MatchParticipant> participants;
    private final Integer turnCount;
    private final Integer slotIndex;

    public List<Long> getDeckOrder() {
        return deckOrder == null ? Collections.emptyList() : deckOrder;
    }

    public List<Play> getSlotPlays() {
        return slotPlays == null ? Collections.emptyList() : slotPlays;
    }

    public List<MatchParticipant> getParticipants() {
        return participants == null ? Collections.emptyList() : participants;
    }
}