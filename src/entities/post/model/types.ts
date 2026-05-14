import type { Post, PostComment, Profile } from '@/shared/types/database';

export type { Post, PostComment, PostCategory } from '@/shared/types/database';
export type PostWithAuthor = Post & { author: Profile | null };
export type CommentWithAuthor = PostComment & { author: Profile | null };
