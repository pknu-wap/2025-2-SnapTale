package com.snaptale.backend.location.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.entity.MatchLocation;
import com.snaptale.backend.match.entity.MatchParticipant;
import com.snaptale.backend.match.entity.Play;
import com.snaptale.backend.match.repository.MatchLocationRepository;
import com.snaptale.backend.match.repository.MatchParticipantRepository;
import com.snaptale.backend.match.repository.PlayRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationEffectService {

    private final MatchLocationRepository matchLocationRepository;
    private final PlayRepository playRepository;
    private final MatchParticipantRepository matchParticipantRepository;

    private final Map<Long, LocationEffectHandler> handlerMap = new HashMap<>();

    @PostConstruct
    public void initializeHandlers() {
        registerHandler(1L, createLocationOneHandler());
    }

    public void registerHandler(Long locationId, LocationEffectHandler handler) {
        handlerMap.put(locationId, handler);
    }

    public void validatePlayRestriction(Long matchId, Integer slotIndex, MatchParticipant participant) {
        LocationEffectContext context = buildPlayContext(matchId, slotIndex, participant, null);
        handlerForLocation(context).validateRestriction(context);
    }

    public void handleOnPlay(Long matchId, Integer slotIndex, Play play, MatchParticipant participant) {
        LocationEffectContext context = buildPlayContext(matchId, slotIndex, participant, play);
        handlerForLocation(context).onPlay(context);
    }

    public void handleOnReveal(Long matchId, Integer slotIndex, Play play, MatchParticipant participant) {
        LocationEffectContext context = buildPlayContext(matchId, slotIndex, participant, play);
        handlerForLocation(context).onReveal(context);
    }

    public void handleTurnEnd(Long matchId, int turnCount) {
        List<MatchLocation> matchLocations = matchLocationRepository.findByMatchIdWithFetch(matchId);
        List<Play> plays = playRepository.findByMatch_MatchIdAndTurnCount(matchId, turnCount);
        List<MatchParticipant> participants = matchParticipantRepository.findByMatch_MatchId(matchId);

        for (MatchLocation matchLocation : matchLocations) {
            List<Play> slotPlays = plays.stream()
                    .filter(play -> play.getSlotIndex() != null && play.getSlotIndex().equals(matchLocation.getSlotIndex()))
                    .collect(Collectors.toList());

            LocationEffectContext context = LocationEffectContext.builder()
                    .match(matchLocation.getMatch())
                    .location(matchLocation.getLocation())
                    .matchLocation(matchLocation)
                    .slotIndex(matchLocation.getSlotIndex())
                    .slotPlays(slotPlays)
                    .participants(participants)
                    .turnCount(turnCount)
                    .build();

            handlerForLocation(context).onTurnEnd(context);
        }
    }

    private LocationEffectContext buildPlayContext(Long matchId, Integer slotIndex, MatchParticipant participant, Play play) {
        MatchLocation matchLocation = resolveMatchLocation(matchId, slotIndex);

        return LocationEffectContext.builder()
                .match(matchLocation.getMatch())
                .location(matchLocation.getLocation())
                .matchLocation(matchLocation)
                .participant(participant)
                .deckPreset(Optional.ofNullable(participant).map(MatchParticipant::getDeckPreset).orElse(null))
                .deckOrder(Optional.ofNullable(participant).map(MatchParticipant::getDeckOrder).orElse(null))
                .play(play)
                .slotIndex(slotIndex)
                .turnCount(Optional.ofNullable(play).map(Play::getTurnCount).orElse(matchLocation.getMatch().getTurnCount()))
                .build();
    }

    private MatchLocation resolveMatchLocation(Long matchId, Integer slotIndex) {
        return matchLocationRepository.findByMatchIdWithFetch(matchId).stream()
                .filter(matchLocation -> matchLocation.getSlotIndex().equals(slotIndex))
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("매치 지역을 찾을 수 없습니다: matchId={}, slotIndex={}", matchId, slotIndex);
                    return new BaseException(BaseResponseStatus.MATCH_LOCATION_NOT_FOUND);
                });
    }

    private LocationEffectHandler handlerForLocation(LocationEffectContext context) {
        Long locationId = context.getLocation() != null ? context.getLocation().getLocationId() : null;
        return handlerMap.getOrDefault(locationId, LocationEffectHandler.noop());
    }

    // location_id = 1인
    // 도쿄 타워 : 이 구역에 낸 카드는 50% 확률로 파워를 +4 또는 -2 합니다.
    // 효과를 처리하는 핸들러
    private LocationEffectHandler createLocationOneHandler() {
        return new LocationEffectHandler() {
            @Override
            public void onPlay(LocationEffectContext context) {
                Play play = context.getPlay();
                if (play == null) {
                    log.warn("Location onPlay 호출 시 play 가 null 입니다: matchId={}, slotIndex={}, participantGuestId={}",
                            context.getMatch().getMatchId(),
                            context.getSlotIndex(),
                            Optional.ofNullable(context.getParticipant()).map(MatchParticipant::getGuestId).orElse(null));
                    return;
                }

                int basePower = Optional.ofNullable(play.getPowerSnapshot()).orElse(0);
                int delta = ThreadLocalRandom.current().nextBoolean() ? 4 : -2;
                int updatedPower = basePower + delta;

                play.setPowerSnapshot(updatedPower);
                playRepository.save(play);

                log.info(
                        "Location#{} onPlay effect applied: matchId={}, slotIndex={}, guestId={}, cardId={}, delta={}, finalPower={}",
                        context.getLocation() != null ? context.getLocation().getLocationId() : null,
                        context.getMatch().getMatchId(),
                        context.getSlotIndex(),
                        play.getGuestId(),
                        play.getCard() != null ? play.getCard().getCardId() : null,
                        delta,
                        updatedPower);
            }
        };
    }
}