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
  SearchResult,
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
    headers['Authorization'] = `Bearer ${token}`; // Assuming Bearer token auth if present
  }

  const response = await fetch(url, {
    headers,
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `API error: ${response.status}`;
    try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
    } catch (e) {
        // ignore
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
  register: (data: any) =>
    apiCall<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: any) =>
    apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: (userId: number) =>
    apiCall<User>(`/auth/profile/${userId}`, {
      method: 'GET',
    }),

  updateProfile: (userId: number, queryParams: string) => // ex: fullName=Dat&bio=Hello&avatarUrl=img.png
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
  createTextPost: (data: CreateTextPostRequest) =>
    apiCall<Post>('/posts/text', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createImagePost: (data: CreateImagePostRequest) =>
    apiCall<Post>('/posts/image', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createMixedPost: (data: CreateMixedPostRequest) =>
    apiCall<Post>('/posts/mixed', {
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

  getUserPosts: (userId: number, page: number = 1, size: number = 10) =>
    apiCall<Post[]>(`/posts/user/${userId}?page=${page}&size=${size}`, {
      method: 'GET',
    }),

  delete: (id: number, authorId: number) =>
    apiCall<{ message: string }>(`/posts/${id}?authorId=${authorId}`, {
      method: 'DELETE',
    }),

  search: (query: string) =>
    apiCall<SearchResult>(`/posts/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
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

  getByPostId: (postId: number, page: number = 1, size: number = 10) =>
    apiCall<Comment[]>(`/comments/post/${postId}?page=${page}&size=${size}`, {
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
  likePost: (postId: number, userId: number) =>
    apiCall<LikeResponse>(`/likes/post/${postId}?userId=${userId}`, {
      method: 'POST',
    }),

  likeComment: (commentId: number, userId: number) =>
    apiCall<LikeResponse>(`/likes/comment/${commentId}?userId=${userId}`, {
      method: 'POST',
    }),
};

// User APIs
export const userAPI = {
  getById: (id: number) => authAPI.getProfile(id),
  getProfile: (username: string) => authAPI.getProfile(1),
  update: (id: number, data: any) => {
     let params = new URLSearchParams();
     if (data.fullName) params.append('fullName', data.fullName);
     if (data.bio) params.append('bio', data.bio);
     if (data.avatarUrl) params.append('avatarUrl', data.avatarUrl);
     return authAPI.updateProfile(id, params.toString());
  }
};
