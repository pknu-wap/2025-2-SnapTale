package com.snaptale.backend.match.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPlay is a Querydsl query type for Play
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPlay extends EntityPathBase<Play> {

    private static final long serialVersionUID = -2033617525L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPlay play = new QPlay("play");

    public final com.snaptale.backend.common.entity.QBaseEntity _super = new com.snaptale.backend.common.entity.QBaseEntity(this);

    public final com.snaptale.backend.card.entity.QCard card;

    public final NumberPath<Integer> cardPosition = createNumber("cardPosition", Integer.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final NumberPath<Long> guestId = createNumber("guestId", Long.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final BooleanPath isTurnEnd = createBoolean("isTurnEnd");

    public final QMatch match;

    public final NumberPath<Integer> powerSnapshot = createNumber("powerSnapshot", Integer.class);

    public final NumberPath<Integer> slotIndex = createNumber("slotIndex", Integer.class);

    public final NumberPath<Integer> turnCount = createNumber("turnCount", Integer.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public QPlay(String variable) {
        this(Play.class, forVariable(variable), INITS);
    }

    public QPlay(Path<? extends Play> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPlay(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPlay(PathMetadata metadata, PathInits inits) {
        this(Play.class, metadata, inits);
    }

    public QPlay(Class<? extends Play> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.card = inits.isInitialized("card") ? new com.snaptale.backend.card.entity.QCard(forProperty("card")) : null;
        this.match = inits.isInitialized("match") ? new QMatch(forProperty("match")) : null;
    }

}

