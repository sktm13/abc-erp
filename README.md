# ABC ERP

## 프로젝트 소개

Spring Boot API, React + Vite를 활용한 사내 ERP 시스템입니다.

기능 : (사원 관리, 공지사항, 근무일지, 사내 메신저) + 대시보드

---

## 개발 목적

1. WebSocket 활용 - 채팅 기능 구현
2. Redis 활용 - 성능 향상 실현
3. Docker 활용 - 실행환경 표준화
---

## 주요 기능

### 인증 / 회원

* JWT 인증 + Refresh Token Redis 저장 및 TTL 관리
* 권한 처리
  * EMPLOYEE (사원)
  * MANAGER (팀장)
  * ADMIN (관리자)
* 사원 등록 / 수정 / 상태 변경 (ADMIN권한)
* 재직 / 휴직 / 퇴사 상태 관리 (휴직/퇴사자는 로그인 제한 -> 인사과 문의 유도 메세지 출력)
* 비밀번호 변경

### 대시보드

* 현재 근무중인지 아닌지 확인
* 안읽은 공지사항 (사원은 모든 공지를 읽음처리 해야한다. **입사일(사원등록일)기준 이전에 생성된 공지사항 예외)
* 주간 근무일지

### 사원 관리

* 사원 목록 조회 (Redis 캐싱, Server 처리시간 기준 평균 처리시간 약 79.80% 개선) 
* 사원 검색 (부서별, 재직상태별, 권한별 + querydsl 적용)
* 사원 등록 및 수정 (ADMIN 권한)

### 공지사항

* 전체 공지 / 부서별 공지
* 읽음 / 안읽음 상태 관리 (대시보드에 안읽음 공지 조회)
* 첨부파일
* 공지 등록 / 수정 / 삭제 (ADMIN 권한)

### 근무일지

* 근무 시작 / 종료
* 근무 시간 자동 계산
* 월간/주간 근무일지 조회
* 다른 사원 근무일지 조회(MANAGER 권한)

### 사내 메신저

* WebSocket 기반 실시간 채팅
* <1:1, 그룹> 채팅방 생성
* 참여자 목록 조회
* 안읽은 메시지 수 표시
* 온라인 / 자리비움 / 오프라인 상태 설정

### Redis 적용

* 사원 목록 조회 결과 캐싱
* Refresh Token 저장 및 TTL 관리
* 사원 목록의 상태 변경 시 캐시 무효화

### Docker 실행 환경

* Docker Compose 기반 통합 실행 환경
* Frontend / Backend / MariaDB / Redis 컨테이너 구성
* 초기 데이터 자동 생성
* Windows 및 Mac OS 환경에서 Docker Compose 실행 검증 완료
---

## Tech Stack

### Backend

* Java 21
* Spring Boot
* Spring Security
* JWT
* Spring Data JPA
* Querydsl
* MariaDB
* Redis
* WebSocket / STOMP

### Frontend

* React + Vite
* TypeScript
* Axios
* React Router

### Infra

* Docker

---
## 실행 방법

1. Docker 실행
2. 프로젝트 루트에서 명령어 실행
3. http://localhost/5173 접속
   
*실행 시 초기 데이터가 자동 생성되며, 이미 데이터가 존재하는 경우 중복 생성하지 않습니다.

```bash
docker compose up --build
```

초기 데이터 구성:
```text
사원: 50명
공지사항: 120개
근무일지: 250건
채팅 데이터: 초기 생성 제외
```

---

## 실행 조건

Docker 설치, 아래 포트 비어져있어야함

```text
5173  Frontend
8080  Backend
3307  MariaDB
6379  Redis
```

---

## 초기 데이터 구성

```text
사원: 50명
공지사항: 120개
근무일지: 250건
채팅 데이터: 초기 생성 제외
```

### 사원

부서 5개:

```text
DEV 개발팀
HR 인사팀
PUR 구매팀
FIN 재무팀
OPS 운영팀
```

각 부서별 10명:

```text
팀장 5명
- 재직 3명
- 휴직 1명
- 퇴사 1명

사원 5명
- 재직 3명
- 휴직 1명
- 퇴사 1명
```

개발팀 팀장 1명에게 ADMIN 권한을 부여

---
## 테스트 계정 

### ADMIN
```text
사번: ABC-21-DEV-001
비밀번호: 1111
권한: EMPLOYEE, MANAGER, ADMIN
```
연도, 부서, 끝 수 를 조정하여 각 사원계정으로 로그인할 수 있습니다. (비밀번호 변경 전 : 1111)
---

## Redis 성능 개선

모든 기능에서 사원 목록 조회가 수반되므로 캐싱 적용이 필수적이라고 판단하였습니다.

측정 대상:

```text
GET /api/member/list
```

측정 조건:

```text
요청 횟수: 50회
응답 상태: 전체 200 OK
```

### Redis 적용 전

```text
Client 평균 응답시간: 36.97ms
Client p95 응답시간: 43.93ms
Server 평균 처리시간: 18.32ms
Server p95 처리시간: 24.11ms
```

### Redis 적용 후

```text
Client 평균 응답시간: 30.31ms
Client p95 응답시간: 33.93ms
Server 평균 처리시간: 3.70ms
Server p95 처리시간: 4.20ms
```

### 개선 결과

| 구분         | Redis 적용 전 | Redis 적용 후 |         개선율 |
| ---------- | ---------: | ---------: | ----------: |
| Client 평균  |    36.97ms |    30.31ms | 약 18.02% 개선 |
| Client p95 |    43.93ms |    33.93ms | 약 22.76% 개선 |
| Server 평균  |    18.32ms |     3.70ms | 약 79.80% 개선 |
| Server p95 |    24.11ms |     4.20ms | 약 82.58% 개선 |

가장 중요한 Server 처리시간 기준 Redis 캐싱 적용 후 평균 처리시간이 약 79.80% 개선되는 것을 확인

---

## 개발일지

개발 과정은 Notion 개발일지에 정리했습니다.

* 1일차: 프로젝트 기획 및 요구사항 정리
* 2일차: 사원 관리 기능 구현
* 3일차: 공지사항 기능 구현
* 4일차: 근무일지 기능 구현
* 5일차: 메신저 UI 및 채팅 기능 구현
* 6일차: WebSocket 기반 실시간 채팅 구현
* 7일차: Docker Compose 실행 환경 구성 및 초기 데이터 자동 생성
* 8일차: Docker 실행 환경 보강 및 Redis 적용
