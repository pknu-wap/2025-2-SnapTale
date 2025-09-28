package com.snaptale.backend.match.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.snaptale.backend.match.entity.MatchParticipant;

public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, Long> {

}
