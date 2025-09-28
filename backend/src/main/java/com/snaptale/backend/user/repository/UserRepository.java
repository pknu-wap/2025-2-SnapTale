package com.snaptale.backend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.snaptale.backend.user.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

}
