package com.snaptale.backend.match.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.snaptale.backend.match.entity.MatchLocation;

public interface MatchLocationRepository extends JpaRepository<MatchLocation, Long> {

}
