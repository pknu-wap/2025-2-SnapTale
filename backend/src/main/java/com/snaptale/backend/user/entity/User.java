package com.snaptale.backend.user.entity;

import com.snaptale.backend.common.entity.BaseEntity;
import com.snaptale.backend.user.model.UserUpdateReq;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
// 참고 : 지금은 따로 유저를 식별하지 않고 그냥 닉네임만 매번 입력해서 플레이하도록 합니다.
// 따라서 guest_id는 GeneratedValue로 설정하였고 실제로 사용하는 필드는 guestId, nickname 뿐입니다.
// 추후 쿠키 기반 사용자 식별 또는 로그인 도입 시 나머지 필드를 사용할 예정입니다.
public class User extends BaseEntity {

    @Id
    @Column(name = "guest_id")
    // String은 @GeneratedValue(strategy = GenerationType.IDENTITY) 이걸 쓸 수 없다.
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long guestId;

    @Column(name = "nickname", length = 50, nullable = false)
    private String nickname;

    @Column(name = "rank_point", nullable = false)
    private Integer rankPoint;

    @Column(name = "matches_played", nullable = false)
    private Integer matchesPlayed;

    @Column(name = "wins", nullable = false)
    private Integer wins;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;

    @Column(name = "linked_account_id")
    private String linkedAccountId;

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    // 유저의 마지막 접속 시간을 현재 시간으로 업데이트
    public void touchLastSeen() {
        this.lastSeen = LocalDateTime.now();
    }

    // 유저의 마지막 접속 시간을 특정 시간으로 업데이트
    public void touchLastSeen(LocalDateTime timestamp) {
        this.lastSeen = timestamp;
    }

    public void apply(UserUpdateReq request) {
        if (request.nickname() != null) {
            this.nickname = request.nickname();
        }
        if (request.rankPoint() != null) {
            this.rankPoint = request.rankPoint();
        }
        if (request.matchesPlayed() != null) {
            this.matchesPlayed = request.matchesPlayed();
        }
        if (request.wins() != null) {
            this.wins = request.wins();
        }
        if (request.lastSeen() != null) {
            this.lastSeen = request.lastSeen();
        }
    }
}
