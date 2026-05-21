import type { Profile, Quiz, QuizScore, Subject } from '@/shared/types/database';

export type { Quiz, QuizScore, QuizXpRule } from '@/shared/types/database';

export type QuizWithSubject = Quiz & { subject: Subject | null };
export type QuizScoreWithStudent = QuizScore & { student: Profile | null };
