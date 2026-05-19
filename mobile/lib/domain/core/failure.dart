import 'package:freezed_annotation/freezed_annotation.dart';

part 'failure.freezed.dart';

/// 도메인 전역 실패 타입. 모든 계층의 예외는 이 타입으로 변환되어 표면화된다.
/// 모든 케이스가 공유하는 [message] 게터는 Freezed 가 생성한다.
@freezed
sealed class Failure with _$Failure implements Exception {
  const factory Failure.auth(String message) = AuthFailure;
  const factory Failure.network(String message) = NetworkFailure;
  const factory Failure.server(String message) = ServerFailure;
  const factory Failure.unexpected(String message) = UnexpectedFailure;
}
