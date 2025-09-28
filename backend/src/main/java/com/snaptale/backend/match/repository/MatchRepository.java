package com.snaptale.backend.match.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.snaptale.backend.match.entity.Match;

public interface MatchRepository extends JpaRepository<Match, Long> {

}
