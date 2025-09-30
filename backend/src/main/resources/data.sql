-- =============================================
-- SnapTale 목 데이터 SQL 스크립트
-- =============================================

-- 사용자 데이터 삽입
INSERT INTO user_info (nickname, rank_point, matches_played, wins, last_seen, linked_account_id, created_at, updated_at) VALUES
('플레이어1', 1000, 5, 3, NOW(), NULL, NOW(), NOW()),
('플레이어2', 1200, 8, 6, NOW() - INTERVAL 1 HOUR, NULL, NOW(), NOW()),
('고수플레이어', 1800, 20, 18, NOW() - INTERVAL 30 MINUTE, NULL, NOW(), NOW()),
('초보자', 800, 2, 0, NOW() - INTERVAL 1 DAY, NULL, NOW(), NOW()),
('테스터', 1500, 10, 7, NOW(), NULL, NOW(), NOW());

-- 카드 데이터 삽입
INSERT INTO cards (name, image_url, cost, power, faction, effect_desc, is_active, created_at, updated_at) VALUES
('한국 전사', 'https://example.com/korean_warrior.jpg', 3, 4, '한국', '전투 시 +1 공격력', true, NOW(), NOW()),
('중국 마법사', 'https://example.com/chinese_mage.jpg', 4, 3, '중국', '마법 공격 시 적 전체에게 1 데미지', true, NOW(), NOW()),
('한국 궁수', 'https://example.com/korean_archer.jpg', 2, 2, '한국', '원거리 공격 가능', true, NOW(), NOW()),
('중국 기사', 'https://example.com/chinese_knight.jpg', 5, 6, '중국', '방어력 +2', true, NOW(), NOW()),
('한국 치료사', 'https://example.com/korean_healer.jpg', 3, 1, '한국', '아군 체력 +3 회복', true, NOW(), NOW()),
('중국 드래곤', 'https://example.com/chinese_dragon.jpg', 8, 10, '중국', '강력한 범위 공격', true, NOW(), NOW()),
('한국 수도승', 'https://example.com/korean_monk.jpg', 4, 3, '한국', '마법 저항력 +50%', true, NOW(), NOW()),
('중국 암살자', 'https://example.com/chinese_assassin.jpg', 3, 5, '중국', '첫 공격 시 치명타', true, NOW(), NOW()),
('한국 궁수장', 'https://example.com/korean_archer_commander.jpg', 6, 5, '한국', '궁수 카드들의 공격력 +2', true, NOW(), NOW()),
('중국 황제', 'https://example.com/chinese_emperor.jpg', 10, 8, '중국', '모든 중국 카드들의 능력 +1', true, NOW(), NOW());

-- 위치 데이터 삽입
INSERT INTO locations (name, image_url, effect_desc, is_active, created_at, updated_at) VALUES
('한국의 궁궐', 'https://example.com/korean_palace.jpg', '한국 진영 카드들의 공격력 +1', true, NOW(), NOW()),
('중국의 만리장성', 'https://example.com/great_wall.jpg', '중국 진영 카드들의 방어력 +1', true, NOW(), NOW()),
('전쟁터', 'https://example.com/battlefield.jpg', '모든 카드의 비용 -1', true, NOW(), NOW()),
('신비의 숲', 'https://example.com/mystic_forest.jpg', '마법 카드의 효과 +50%', true, NOW(), NOW()),
('바다의 항구', 'https://example.com/sea_port.jpg', '카드 드로우 +1', true, NOW(), NOW()),
('산의 정상', 'https://example.com/mountain_peak.jpg', '고비용 카드들의 효과 +1', true, NOW(), NOW()),
('사막의 오아시스', 'https://example.com/desert_oasis.jpg', '체력 회복 효과 +100%', true, NOW(), NOW());

-- 매치 데이터 삽입
INSERT INTO matches (status, winner_id, turn_count, ended_at, created_at, updated_at) VALUES
('PLAYING', NULL, 5, NULL, NOW(), NOW()),
('ENDED', 1, 12, NOW() - INTERVAL 2 HOUR, NOW(), NOW()),
('QUEUED', NULL, 0, NULL, NOW(), NOW()),
('ENDED', 2, 8, NOW() - INTERVAL 1 DAY, NOW(), NOW());

-- 매치 참가자 데이터 삽입
INSERT INTO match_participants (match_id, guest_id, player_index, deck_preset_id, created_at, updated_at) VALUES
(1, 1, 0, NULL, NOW(), NOW()),
(1, 2, 1, NULL, NOW(), NOW()),
(2, 1, 0, NULL, NOW(), NOW()),
(2, 2, 1, NULL, NOW(), NOW()),
(3, 3, 0, NULL, NOW(), NOW()),
(3, 4, 1, NULL, NOW(), NOW()),
(4, 2, 0, NULL, NOW(), NOW()),
(4, 3, 1, NULL, NOW(), NOW());

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
