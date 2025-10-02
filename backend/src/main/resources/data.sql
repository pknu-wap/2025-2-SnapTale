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
('한국 전사', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_dhw31q.png', 3, 1, '한국', '모든 지역 +1 파워', true, NOW(), NOW()),
('중국 마법사', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_xruhcs.png', 4, 1, '중국', '해당 지역 +1 파워', true, NOW(), NOW()),
('한국 궁수', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_bhd60l.png', 2, 2, '한국', '해당 지역 제외 모든 지역 +1 파워', true, NOW(), NOW()),
('중국 기사', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_qmebbq.png', 5, 2, '중국', '해당 지역 +2 파워', true, NOW(), NOW()),
('한국 치료사', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_koccre.png', 3, 3, '한국', '해당 지역 +3 파워', true, NOW(), NOW()),
('일본 용', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_r1z9ty.png', 8, 3, '일본', '모든 지역 +1 파워', true, NOW(), NOW()),
('한국 수도승', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_unlqzs.png', 4, 4, '한국', '해당 지역의 상대 지역 -5 파워', true, NOW(), NOW()),
('일본 닌자', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_vtoxfg.png', 3, 4, '일본', '해당 지역 x2 파워', true, NOW(), NOW()),
('한국 궁수장', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_s04iz3.png', 6, 5, '한국', '해당 지역 제외 모든 지역 x2 파워', true, NOW(), NOW()),
('중국 황제', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_kgsxkg.png', 10, 5, '중국', '모든 중국 카드들의 파워 +1', true, NOW(), NOW()),
('한국 이순신', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_cgrdlb.png', 3, 6, '한국', '상대 지역의 모든 중국, 일본 카드의 파워 -1', true, NOW(), NOW()),
('일본 사무라이', 'https://res.cloudinary.com/dj5q9i82i/image/upload/unnamed_zw7pul.png', 5, 6, '일본', '상대 지역의 파워 -5', true, NOW(), NOW());

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
('기본 덱', 1, NOW(), NOW()),
('공격형 덱', 1, NOW(), NOW()),
('방어형 덱', 1, NOW(), NOW()),
('균형형 덱', 1, NOW(), NOW());

-- 덱 프리셋 카드 데이터 삽입
INSERT INTO deck_preset_cards (deck_preset_id, card_id, quantity, created_at, updated_at) VALUES
-- 기본 덱 (덱 프리셋 ID: 1)
(1, 1, 2, NOW(), NOW()),  -- 한국 전사 2장
(1, 3, 2, NOW(), NOW()),  -- 한국 궁수 2장
(1, 5, 1, NOW(), NOW()),  -- 한국 치료사 1장
(1, 2, 2, NOW(), NOW()),  -- 중국 마법사 2장
(1, 4, 1, NOW(), NOW()),  -- 중국 기사 1장
-- 공격형 덱 (덱 프리셋 ID: 2)
(2, 1, 3, NOW(), NOW()),  -- 한국 전사 3장
(2, 3, 3, NOW(), NOW()),  -- 한국 궁수 3장
(2, 8, 2, NOW(), NOW()),  -- 중국 암살자 2장
(2, 2, 1, NOW(), NOW()),  -- 중국 마법사 1장
(2, 9, 1, NOW(), NOW()),  -- 한국 궁수장 1장
-- 방어형 덱 (덱 프리셋 ID: 3)
(3, 5, 3, NOW(), NOW()),  -- 한국 치료사 3장
(3, 7, 2, NOW(), NOW()),  -- 한국 수도승 2장
(3, 4, 2, NOW(), NOW()),  -- 중국 기사 2장
(3, 2, 2, NOW(), NOW()),  -- 중국 마법사 2장
(3, 1, 1, NOW(), NOW()),  -- 한국 전사 1장
-- 균형형 덱 (덱 프리셋 ID: 4)
(4, 1, 2, NOW(), NOW()),  -- 한국 전사 2장
(4, 3, 2, NOW(), NOW()),  -- 한국 궁수 2장
(4, 5, 1, NOW(), NOW()),  -- 한국 치료사 1장
(4, 7, 1, NOW(), NOW()),  -- 한국 수도승 1장
(4, 2, 2, NOW(), NOW()),  -- 중국 마법사 2장
(4, 4, 1, NOW(), NOW()),  -- 중국 기사 1장
(4, 8, 1, NOW(), NOW());  -- 중국 암살자 1장

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

-- 매치 위치 데이터 삽입
INSERT INTO match_locations (match_id, slot_index, location_id, revealed_turn, created_at, updated_at) VALUES
(1, 0, 1, 1, NOW(), NOW()),
(1, 1, 2, 1, NOW(), NOW()),
(2, 0, 3, 1, NOW(), NOW()),
(2, 1, 4, 1, NOW(), NOW()),
(3, 0, 5, 1, NOW(), NOW()),
(3, 1, 6, 1, NOW(), NOW()),
(4, 0, 1, 1, NOW(), NOW()),
(4, 1, 3, 1, NOW(), NOW());

-- 플레이 데이터 삽입
INSERT INTO plays (match_id, turn_count, guest_id, card_id, slot_index, power_snapshot, created_at, updated_at) VALUES
(1, 1, 1, 1, 0, 4, NOW(), NOW()),
(1, 1, 2, 2, 1, 3, NOW(), NOW()),
(1, 2, 1, 3, 2, 2, NOW(), NOW()),
(1, 2, 2, 4, 3, 6, NOW(), NOW()),
(2, 1, 1, 5, 0, 1, NOW(), NOW()),
(2, 1, 2, 6, 1, 10, NOW(), NOW()),
(2, 2, 1, 7, 2, 3, NOW(), NOW()),
(2, 2, 2, 8, 3, 5, NOW(), NOW()),
(3, 1, 3, 1, 0, 4, NOW(), NOW()),
(3, 1, 4, 2, 1, 3, NOW(), NOW()),
(4, 1, 2, 3, 0, 2, NOW(), NOW()),
(4, 1, 3, 4, 1, 6, NOW(), NOW());
