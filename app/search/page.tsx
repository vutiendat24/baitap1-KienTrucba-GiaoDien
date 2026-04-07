'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { postAPI, likeAPI } from '@/lib/api';
import { Post, User } from '@/types';
import Navigation from '@/components/Navigation';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const query = searchParams.get('q') || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts');

  useEffect(() => {
    if (!query) {
      router.push('/feed');
      return;
    }

    const search = async () => {
      try {
        setIsLoading(true);
        const result = await postAPI.search(query);
        setPosts(Array.isArray(result.posts) ? result.posts : []);
        setUsers(Array.isArray(result.users) ? result.users : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [query, router]);

  const handleLike = async (postId: number) => {
    if (!currentUser) return;
    try {
      await likeAPI.likePost(postId, currentUser.userId);
      setPosts(
        posts.map((post) =>
          post.postId === postId
            ? { ...post, isLiked: true, likeCount: post.likeCount + 1 }
            : post
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post');
    }
  };

  const handleUnlike = async (postId: number) => {
    if (!currentUser) return;
    try {
      await likeAPI.likePost(postId, currentUser.userId);
      setPosts(
        posts.map((post) =>
          post.postId === postId
            ? { ...post, isLiked: false, likeCount: Math.max(0, post.likeCount - 1) }
            : post
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlike post');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Search Results</h1>
          <p className="text-muted-foreground">
            Results for &quot;<span className="font-semibold">{query}</span>&quot;
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'posts'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Users ({users.length})
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Searching...</p>
          </div>
        ) : activeTab === 'posts' ? (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  onLike={() => handleLike(post.postId)}
                  onUnlike={() => handleUnlike(post.postId)}
                />
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              users.map((user) => {
                const username = user.username || "Unknown";
                return (
                 <Link
                   key={user.userId}
                   href={`/profile/${user.userId}`}
                   className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                 >
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                       <span className="text-sm font-bold text-primary">
                         {username.charAt(0).toUpperCase()}
                       </span>
                     </div>
                     <div>
                       <h3 className="font-semibold text-foreground hover:text-primary">
                         {username}
                       </h3>
                       <p className="text-sm text-muted-foreground">{user.email}</p>
                       {user.bio && <p className="text-sm text-foreground mt-1">{user.bio}</p>}
                     </div>
                   </div>
                 </Link>
               )})
            )}
          </div>
        )}
      </div>
    </div>
  );
}
