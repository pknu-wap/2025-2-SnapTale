-- =============================================
-- SnapTale 목 데이터 SQL 스크립트
-- =============================================

-- 사용자 데이터 삽입
INSERT INTO users (nickname, rank_point, matches_played, wins, last_seen, linked_account_id, created_at, updated_at) VALUES
('플레이어1', 1000, 5, 3, NOW(), NULL, NOW(), NOW()),
('플레이어2', 1200, 8, 6, DATEADD('HOUR', -1, NOW()), NULL, NOW(), NOW()),
('고수플레이어', 1800, 20, 18, DATEADD('MINUTE', -30, NOW()), NULL, NOW(), NOW()),
('초보자', 800, 2, 0, DATEADD('DAY', -1, NOW()), NULL, NOW(), NOW()),
('테스터', 1500, 10, 7, NOW(), NULL, NOW(), NOW());

-- 카드 데이터 삽입
INSERT INTO cards (name, image_url, cost, power, faction, effect_desc, is_active, created_at, updated_at) VALUES
-- 한국 카드 (1-12)
('을지문덕', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_dhw31q.png', 3, 1, '한국', '모든 지역 +1 파워', true, NOW(), NOW()),
('이순신', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_cgrdlb.png', 3, 6, '한국', '상대 지역의 모든 중국, 일본 카드의 파워 -1', true, NOW(), NOW()),
('주몽', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_bhd60l.png', 2, 2, '한국', '해당 지역 제외 모든 지역 +1 파워', true, NOW(), NOW()),
('선덕여왕', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_mlxezs.png', 3, 3, '한국', '해당 지역 +3 파워', true, NOW(), NOW()),
('강감찬', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_tz0724.png', 4, 4, '한국', '해당 지역의 상대 지역 -5 파워', true, NOW(), NOW()),
('연개소문', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_vz9wus.png', 6, 5, '한국', '해당 지역 제외 모든 지역 x2 파워', true, NOW(), NOW()),
('홍길동', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_vz9wus.png', 6, 5, '한국', '홍길동 효과', true, NOW(), NOW()),
('전우치', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_vz9wus.png', 6, 5, '한국', '전우치 효과', true, NOW(), NOW()),
('장보고', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_vz9wus.png', 6, 5, '한국', '장보고 효과', true, NOW(), NOW()),
('세종대왕', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_vz9wus.png', 6, 5, '한국', '세종대왕 효과', true, NOW(), NOW()),
('안중근', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_twk6qo.jpg', 6, 5, '한국', '안중근 효과', true, NOW(), NOW()),
('김동석', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_t4decw.jpg', 6, 5, '한국', '김동석 효과', true, NOW(), NOW()),
-- 중국 카드 (13-24)
('관우', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_fjzmsx.png', 4, 1, '중국', '해당 지역 +1 파워', true, NOW(), NOW()),
('조조', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_atmhrv.png', 5, 2, '중국', '해당 지역 +2 파워', true, NOW(), NOW()),
('제갈량', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_dkb8co.png', 10, 5, '중국', '모든 중국 카드들의 파워 +1', true, NOW(), NOW()),
('유비', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_dkb8co.png', 10, 5, '중국', '유비 효과', true, NOW(), NOW()),
('동탁', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_dkb8co.png', 10, 5, '중국', '동탁 효과', true, NOW(), NOW()),
('사마의', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_dkb8co.png', 10, 5, '중국', '사마의 효과', true, NOW(), NOW()),
('여포', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_dkb8co.png', 10, 5, '중국', '여포 효과', true, NOW(), NOW()),
('손권', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_dkb8co.png', 10, 5, '중국', '손권 효과', true, NOW(), NOW()),
('초선', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_dkb8co.png', 10, 5, '중국', '초선 효과', true, NOW(), NOW()),
('황월영', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_dkb8co.png', 10, 5, '중국', '황월영 효과', true, NOW(), NOW()),
('당 태종', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_zcinx1.jpg', 10, 5, '중국', '당 태종 효과', true, NOW(), NOW()),
('진시황', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_hn2ief.jpg', 10, 5, '중국', '진시황 효과', true, NOW(), NOW()),
-- 일본 카드 (25-36)
('아마테라스', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_qtrxtj.png', 8, 3, '일본', '아마테라스 효과', true, NOW(), NOW()),
('스사노오', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_emixis.png', 3, 4, '스사노오', '스사노오 효과', true, NOW(), NOW()),
('츠쿠요미', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_uhs1wx.png', 5, 6, '일본', '츠쿠요미', true, NOW(), NOW()),
('유키온나', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_qtrxtj.png', 8, 3, '일본', '유키온나 효과', true, NOW(), NOW()),
('오니', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_emixis.png', 3, 4, '스사노오', '오니 효과', true, NOW(), NOW()),
('텐구', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_uhs1wx.png', 5, 6, '일본', '텐구 효과', true, NOW(), NOW()),
('키츠네', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_qtrxtj.png', 8, 3, '일본', '키츠네 효과', true, NOW(), NOW()),
('카파', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_emixis.png', 3, 4, '스사노오', '카파 효과', true, NOW(), NOW()),
('마네키네코', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_uhs1wx.png', 5, 6, '일본', '마네키네코 효과', true, NOW(), NOW()),
('오다 노부나가', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_jhczqd.jpg', 10, 5, '일본', '오다 노부나가 효과', true, NOW(), NOW()),
('도쿠가와 이에야스', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_ixyxv4.jpg', 10, 5, '일본', '도쿠가와 이에야스 효과', true, NOW(), NOW()),
('쿠치사케온나', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_uhs1wx.png', 5, 6, '일본', '쿠치사케온나 효과', true, NOW(), NOW());


-- 위치 데이터 삽입
INSERT INTO locations (name, image_url, effect_desc, is_active, created_at, updated_at) VALUES
('한국의 궁궐', 'https://example.com/korean_palace.jpg', '한국 진영 카드들의 공격력 +1', true, NOW(), NOW()),
('중국의 만리장성', 'https://example.com/great_wall.jpg', '중국 진영 카드들의 방어력 +1', true, NOW(), NOW()),
('전쟁터', 'https://example.com/battlefield.jpg', '모든 카드의 비용 -1', true, NOW(), NOW()),
('신비의 숲', 'https://example.com/mystic_forest.jpg', '마법 카드의 효과 +50%', true, NOW(), NOW()),
('바다의 항구', 'https://example.com/sea_port.jpg', '카드 드로우 +1', true, NOW(), NOW()),
('산의 정상', 'https://example.com/mountain_peak.jpg', '고비용 카드들의 효과 +1', true, NOW(), NOW()),
('사막의 오아시스', 'https://example.com/desert_oasis.jpg', '체력 회복 효과 +100%', true, NOW(), NOW());

-- 덱 프리셋 데이터 삽입
INSERT INTO deck_presets (name, is_active, created_at, updated_at) VALUES
('한국 덱', 1, NOW(), NOW()),
('중국 덱', 1, NOW(), NOW()),
('일본 덱', 1, NOW(), NOW());

-- 덱 프리셋 카드 데이터 삽입 (각 덱 12장씩, 중복 카드 없음)
INSERT INTO deck_preset_cards (deck_preset_id, card_id, created_at, updated_at) VALUES
-- 한국 덱 (덱 ID: 1) - 12장
(1, 1, NOW(), NOW()),   -- 을지문덕
(1, 2, NOW(), NOW()),   -- 이순신
(1, 3, NOW(), NOW()),   -- 주몽
(1, 4, NOW(), NOW()),   -- 선덕여왕
(1, 5, NOW(), NOW()),   -- 강감찬
(1, 6, NOW(), NOW()),   -- 연개소문
(1, 7, NOW(), NOW()),   -- 홍길동
(1, 8, NOW(), NOW()),   -- 전우치
(1, 9, NOW(), NOW()),   -- 장보고
(1, 10, NOW(), NOW()),  -- 세종대왕
(1, 11, NOW(), NOW()),  -- 안중근
(1, 12, NOW(), NOW()),  -- 김동석
-- 중국 덱 (덱 ID: 2) - 12장
(2, 13, NOW(), NOW()),  -- 관우
(2, 14, NOW(), NOW()),  -- 조조
(2, 15, NOW(), NOW()),  -- 제갈량
(2, 16, NOW(), NOW()),  -- 유비
(2, 17, NOW(), NOW()),  -- 동탁
(2, 18, NOW(), NOW()),  -- 사마의
(2, 19, NOW(), NOW()),  -- 여포
(2, 20, NOW(), NOW()),  -- 손권
(2, 21, NOW(), NOW()),  -- 초선
(2, 22, NOW(), NOW()),  -- 황월영
(2, 23, NOW(), NOW()),  -- 당 태종
(2, 24, NOW(), NOW()),  -- 진시황
-- 일본 덱 (덱 ID: 3) - 12장
(3, 25, NOW(), NOW()),  -- 아마테라스
(3, 26, NOW(), NOW()),  -- 스사노오
(3, 27, NOW(), NOW()),  -- 츠쿠요미
(3, 28, NOW(), NOW()),  -- 유키온나
(3, 29, NOW(), NOW()),  -- 오니
(3, 30, NOW(), NOW()),  -- 텐구
(3, 31, NOW(), NOW()),  -- 키츠네
(3, 32, NOW(), NOW()),  -- 카파
(3, 33, NOW(), NOW()),  -- 마네키네코
(3, 34, NOW(), NOW()),  -- 오다 노부나가
(3, 35, NOW(), NOW()),  -- 도쿠가와 이에야스
(3, 36, NOW(), NOW());  -- 쿠치사케온나

-- 매치 데이터 삽입
INSERT INTO matches (status, winner_id, turn_count, ended_at, created_at, updated_at) VALUES
('PLAYING', NULL, 5, NULL, NOW(), NOW()),
('ENDED', 1, 12, DATEADD('HOUR', -2, NOW()), NOW(), NOW()),
('QUEUED', NULL, 0, NULL, NOW(), NOW()),
('ENDED', 2, 8, DATEADD('DAY', -1, NOW()), NOW(), NOW());

-- 매치 참가자 데이터 삽입
INSERT INTO match_participants (match_id, guest_id, player_index, deck_preset_id, created_at, updated_at) VALUES
(1, 1, 0, 1, NOW(), NOW()),
(1, 2, 1, 2, NOW(), NOW()),
(2, 1, 0, 1, NOW(), NOW()),
(2, 2, 1, 2, NOW(), NOW()),
(3, 3, 0, 3, NOW(), NOW()),
(3, 4, 1, 4, NOW(), NOW()),
(4, 2, 0, 2, NOW(), NOW()),
(4, 3, 1, 3, NOW(), NOW());

-- 매치 위치 데이터 삽입 (각 매치는 3개의 Location 슬롯 필요)
INSERT INTO match_locations (match_id, slot_index, location_id, revealed_turn, created_at, updated_at) VALUES
(1, 0, 1, 1, NOW(), NOW()),
(1, 1, 2, 1, NOW(), NOW()),
(1, 2, 3, 1, NOW(), NOW()),
(2, 0, 4, 1, NOW(), NOW()),
(2, 1, 5, 1, NOW(), NOW()),
(2, 2, 6, 1, NOW(), NOW()),
(3, 0, 1, 1, NOW(), NOW()),
(3, 1, 2, 1, NOW(), NOW()),
(3, 2, 3, 1, NOW(), NOW()),
(4, 0, 4, 1, NOW(), NOW()),
(4, 1, 5, 1, NOW(), NOW()),
(4, 2, 6, 1, NOW(), NOW());

-- 플레이 데이터 삽입 (slot_index는 0, 1, 2만 사용)
INSERT INTO plays (match_id, turn_count, guest_id, card_id, slot_index, power_snapshot, created_at, updated_at) VALUES
-- 매치 1, 턴 1
(1, 1, 1, 1, 0, 1, NOW(), NOW()),  -- 플레이어1이 슬롯0에 을지문덕 배치
(1, 1, 2, 2, 1, 6, NOW(), NOW()),  -- 플레이어2가 슬롯1에 이순신 배치
-- 매치 1, 턴 2
(1, 2, 1, 3, 1, 2, NOW(), NOW()),  -- 플레이어1이 슬롯1에 주몽 배치
(1, 2, 2, 4, 2, 3, NOW(), NOW()),  -- 플레이어2가 슬롯2에 선덕여왕 배치
-- 매치 1, 턴 3
(1, 3, 1, 5, 0, 4, NOW(), NOW()),  -- 플레이어1이 슬롯0에 강감찬 배치
(1, 3, 2, 6, 1, 5, NOW(), NOW()),  -- 플레이어2가 슬롯1에 연개소문 배치
-- 매치 1, 턴 4
(1, 4, 1, 7, 2, 5, NOW(), NOW()),  -- 플레이어1이 슬롯2에 홍길동 배치
(1, 4, 2, 8, 0, 5, NOW(), NOW()),  -- 플레이어2가 슬롯0에 전우치 배치
-- 매치 1, 턴 5
(1, 5, 1, 9, 1, 5, NOW(), NOW()),  -- 플레이어1이 슬롯1에 장보고 배치
(1, 5, 2, 10, 2, 5, NOW(), NOW()); -- 플레이어2가 슬롯2에 세종대왕 배치
