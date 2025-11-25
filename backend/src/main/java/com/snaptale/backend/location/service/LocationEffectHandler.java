package com.snaptale.backend.location.service;

public interface LocationEffectHandler {

    default void validateRestriction(LocationEffectContext context) {
        // 기본 구현은 아무 제약이 없습니다.
    }

    default void onPlay(LocationEffectContext context) {
        // 기본 구현은 아무 작업도 수행하지 않습니다.
    }

    default void onReveal(LocationEffectContext context) {
        // 기본 구현은 아무 작업도 수행하지 않습니다.
    }

    default void onTurnEnd(LocationEffectContext context) {
        // 기본 구현은 아무 작업도 수행하지 않습니다.
    }

    static LocationEffectHandler noop() {
        return new LocationEffectHandler() {
        };
    }
}