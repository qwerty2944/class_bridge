# Class Bridge — 모바일 앱

Class Bridge 학원관리 시스템의 Flutter 모바일 클라이언트.
역할 통합 앱(원장/선생님/학생/학부모) — 로그인 후 역할에 따라 분기한다.

## 아키텍처 (클린 아키텍처 · 4계층)

```
lib/
  domain/          순수 Dart — 엔티티, 리포지토리 인터페이스, 유스케이스, Failure
  data/            DTO(json), 데이터소스, 리포지토리 구현 (도메인 ↔ 원격 매핑)
  infrastructure/  프레임워크 플러밍 — Supabase 클라이언트, Dio, Retrofit, 인터셉터, env
  presentation/    UI — 라우터(GoRouter), 컨트롤러(Riverpod), 페이지, 테마
```

의존성 규칙: `presentation → domain ← data`, `infrastructure` 는 DI 로 주입.

- 상태관리: Riverpod (코드젠 `@riverpod`)
- 라우팅: GoRouter (인증 상태 기반 redirect)
- 모델: Freezed + json_serializable
- 네트워크: Dio + Retrofit → Supabase PostgREST(`/rest/v1`)
- 인증: supabase_flutter SDK (세션/토큰)

## 실행

```bash
flutter pub get
dart run build_runner build --delete-conflicting-outputs   # 코드 생성
cp env.example.json env.json                                # 후 SUPABASE_ANON_KEY 입력
flutter run --dart-define-from-file=env.json
```

`env.json` 은 git 에 커밋되지 않는다. `SUPABASE_ANON_KEY` 는 웹의 `.env.local`
(`NEXT_PUBLIC_SUPABASE_ANON_KEY`) 값을 재사용한다.

## 코드 생성

Freezed / json / Retrofit / Riverpod 산출물(`*.freezed.dart`, `*.g.dart`)은
`build_runner` 로 생성한다. 모델/프로바이더 변경 후 재실행:

```bash
dart run build_runner build --delete-conflicting-outputs
# 또는 watch 모드
dart run build_runner watch --delete-conflicting-outputs
```
