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
