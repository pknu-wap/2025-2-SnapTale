package com.snaptale.backend.location.entity;

import com.snaptale.backend.common.entity.BaseEntity;
import com.snaptale.backend.location.model.LocationUpdateReq;

import jakarta.persistence.*;
import lombok.*;

@Getter
// @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "locations")
public class Location extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "name", length = 80, nullable = false)
    private String name;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    // 자연어
    @Column(name = "effect_desc", columnDefinition = "TEXT")
    private String effectDesc;

    // json 추가 안 하나?=> 프엔쪽에서 그냥 하는 걸로

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    public void apply(LocationUpdateReq request) {
        if (request.name() != null) {
            this.name = request.name();
        }
        if (request.imageUrl() != null) {
            this.imageUrl = request.imageUrl();
        }
        if (request.effectDesc() != null) {
            this.effectDesc = request.effectDesc();
        }
        if (request.active() != null) {
            this.isActive = request.active();
        }
    }
}
