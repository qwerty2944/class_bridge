import type { ProgressRecord, Subject } from '@/shared/types/database';

export type { ProgressRecord } from '@/shared/types/database';
export type ProgressWithSubject = ProgressRecord & { subject: Subject | null };
