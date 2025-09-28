package com.snaptale.backend.match.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.snaptale.backend.match.entity.Play;

public interface PlayRepository extends JpaRepository<Play, Long> {

}
