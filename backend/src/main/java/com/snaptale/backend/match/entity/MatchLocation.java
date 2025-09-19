package com.snaptale.backend.match.entity;

import com.snaptale.backend.common.entity.BaseEntity;
import com.snaptale.backend.location.entity.Location;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "match_locations")
public class MatchLocation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @Column(name = "slot_index", nullable = false)
    private Integer slotIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "revealed_turn")
    private Integer revealedTurn;
}
