package com.snaptale.backend.location.entity;

import com.snaptale.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
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

    //자연어
    @Column(name = "effect_desc", columnDefinition = "TEXT")
    private String effectDesc;

    //json 추가 안 하나?=> 프엔쪽에서 그냥 하는 걸로

    @Column(name = "is_active", nullable = false)
    private boolean isActive;
}
