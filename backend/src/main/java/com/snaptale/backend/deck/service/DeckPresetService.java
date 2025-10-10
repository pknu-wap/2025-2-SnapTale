package com.snaptale.backend.deck.service;

import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.deck.entity.DeckPreset;
import com.snaptale.backend.deck.model.DeckPresetCreateReq;
import com.snaptale.backend.deck.model.DeckPresetRes;
import com.snaptale.backend.deck.model.DeckPresetUpdateReq;
import com.snaptale.backend.deck.repository.DeckPresetRepository;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeckPresetService {

    private final DeckPresetRepository deckPresetRepository;

    // 덱 프리셋 생성
    @Transactional
    public DeckPresetRes createDeckPreset(DeckPresetCreateReq request) {
        DeckPreset deckPreset = DeckPreset.builder()
                .name(request.name())
                .isActive(request.active())
                .build();
        deckPresetRepository.save(deckPreset);
        return DeckPresetRes.from(deckPresetRepository.save(deckPreset));
    }

    // 덱 프리셋 목록 조회
    public List<DeckPresetRes> getDeckPresets() {
        return deckPresetRepository.findAll().stream()
                .map(DeckPresetRes::from)
                .toList();
    }

    // 덱 프리셋 하나 조회
    public DeckPresetRes getDeckPreset(Long deckPresetId) {
        return deckPresetRepository.findById(deckPresetId)
                .map(DeckPresetRes::from)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.DECK_PRESET_NOT_FOUND));
    }

    // 덱 프리셋 수정
    @Transactional
    public DeckPresetRes updateDeckPreset(Long deckPresetId, DeckPresetUpdateReq request) {
        DeckPreset deckPreset = deckPresetRepository.findById(deckPresetId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.DECK_PRESET_NOT_FOUND));
        deckPreset.apply(request);
        deckPresetRepository.save(deckPreset);
        return DeckPresetRes.from(deckPreset);
    }

    // 덱 프리셋 삭제(뭐 삭제했는지 알려주기 위해 아이디 반환)
    @Transactional
    public Long deleteDeckPreset(Long deckPresetId) {
        DeckPreset deckPreset = deckPresetRepository.findById(deckPresetId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.DECK_PRESET_NOT_FOUND));
        deckPresetRepository.delete(deckPreset);
        return deckPresetId;
    }
}
