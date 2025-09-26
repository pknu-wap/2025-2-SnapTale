package com.snaptale.backend.match.entity;

import com.snaptale.backend.common.entity.BaseEntity;
import com.snaptale.backend.match.model.request.MatchUpdateReq;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "matches")
public class Match extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "match_id")
    private Long matchId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private MatchStatus status;

    @Column(name = "winner_id", length = 36)
    private String winnerId;

    @Column(name = "turn_count", nullable = false)
    private Integer turnCount;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Builder.Default
    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<MatchParticipant> participants = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<MatchLocation> locations = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Play> plays = new ArrayList<>();

    public void addParticipant(MatchParticipant participant) {
        participants.add(participant);
        participant.setMatch(this);
    }

    public void addLocation(MatchLocation location) {
        locations.add(location);
        location.setMatch(this);
    }

    public void addPlay(Play play) {
        plays.add(play);
        play.setMatch(this);
    }

    public void apply(MatchUpdateReq request) {
        if (request.status() != null) {
            this.status = request.status();
        }
        if (request.winnerId() != null) {
            this.winnerId = request.winnerId();
        }
        if (request.turnCount() != null) {
            this.turnCount = request.turnCount();
        }
        if (request.endedAt() != null) {
            this.endedAt = request.endedAt();
        }
    }
}
