package com.snaptale.backend.user.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QUser is a Querydsl query type for User
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUser extends EntityPathBase<User> {

    private static final long serialVersionUID = 150556958L;

    public static final QUser user = new QUser("user");

    public final com.snaptale.backend.common.entity.QBaseEntity _super = new com.snaptale.backend.common.entity.QBaseEntity(this);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final NumberPath<Long> guestId = createNumber("guestId", Long.class);

    public final DateTimePath<java.time.LocalDateTime> lastSeen = createDateTime("lastSeen", java.time.LocalDateTime.class);

    public final StringPath linkedAccountId = createString("linkedAccountId");

    public final NumberPath<Integer> matchesPlayed = createNumber("matchesPlayed", Integer.class);

    public final StringPath nickname = createString("nickname");

    public final NumberPath<Integer> rankPoint = createNumber("rankPoint", Integer.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public final NumberPath<Integer> wins = createNumber("wins", Integer.class);

    public QUser(String variable) {
        super(User.class, forVariable(variable));
    }

    public QUser(Path<? extends User> path) {
        super(path.getType(), path.getMetadata());
    }

    public QUser(PathMetadata metadata) {
        super(User.class, metadata);
    }

}

