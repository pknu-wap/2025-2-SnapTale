# 게임 플로우 구현 문서

## 개요

이 문서는 SnapTale 게임의 전체 플로우 구현에 대한 상세 설명을 제공합니다.

## 핵심 데이터 구조 (Entities)

### 1. Match

- 게임의 중앙 허브
- 상태: `QUEUED`, `MATCHED`, `PLAYING`, `ENDED`
- 필드: `status`, `turnCount`, `winnerId`, `endedAt`
- 관계: `participants`, `locations`, `plays`

### 2. MatchParticipant

- 유저와 덱을 매치에 연결
- 필드: `guestId`, `playerIndex`, `deckPresetId`, `finalScore`

### 3. Play

- 카드 플레이 기록
- 필드: `turnCount`, `guestId`, `cardId`, `slotIndex`, `powerSnapshot`

### 4. MatchLocation

- 매치에 할당된 3개의 Location
- 필드: `slotIndex`, `locationId`, `revealedTurn`

## 게임 진행 시나리오

### 1단계: 매칭 및 게임 초기화

#### API 엔드포인트

```
POST /api/game/init
```

#### 요청 예시

```json
{
  "player1Id": 1,
  "player2Id": 2,
  "deck1Id": 1,
  "deck2Id": 2
}
```

#### 처리 과정

1. **유저 및 덱 검증**: 두 유저와 두 덱이 존재하는지 확인
2. **덱 검증**:
   - 각 덱이 정확히 12장인지 확인
   - 같은 덱을 두 플레이어가 사용하는지 확인 (중복 불가)
3. **Match 생성**: 상태를 `MATCHED`로 설정
4. **MatchParticipant 생성**: 각 플레이어에 대해 생성 (playerIndex: 0, 1)
5. **Location 할당**: 활성 Location 중 랜덤으로 3개 선택
6. **초기 카드 드로우**: 각 플레이어의 덱에서 전체 12장을 핸드로 제공

#### 응답 예시

```json
{
  "matchId": 123,
  "participant1Id": 456,
  "participant2Id": 789,
  "player1HandCardIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  "player2HandCardIds": [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  "locationIds": [1, 3, 5]
}
```

### 2단계: 게임 시작

#### WebSocket 엔드포인트 (권장)

```
SEND: /app/match/{matchId}/start
SUBSCRIBE: /topic/match/{matchId}
```

**참고**: 게임 시작은 WebSocket으로만 가능합니다. REST API 엔드포인트는 제거되었습니다.

#### 처리 과정

1. Match 상태를 `PLAYING`으로 변경
2. `turnCount`를 1로 설정
3. 게임 상태를 모든 참가자에게 브로드캐스트

### 3단계: 턴 진행 (1~6턴)

#### 카드 제출

##### WebSocket 메시지

```
SEND: /app/match/{matchId}/play
```

##### 메시지 예시

```json
{
  "matchId": 123,
  "participantId": 456,
  "cardId": 1,
  "actionType": "PLAY_CARD",
  "additionalData": "{\"slotIndex\": 0}"
}
```

#### 처리 과정

1. **카드 제출 검증**

   - 매치가 `PLAYING` 상태인지 확인
   - 플레이어가 이미 이번 턴에 제출했는지 확인
   - slotIndex가 유효한지 확인 (0~2)

2. **Play 엔티티 생성**

   - `turnCount`: 현재 턴
   - `guestId`: 플레이어 ID
   - `cardId`: 제출한 카드 ID
   - `slotIndex`: 카드를 놓은 위치
   - `powerSnapshot`: 카드의 현재 파워 (효과 계산 전)

3. **양쪽 플레이어 제출 확인**

   - 두 플레이어가 모두 제출했으면 턴 종료 처리

4. **게임 상태 브로드캐스트**
   - 모든 참가자에게 현재 게임 상태 전송

### 4단계: 턴 종료 및 다음 턴 시작

#### 자동 처리

양쪽 플레이어가 모두 카드를 제출하면 자동으로 처리됩니다.

#### 처리 과정

1. **현재 턴 확인**: 두 플레이어가 모두 제출했는지 재확인
2. **마지막 턴 확인**: 6턴이면 게임 종료로 진행
3. **다음 턴 시작**:
   - `turnCount` 1 증가
   - 다음 턴 시작 메시지 브로드캐스트

### 5단계: 게임 종료 및 결과 처리

#### 처리 과정

##### 1. Location별 파워 계산

```java
// 각 Location(슬롯)별로 양쪽 플레이어의 카드 파워 합계 계산
for (slotIndex = 0; slotIndex < 3; slotIndex++) {
    player1Power[slotIndex] = sum of all player1's cards in this slot
    player2Power[slotIndex] = sum of all player2's cards in this slot
}
```

##### 2. 승자 판정

- **1차 판정**: Location 점령 수

  - 각 Location에서 파워가 높은 플레이어가 점령
  - 2개 이상 점령한 플레이어 승리

- **2차 판정**: 총 파워 합계
  - Location 점령 수가 같으면 총 파워 합계로 결정
  - 총 파워도 같으면 무승부 (winnerId = null)

##### 3. Match 업데이트

- 상태를 `ENDED`로 변경
- `winnerId` 설정
- `endedAt` 설정 (현재 시간)

##### 4. 사용자 통계 업데이트

- **매치 플레이 수**: 양쪽 모두 +1
- **승자**:
  - `wins`: +1
  - `rankPoint`: +25
- **패자**:
  - `rankPoint`: -10 (최소 0)
- **무승부**:
  - 양쪽 모두 `rankPoint`: +5

##### 5. 최종 결과 브로드캐스트

```json
{
  "type": "GAME_END",
  "data": {
    "matchId": 123,
    "status": "ENDED",
    "currentRound": 6,
    "participantScores": [...],
    "lastPlayInfo": "Player1님이 승리했습니다! (Location 점령: 2 vs 1, 총 파워: 45 vs 38)"
  }
}
```

## 서비스 구조

### GameFlowService

게임 전체 플로우 관리

- `initializeGame()`: 게임 초기화
- `startGame()`: 게임 시작
- `drawNextCard()`: 다음 카드 드로우

### TurnService

턴 진행 로직

- `submitPlay()`: 카드 제출 처리
- `endTurnAndStartNext()`: 턴 종료 및 다음 턴 시작
- `checkBothPlayersSubmitted()`: 양쪽 플레이어 제출 확인

### GameCalculationService

게임 계산 로직

- `calculateLocationPowers()`: Location별 파워 계산
- `endGameAndDetermineWinner()`: 게임 종료 및 승자 판정
- `updateUserStatistics()`: 사용자 통계 업데이트

### MatchWebSocketService

WebSocket 통신 처리

- `handleJoin()`: 매치 참가
- `handleStart()`: 매치 시작
- `handlePlayCard()`: 카드 플레이
- `handleEndTurn()`: 턴 종료
- `processGameEnd()`: 게임 종료 처리

## WebSocket 통신

### 연결

```
ws://localhost:8080/ws-stomp
```

### 구독 경로

- `/topic/match/{matchId}`: 특정 매치의 모든 업데이트
- `/queue/participant/{participantId}`: 특정 참가자 개인 메시지

### 메시지 전송 경로

- `/app/match/{matchId}/join`: 매치 참가
- `/app/match/{matchId}/leave`: 매치 퇴장
- `/app/match/{matchId}/start`: 매치 시작
- `/app/match/{matchId}/play`: 플레이 액션 (카드 제출)
- `/app/match/{matchId}/state`: 게임 상태 조회

## 게임 흐름 다이어그램

```
[게임 초기화]
    ↓
[게임 시작] → turnCount = 1
    ↓
┌─────────────────────────┐
│  턴 진행 (턴 1~6)        │
│  ├─ Player 1 카드 제출   │
│  ├─ Player 2 카드 제출   │
│  ├─ 양쪽 제출 확인       │
│  └─ 다음 턴으로 진행     │
└─────────────────────────┘
    ↓
[턴 6 완료]
    ↓
[파워 계산]
    ├─ 각 Location별 파워 합계
    └─ 총 파워 합계
    ↓
[승자 판정]
    ├─ Location 점령 수 비교
    └─ 총 파워 비교
    ↓
[통계 업데이트]
    ├─ 매치 플레이 수 증가
    ├─ 승자 win 증가
    └─ 랭크 포인트 업데이트
    ↓
[게임 종료] → status = ENDED
```

## 예외 처리

### 주요 예외 상황

- `MATCH_NOT_FOUND`: 매치를 찾을 수 없음
- `PARTICIPANT_NOT_FOUND`: 참가자를 찾을 수 없음
- `CARD_NOT_FOUND`: 카드를 찾을 수 없음
- `INVALID_MATCH_STATUS`: 잘못된 매치 상태
- `ALREADY_PLAYED_THIS_TURN`: 이미 이번 턴에 플레이함
- `INVALID_SLOT_INDEX`: 잘못된 슬롯 인덱스
- `GAME_NOT_STARTED`: 게임이 시작되지 않음
- `GAME_ALREADY_ENDED`: 게임이 이미 종료됨
- `WAITING_FOR_OTHER_PLAYER`: 다른 플레이어 대기 중
- `INSUFFICIENT_LOCATIONS`: Location 개수 부족

## 테스트 시나리오

### 1. 정상 게임 플레이

1. 게임 초기화 (`POST /api/game/init`)
2. 게임 시작 (`POST /api/game/{matchId}/start`)
3. 턴 1-6 카드 제출 (WebSocket)
4. 게임 종료 및 결과 확인

### 2. 무승부 시나리오

- Location 점령: 1 vs 1 (1개 무승부)
- 총 파워: 40 vs 40
- 결과: winnerId = null, 양쪽 +5 포인트

### 3. 중도 퇴장

- 한 플레이어가 연결 끊김
- 나머지 플레이어 자동 승리 처리 (향후 구현 가능)

## 향후 개선 사항

### 1. 카드 효과 시스템

현재는 기본 파워만 계산하며, 특수 효과는 구현되지 않았습니다.

**현재 카드 풀**: 30장 (한국 10, 중국 10, 일본 10)
**덱 구성**: 6개의 덱, 각 12장씩 (한국/중국/일본 카드 혼합)
**덱 규칙**: 한 덱에 같은 카드는 1장만 포함 가능 (quantity 제거됨)

```java
// 향후 구현 예시
if (card.hasEffect("DOUBLE_POWER")) {
    power *= 2;
}
```

### 2. Location 효과

Location의 특수 효과도 아직 적용되지 않았습니다.

### 3. 실시간 타이머

각 턴에 제한 시간을 추가할 수 있습니다.

### 4. 매칭 시스템

현재는 수동으로 매칭하지만, 자동 매칭 큐를 구현할 수 있습니다.

### 5. 관전 모드

다른 플레이어의 게임을 관전할 수 있는 기능

### 6. 리플레이 시스템

게임 기록을 저장하고 재생하는 기능

## 결론

모든 핵심 게임 로직이 구현되었으며, WebSocket을 통한 실시간 통신이 가능합니다.
클라이언트는 REST API로 게임을 초기화하고, WebSocket으로 게임을 진행할 수 있습니다.
