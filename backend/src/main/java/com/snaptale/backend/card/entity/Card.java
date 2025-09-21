package com.snaptale.backend.card.entity;

import com.snaptale.backend.card.model.CardUpdateReq;
import com.snaptale.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
//@Setter 이건 막아둘게요
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cards")
public class Card extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "card_id")
    private Long cardId;

    @Column(name = "name", length = 80, nullable = false, unique = true)
    private String name;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "cost", nullable = false)
    private Integer cost;

    @Column(name = "power", nullable = false)
    private Integer power;

    //진영(한국, 중국)
    @Column(name = "faction", length = 40)
    private String faction;

    //효과 설명(자연어)
    @Column(name = "effect_desc", columnDefinition = "TEXT")
    private String effectDesc;

    //todo 효과는 나중에 정해지면 어떻게 할지 알 수 있을 거 같다.

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    // 카드 정보 변경 메서드
    public void apply(CardUpdateReq req) {
        if (req.name() != null) this.name = req.name();
        if (req.imageUrl() != null) this.imageUrl = req.imageUrl();
        if (req.cost() != null) this.cost = req.cost();
        if (req.power() != null) this.power = req.power();
        if (req.faction() != null) this.faction = req.faction();
        if (req.effectDesc() != null) this.effectDesc = req.effectDesc();
        if (req.active() != null) this.isActive = req.active();
    }
}