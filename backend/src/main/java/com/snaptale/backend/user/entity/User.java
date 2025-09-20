package com.snaptale.backend.user.entity;

import com.snaptale.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
/**
 * 참고 : 지금은 따로 유저를 식별하지 않고 그냥 닉네임만 매번 입력해서 플레이하도록 합니다.
 * 따라서 guest_id는 GeneratedValue로 설정하였고 실제로 사용하는 필드는 guestId, nickname 뿐입니다.
 * 추후 쿠키 기반 사용자 식별 또는 로그인 도입 시 나머지 필드를 사용할 예정입니다.
 */
public class User extends BaseEntity {

    @Id
    @Column(name = "guest_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String guestId;

    @Column(name = "nickname", length = 50, nullable = false)
    private String nickname;

    @Column(name = "rank_point", nullable = false)
    private int rankPoint;

    @Column(name = "matches_played", nullable = false)
    private int matchesPlayed;

    @Column(name = "wins", nullable = false)
    private int wins;

    @Column(name = "last_seen")
    @UpdateTimestamp
    private LocalDateTime lastSeen;

    @Column(name = "linked_account_id")
    private String linkedAccountId;

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void touchLastSeen(LocalDateTime timestamp) {
        this.lastSeen = timestamp;
    }
}
