package com.snaptale.backend.deck.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QDeckPresetCard is a Querydsl query type for DeckPresetCard
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QDeckPresetCard extends EntityPathBase<DeckPresetCard> {

    private static final long serialVersionUID = -22596599L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QDeckPresetCard deckPresetCard = new QDeckPresetCard("deckPresetCard");

    public final com.snaptale.backend.common.entity.QBaseEntity _super = new com.snaptale.backend.common.entity.QBaseEntity(this);

    public final com.snaptale.backend.card.entity.QCard card;

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final QDeckPreset deckPreset;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public QDeckPresetCard(String variable) {
        this(DeckPresetCard.class, forVariable(variable), INITS);
    }

    public QDeckPresetCard(Path<? extends DeckPresetCard> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QDeckPresetCard(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QDeckPresetCard(PathMetadata metadata, PathInits inits) {
        this(DeckPresetCard.class, metadata, inits);
    }

    public QDeckPresetCard(Class<? extends DeckPresetCard> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.card = inits.isInitialized("card") ? new com.snaptale.backend.card.entity.QCard(forProperty("card")) : null;
        this.deckPreset = inits.isInitialized("deckPreset") ? new QDeckPreset(forProperty("deckPreset")) : null;
    }

}

