// User types
export interface UserResponse {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
  token?: string;
}

export type User = UserResponse;

export interface AuthResponse extends UserResponse {}

// Post types
export interface ImageResponse {
  imageId: number;
  imageUrl: string;
  imageName: string;
  mimeType: string;
  imageOrder: number;
  caption: string;
}

export interface PostResponse {
  postId: number;
  authorId: number;
  authorUsername: string;
  authorAvatarUrl: string;
  content: string;
  postType: 'TEXT' | 'IMAGE' | 'MIXED';
  likeCount: number;
  commentCount: number;
  visibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
  createdAt: string;
  updatedAt: string;
  images: ImageResponse[];
  // For frontend state (like optimitic updates)
  isLiked?: boolean;
}

export type Post = PostResponse;

export interface CreateTextPostRequest {
  authorId: number;
  content: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
}

export interface CreateImagePostRequest {
  authorId: number;
  imageUrls: string[];
  imageNames: string[];
  mimeTypes: string[];
  captions: string[];
  visibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
}

export interface CreateMixedPostRequest {
  authorId: number;
  content: string;
  imageUrls: string[];
  imageNames: string[];
  mimeTypes: string[];
  captions: string[];
  visibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
}

// Comment types
export interface CommentResponse {
  commentId: number;
  postId: number;
  authorId: number;
  authorUsername: string;
  authorAvatarUrl: string;
  content: string;
  parentCommentId: number | null;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  replies: CommentResponse[];
  // For frontend state
  isLiked?: boolean;
}

export type Comment = CommentResponse;

export interface CreateCommentRequest {
  authorId: number;
  content: string;
}

export interface ReplyCommentRequest {
  authorId: number;
  postId: number;
  content: string;
}

export interface UpdateCommentRequest {
  authorId: number;
  content: string;
}

// Like types
export interface LikeResponse {
  postId?: number;
  commentId?: number;
  liked: boolean;
}

// Pagination (backend returns plain arrays, this is for future use)
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}
