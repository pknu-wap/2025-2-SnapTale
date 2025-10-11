# SnapTale 백엔드 빠른 시작 가이드

## 🎮 게임 테스트 빠른 시작

### 1️⃣ 서버 실행

```bash
./gradlew bootRun
```

서버 실행 후 `http://localhost:8080`에서 접근 가능합니다.

### 2️⃣ 게임 초기화 (Postman)

```http
POST http://localhost:8080/api/game/init
Content-Type: application/json

{
  "player1Id": 1,
  "player2Id": 2,
  "deck1Id": 1,
  "deck2Id": 2
}
```

**응답 예시:**

```json
{
  "httpStatus": 200,
  "isSuccess": true,
  "code": "SUCCESS",
  "message": "요청에 성공했습니다.",
  "result": {
    "matchId": 5,
    "participant1Id": 9,
    "participant2Id": 10,
    "player1HandCardIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "player2HandCardIds": [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    "locationIds": [2, 4, 6]
  }
}
```

### 3️⃣ WebSocket 연결 (JavaScript 예시)

```javascript
// SockJS + STOMP 연결
const socket = new SockJS("http://localhost:8080/ws-stomp");
const stompClient = Stomp.over(socket);

stompClient.connect({}, function () {
  console.log("WebSocket 연결 성공!");

  // 매치 구독
  stompClient.subscribe("/topic/match/5", function (message) {
    console.log("게임 업데이트:", JSON.parse(message.body));
  });
});
```

### 4️⃣ 매치 참가

```javascript
stompClient.send(
  "/app/match/5/join",
  {},
  JSON.stringify({
    matchId: 5,
    userId: 1,
    nickname: "플레이어1",
  })
);
```

### 5️⃣ 게임 시작

```javascript
stompClient.send(
  "/app/match/5/start",
  {},
  JSON.stringify({
    matchId: 5,
  })
);
```

### 6️⃣ 카드 제출

```javascript
// Player 1이 카드 제출
stompClient.send(
  "/app/match/5/play",
  {},
  JSON.stringify({
    matchId: 5,
    participantId: 9,
    cardId: 1,
    actionType: "PLAY_CARD",
    additionalData: '{"slotIndex": 0}',
  })
);

// Player 2가 카드 제출
stompClient.send(
  "/app/match/5/play",
  {},
  JSON.stringify({
    matchId: 5,
    participantId: 10,
    cardId: 3,
    actionType: "PLAY_CARD",
    additionalData: '{"slotIndex": 1}',
  })
);
```

## 📊 사용 가능한 데이터

### 유저 ID

- 1: 플레이어1
- 2: 플레이어2
- 3: 고수플레이어
- 4: 초보자
- 5: 테스터

### 덱 ID (각 12장)

- 1: 기본 덱
- 2: 공격형 덱
- 3: 방어형 덱
- 4: 균형형 덱
- 5: 혼합 덱 1
- 6: 혼합 덱 2

**⚠️ 중요**: 같은 덱을 두 플레이어가 사용하면 안 됩니다!

### 카드 ID (총 30장)

- 1-10: 한국 카드 (을지문덕, 이순신, 주몽, 선덕여왕, 강감찬, 연개소문, 홍길동, 전우치, 장보고, 세종대왕)
- 11-20: 중국 카드 (관우, 조조, 제갈량, 유비, 동탁, 사마의, 여포, 손권, 초선, 황월영)
- 21-30: 일본 카드 (아마테라스, 스사노오, 츠쿠요미, 유키온나, 오니, 텐구, 키츠네, 카파, 마네키네코, 쿠치사케온나)

### Location ID

- 1-7: 다양한 위치 (한국의 궁궐, 중국의 만리장성, 전쟁터, 신비의 숲, 바다의 항구, 산의 정상, 사막의 오아시스)

## 🎯 게임 플로우

```
1. 게임 초기화 (REST API)
   POST /api/game/init
   → matchId, participantId, 카드 12장 배분
   ↓
2. 매치 참가 (WebSocket)
   /app/match/{matchId}/join
   → 세션 등록
   ↓
3. 게임 시작 (WebSocket)
   /app/match/{matchId}/start
   → 턴 1 시작
   ↓
4. 턴 1-6 진행 (WebSocket)
   각 턴마다:
   - Player 1 카드 제출
   - Player 2 카드 제출
   - 자동으로 다음 턴 진행
   ↓
5. 턴 6 완료 후 자동 게임 종료
   → 파워 계산
   → 승자 판정
   → 통계 업데이트
   → 결과 브로드캐스트
```

## ⚠️ 주의사항

### 덱 사용 규칙

- 각 덱은 정확히 **12장**
- 한 덱에 **같은 카드는 1장만** 포함 (중복 불가)
- 같은 덱을 두 플레이어가 사용 불가
- 올바른 예: deck1Id=1, deck2Id=2 ✅
- 잘못된 예: deck1Id=1, deck2Id=1 ❌

### 슬롯 인덱스

- 0, 1, 2만 사용 가능 (3개의 Location)
- 다른 값 사용 시 `INVALID_SLOT_INDEX` 에러

### 턴 제한

- 각 플레이어는 **턴당 1장**만 제출 가능
- 중복 제출 시 `ALREADY_PLAYED_THIS_TURN` 에러

## 🔗 추가 문서

- **GAME_FLOW_DOCUMENTATION.md**: 상세한 게임 플로우 설명
- **IMPLEMENTATION_SUMMARY.md**: 구현 완료 보고서
- **TEST_DATA_GUIDE.md**: 테스트 데이터 가이드
- **API_Documentation.txt**: 전체 API 문서

## 🐛 디버깅

### Swagger UI

```
http://localhost:8080/swagger-ui.html
```

### H2 Console (개발 환경)

```
http://localhost:8080/h2-console
```

## 📞 API 엔드포인트 요약

### REST API

- `POST /api/game/init` - 게임 초기화 ⭐
- `GET /api/cards` - 카드 목록
- `GET /api/deck-presets` - 덱 목록
- `GET /api/users` - 유저 목록

### WebSocket

- `/app/match/{matchId}/join` - 매치 참가 ⭐
- `/app/match/{matchId}/start` - 게임 시작 ⭐
- `/app/match/{matchId}/play` - 카드 제출 ⭐
- `/app/match/{matchId}/state` - 게임 상태 조회
- `/app/match/{matchId}/leave` - 매치 퇴장

### 구독 경로

- `/topic/match/{matchId}` - 매치 전체 브로드캐스트
- `/queue/participant/{participantId}` - 개인 메시지

Happy Coding! 🎮✨
