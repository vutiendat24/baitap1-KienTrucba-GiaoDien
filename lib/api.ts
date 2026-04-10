import {
  User,
  Post,
  Comment,
  CreateTextPostRequest,
  CreateImagePostRequest,
  CreateMixedPostRequest,
  CreateCommentRequest,
  ReplyCommentRequest,
  UpdateCommentRequest,
  AuthResponse,
  LikeResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/mangxahoi/api';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Try getting token from localStorage for authentication if needed
  let token = undefined;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as any,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    headers,
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `API error: ${response.status}`;
    try {
        const errorBody = await response.json();
        // Backend returns { "error": "..." } format
        errorMessage = errorBody.error || errorBody.message || errorMessage;
    } catch (e) {
        // ignore parse errors
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Auth APIs
export const authAPI = {
  register: (data: { username: string; email: string; password: string; confirmPassword: string; fullName: string }) =>
    apiCall<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { usernameOrEmail: string; password: string }) =>
    apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: (userId: number) =>
    apiCall<User>(`/auth/profile/${userId}`, {
      method: 'GET',
    }),

  updateProfile: (userId: number, queryParams: string) =>
    apiCall<User>(`/auth/profile/${userId}?${queryParams}`, {
      method: 'PUT',
    }),

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      if (userId) {
         return authAPI.getProfile(parseInt(userId));
      }
    }
    return Promise.reject(new Error("No user stored"));
  },

  logout: () => {
    if (typeof window !== 'undefined') {
       localStorage.removeItem('token');
       localStorage.removeItem('userId');
    }
    return Promise.resolve({ message: "Logged out" });
  }
};

// Post APIs
export const postAPI = {
  create: (data: CreateTextPostRequest | CreateImagePostRequest | CreateMixedPostRequest) =>
    apiCall<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createTextPost: (data: CreateTextPostRequest) =>
    apiCall<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createImagePost: (data: CreateImagePostRequest) =>
    apiCall<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createMixedPost: (data: CreateMixedPostRequest) =>
    apiCall<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (page: number = 1, size: number = 10) =>
    apiCall<Post[]>(`/posts?page=${page}&size=${size}`, {
      method: 'GET',
    }),

  getById: (id: number) =>
    apiCall<Post>(`/posts/${id}`, {
      method: 'GET',
    }),

  update: (id: number, data: { authorId: number; content: string }) =>
    apiCall<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number, authorId: number) =>
    apiCall<{ message: string }>(`/posts/${id}?authorId=${authorId}`, {
      method: 'DELETE',
    }),
};

// Comment APIs
export const commentAPI = {
  create: (postId: number, data: CreateCommentRequest) =>
    apiCall<Comment>(`/comments/post/${postId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  reply: (commentId: number, data: ReplyCommentRequest) =>
    apiCall<Comment>(`/comments/reply/${commentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByPostId: (postId: number) =>
    apiCall<Comment[]>(`/comments/post/${postId}`, {
      method: 'GET',
    }),

  update: (commentId: number, data: UpdateCommentRequest) =>
    apiCall<Comment>(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (commentId: number, authorId: number) =>
    apiCall<{ status: string }>(`/comments/${commentId}?authorId=${authorId}`, {
      method: 'DELETE',
    }),

  getCount: (postId: number) =>
    apiCall<{ postId: number; commentCount: number }>(`/comments/post/${postId}/count`, {
      method: 'GET',
    }),
};

// Like APIs
export const likeAPI = {
  togglePostLike: (postId: number, userId: number) =>
    apiCall<LikeResponse>(`/likes/post/${postId}?userId=${userId}`, {
      method: 'POST',
    }),

  toggleCommentLike: (commentId: number, userId: number) =>
    apiCall<LikeResponse>(`/likes/comment/${commentId}?userId=${userId}`, {
      method: 'POST',
    }),
};

// User APIs (alias for auth profile endpoints)
export const userAPI = {
  getById: (id: number) => authAPI.getProfile(id),
  update: (id: number, data: { fullName?: string; bio?: string; avatarUrl?: string }) => {
     let params = new URLSearchParams();
     if (data.fullName) params.append('fullName', data.fullName);
     if (data.bio) params.append('bio', data.bio);
     if (data.avatarUrl) params.append('avatarUrl', data.avatarUrl);
     return authAPI.updateProfile(id, params.toString());
  }
};
