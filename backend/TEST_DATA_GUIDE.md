# SnapTale 백엔드 목 데이터 가이드

이 문서는 SnapTale 백엔드 프로젝트에서 테스트를 위한 목 데이터를 생성하고 사용하는 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [목 데이터 생성 방법](#목-데이터-생성-방법)
3. [API 테스트 방법](#api-테스트-방법)
4. [데이터 초기화](#데이터-초기화)
5. [문제 해결](#문제-해결)

## 🎯 개요

SnapTale 프로젝트는 다음과 같은 엔티티들을 포함합니다:

- **User**: 사용자 정보 (닉네임, 랭크 포인트, 전적 등)
- **Card**: 카드 정보 (이름, 비용, 공격력, 진영, 효과 등)
- **Location**: 위치 정보 (이름, 효과 설명 등)
- **Match**: 매치 정보 (상태, 승자, 턴 수 등)

## 🚀 목 데이터 생성 방법

### 1. 자동 데이터 로딩 (DataLoader)

애플리케이션 시작 시 자동으로 목 데이터가 생성됩니다.

**특징:**

- 개발 환경(`dev` 프로필)에서만 실행
- 기존 데이터가 있으면 스킵
- 애플리케이션 시작 시 자동 실행

**사용법:**

```bash
# 개발 환경으로 실행
./gradlew bootRun -Dspring.profiles.active=dev
```

### 2. SQL 스크립트 (data.sql)

`src/main/resources/data.sql` 파일을 통해 데이터베이스 초기화 시 데이터를 삽입합니다.

**특징:**

- `spring.sql.init.mode=always`로 설정됨
- 애플리케이션 시작 시 자동 실행
- SQL 문법으로 직접 데이터 정의

### 3. 테스트 유틸리티 (TestDataGenerator)

프로그래밍 방식으로 다양한 시나리오의 데이터를 생성할 수 있습니다.

**사용 예시:**

```java
// 랜덤 사용자 생성
User user = TestDataGenerator.createRandomUser();

// 특정 조건의 사용자 생성
User user = TestDataGenerator.createUserWithStats("플레이어1", 1000, 5, 3);

// 여러 사용자 일괄 생성
List<User> users = TestDataGenerator.createMultipleUsers(10);
```

## 🔧 API 테스트 방법

### 테스트 컨트롤러 엔드포인트

개발 환경에서 다음 API들을 사용하여 데이터를 생성하고 테스트할 수 있습니다:

#### 1. 사용자 관련 API

```bash
# 랜덤 사용자 생성
POST /test/users/random

# 여러 랜덤 사용자 생성 (최대 100개)
POST /test/users/random/{count}
```

#### 2. 카드 관련 API

```bash
# 랜덤 카드 생성
POST /test/cards/random

# 여러 랜덤 카드 생성 (최대 100개)
POST /test/cards/random/{count}
```

#### 3. 위치 관련 API

```bash
# 랜덤 위치 생성
POST /test/locations/random

# 여러 랜덤 위치 생성 (최대 50개)
POST /test/locations/random/{count}
```

#### 4. 매치 관련 API

```bash
# 랜덤 매치 생성
POST /test/matches/random
```

#### 5. 데이터베이스 관리 API

```bash
# 데이터베이스 초기화 (모든 데이터 삭제 후 기본 데이터 생성)
POST /test/reset

# 데이터 통계 조회
GET /test/stats
```

### Swagger UI를 통한 테스트

1. 애플리케이션 실행 후 `http://localhost:8080/swagger-ui.html` 접속
2. "Test" 섹션에서 테스트 API 확인
3. 각 API를 직접 실행하여 테스트

## 🔄 데이터 초기화

### 전체 초기화

```bash
# API를 통한 초기화
curl -X POST http://localhost:8080/test/reset

# 또는 Swagger UI에서 실행
```

### 수동 초기화

1. 애플리케이션 중지
2. H2 데이터베이스 파일 삭제 (메모리 DB인 경우 자동)
3. 애플리케이션 재시작

## 📊 생성되는 기본 데이터

### 사용자 데이터 (5명)

- 플레이어1 (랭크: 1000, 경기: 5, 승리: 3)
- 플레이어2 (랭크: 1200, 경기: 8, 승리: 6)
- 고수플레이어 (랭크: 1800, 경기: 20, 승리: 18)
- 초보자 (랭크: 800, 경기: 2, 승리: 0)
- 테스터 (랭크: 1500, 경기: 10, 승리: 7)

### 카드 데이터 (8장)

- 한국 진영: 전사, 궁수, 치료사, 수도승
- 중국 진영: 마법사, 기사, 드래곤, 암살자

### 위치 데이터 (5개)

- 한국의 궁궐, 중국의 만리장성, 전쟁터, 신비의 숲, 바다의 항구

### 매치 데이터 (2개)

- 진행 중인 매치 1개
- 완료된 매치 1개

## 🛠️ 문제 해결

### 1. 데이터가 생성되지 않는 경우

**확인사항:**

- `application.yml`에서 `spring.sql.init.mode=always` 설정 확인
- `DataLoader`가 `@Profile("dev")`로 설정되어 있는지 확인
- 애플리케이션 실행 시 `dev` 프로필 사용 여부 확인

**해결방법:**

```bash
# dev 프로필로 실행
./gradlew bootRun -Dspring.profiles.active=dev
```

### 2. 테스트 API가 작동하지 않는 경우

**확인사항:**

- `TestController`가 올바른 패키지에 위치하는지 확인
- 필요한 Repository들이 주입되어 있는지 확인

### 3. 외래키 제약조건 오류

**해결방법:**

- 데이터 삭제 시 올바른 순서로 삭제 (외래키가 참조하는 테이블부터)
- `TestController`의 `resetDatabase()` 메서드 참고

## 📝 추가 정보

### 개발 환경 설정

```yaml
# application.yml
spring:
  profiles:
    active: dev
  sql:
    init:
      mode: always
```

### 로깅 설정

```yaml
logging:
  level:
    org.hibernate.SQL: debug
    com.snaptale.backend.common.config.DataLoader: info
```

이 가이드를 통해 SnapTale 백엔드 프로젝트에서 효과적으로 목 데이터를 생성하고 API를 테스트할 수 있습니다.
