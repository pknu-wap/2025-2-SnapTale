package com.snaptale.backend.user.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snaptale.backend.user.repository.UserRepository;
import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.user.entity.User;
import com.snaptale.backend.user.model.UserCreateReq;
import com.snaptale.backend.user.model.UserRes;
import com.snaptale.backend.user.model.UserUpdateReq;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;

    // 유저 조회
    public UserRes getUser(Long userId) {
        return userRepository.findById(userId)
                .map(UserRes::from)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));
    }

    // 유저 목록 조회
    public List<UserRes> getUsers() {
        return userRepository.findAll().stream()
                .map(UserRes::from)
                .toList();
    }

    // 유저 생성
    @Transactional
    public UserRes createUser(UserCreateReq request) {
        User user = User.builder()
                .nickname(request.nickname())
                .rankPoint(0)
                .matchesPlayed(0)
                .wins(0)
                .lastSeen(LocalDateTime.now())
                .build();
        userRepository.save(user);
        return UserRes.from(user);
    }

    // 유저 수정
    @Transactional
    public UserRes updateUser(Long userId, UserUpdateReq request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));
        user.apply(request);
        userRepository.save(user);
        return UserRes.from(user);
    }

    // 유저 삭제
    @Transactional
    public Long deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));
        userRepository.delete(user);
        return userId;
    }

    // 유저의 마지막 접속 시간을 현재 시간으로 업데이트
    @Transactional
    public UserRes updateLastSeen(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));
        user.touchLastSeen();
        userRepository.save(user);

        return UserRes.from(user);
    }
}
