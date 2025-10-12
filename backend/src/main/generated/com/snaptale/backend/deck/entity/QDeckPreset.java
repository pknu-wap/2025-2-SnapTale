package com.snaptale.backend.deck.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QDeckPreset is a Querydsl query type for DeckPreset
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QDeckPreset extends EntityPathBase<DeckPreset> {

    private static final long serialVersionUID = -1609197223L;

    public static final QDeckPreset deckPreset = new QDeckPreset("deckPreset");

    public final com.snaptale.backend.common.entity.QBaseEntity _super = new com.snaptale.backend.common.entity.QBaseEntity(this);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final ListPath<DeckPresetCard, QDeckPresetCard> deckPresetcards = this.<DeckPresetCard, QDeckPresetCard>createList("deckPresetcards", DeckPresetCard.class, QDeckPresetCard.class, PathInits.DIRECT2);

    public final NumberPath<Long> deckPresetId = createNumber("deckPresetId", Long.class);

    public final NumberPath<Integer> isActive = createNumber("isActive", Integer.class);

    public final StringPath name = createString("name");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public QDeckPreset(String variable) {
        super(DeckPreset.class, forVariable(variable));
    }

    public QDeckPreset(Path<? extends DeckPreset> path) {
        super(path.getType(), path.getMetadata());
    }

    public QDeckPreset(PathMetadata metadata) {
        super(DeckPreset.class, metadata);
    }

}

