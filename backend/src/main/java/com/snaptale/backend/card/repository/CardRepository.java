package com.snaptale.backend.card.repository;

import com.snaptale.backend.card.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardRepository extends JpaRepository<Card, Long> {
}
