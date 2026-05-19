/// 학원 내 사용자 역할. 웹 스키마(tenant_members.role)와 1:1 대응.
enum UserRole {
  director,
  teacher,
  student,
  parent;

  static UserRole fromString(String value) => switch (value) {
        'director' => UserRole.director,
        'teacher' => UserRole.teacher,
        'student' => UserRole.student,
        'parent' => UserRole.parent,
        _ => UserRole.student,
      };

  String get label => switch (this) {
        UserRole.director => '원장',
        UserRole.teacher => '선생님',
        UserRole.student => '학생',
        UserRole.parent => '학부모',
      };
}
