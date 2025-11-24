package com.snaptale.backend.location.service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
        registerHandler(2L, createLocationTwoHandler());
        // registerHandler(3L, createLocationTwoHandler()); // 경복궁 효과 수정
        registerHandler(4L, createLocationFourHandler());


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
    // 도쿄 타워 : 이 구역에 낸 카드는 50% 확률로 파워를 +4 또는 -4 합니다.
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
                int delta = ThreadLocalRandom.current().nextBoolean() ? 4 : -4;
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

    // location_id = 2인
    // 나가노 온천 : 턴 종료 시, 이 구역에 있는 카드의 파워가 1 증가합니다.
    // 효과를 처리하는 핸들러
    private LocationEffectHandler createLocationTwoHandler() {
        return new LocationEffectHandler() {
            @Override
            public void onTurnEnd(LocationEffectContext context) {
                Long matchId = Optional.ofNullable(context.getMatch())
                        .map(match -> match.getMatchId())
                        .orElse(null);
                Integer slotIndex = context.getSlotIndex();
                Integer turnCount = context.getTurnCount();

                if (matchId == null || slotIndex == null || turnCount == null) {
                    log.warn("Location#2 onTurnEnd 호출 시 필수 값이 누락되었습니다: matchId={}, slotIndex={}, turnCount={}",
                            matchId, slotIndex, turnCount);
                    return;
                }

                if (isLocationTurnEndLogged(matchId, turnCount, slotIndex)) {
                    log.info("Location#2 onTurnEnd 이미 처리됨: matchId={}, slotIndex={}, turnCount={}",
                            matchId, slotIndex, turnCount);
                    return;
                }

                List<Play> latestPlays = findLatestActivePlaysForSlot(matchId, slotIndex);

                if (!latestPlays.isEmpty()) {
                    latestPlays.forEach(play -> play.setPowerSnapshot(play.getPowerSnapshot() + 1));
                    playRepository.saveAll(latestPlays);

                    log.info("Location#2 onTurnEnd effect applied: matchId={}, slotIndex={}, affectedPlays={}",
                            matchId, slotIndex, latestPlays.size());
                } else {
                    log.info("Location#2 onTurnEnd 적용 대상 없음: matchId={}, slotIndex={}", matchId, slotIndex);
                }

                Play turnEndLog = Play.builder()
                        .match(context.getMatch())
                        .turnCount(turnCount)
                        .guestId(0L)
                        .slotIndex(slotIndex)
                        .isTurnEnd(true)
                        .build();

                playRepository.save(turnEndLog);
            }
        };
    }

    private boolean isLocationTurnEndLogged(Long matchId, int turnCount, Integer slotIndex) {
        return playRepository.findTurnEndsByMatchAndTurn(matchId, turnCount).stream()
                .anyMatch(play -> Boolean.TRUE.equals(play.getIsTurnEnd())
                        && Objects.equals(play.getGuestId(), 0L)
                        && Objects.equals(play.getSlotIndex(), slotIndex));
    }

    private List<Play> findLatestActivePlaysForSlot(Long matchId, Integer slotIndex) {
        Comparator<Play> recencyComparator = Comparator
                .comparing((Play p) -> Optional.ofNullable(p.getTurnCount()).orElse(0))
                .thenComparing(Play::getId);

        Map<String, Play> latestByGuestAndCard = new HashMap<>();

        for (Play play : playRepository.findByMatch_MatchId(matchId)) {
            if (Boolean.TRUE.equals(play.getIsTurnEnd())) {
                continue;
            }

            if (!Objects.equals(play.getSlotIndex(), slotIndex)) {
                continue;
            }

            Integer powerSnapshot = play.getPowerSnapshot();
            if (powerSnapshot == null || powerSnapshot <= 0) {
                continue;
            }

            if (play.getCard() == null || play.getCard().getCardId() == null) {
                continue;
            }

            String key = play.getGuestId() + ":" + play.getCard().getCardId();
            Play existing = latestByGuestAndCard.get(key);

            if (existing == null || recencyComparator.compare(play, existing) > 0) {
                latestByGuestAndCard.put(key, play);
            }
        }

        return List.copyOf(latestByGuestAndCard.values());
    }

    // location_id = 4인
    // 상하이 금융지구 : 이 구역에 카드를 내면, 다음 턴에 에너지를 추가로 1 얻습니다.
    // 효과를 처리하는 핸들러
    private LocationEffectHandler createLocationFourHandler() {
        return new LocationEffectHandler() {
            @Override
            public void onPlay(LocationEffectContext context) {
                MatchParticipant participant = context.getParticipant();

                if (participant == null) {
                    log.warn("Location#4 onPlay 호출 시 participant 가 null 입니다: matchId={}, slotIndex={}",
                            Optional.ofNullable(context.getMatch()).map(match -> match.getMatchId()).orElse(null),
                            context.getSlotIndex());
                    return;
                }

                int previousBonus = participant.getNextTurnEnergyBonus();
                int updatedBonus = previousBonus + 1;
                participant.setNextTurnEnergyBonus(updatedBonus);
                matchParticipantRepository.save(participant);

                log.info(
                        "Location#4 onPlay effect applied: matchId={}, slotIndex={}, guestId={}, previousBonus={}, updatedBonus={}",
                        Optional.ofNullable(context.getMatch()).map(match -> match.getMatchId()).orElse(null),
                        context.getSlotIndex(),
                        participant.getGuestId(),
                        previousBonus,
                        updatedBonus);
            }
        };
    }

}