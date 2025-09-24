package com.snaptale.backend.location.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.snaptale.backend.location.entity.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {

}
