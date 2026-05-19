import 'package:class_bridge_app/domain/auth/entities/user_role.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('UserRole.fromString', () {
    test('웹 스키마 문자열을 역할로 매핑한다', () {
      expect(UserRole.fromString('director'), UserRole.director);
      expect(UserRole.fromString('teacher'), UserRole.teacher);
      expect(UserRole.fromString('student'), UserRole.student);
      expect(UserRole.fromString('parent'), UserRole.parent);
    });

    test('알 수 없는 값은 student 로 폴백한다', () {
      expect(UserRole.fromString('unknown'), UserRole.student);
    });

    test('한글 라벨을 제공한다', () {
      expect(UserRole.director.label, '원장');
      expect(UserRole.parent.label, '학부모');
    });
  });
}
