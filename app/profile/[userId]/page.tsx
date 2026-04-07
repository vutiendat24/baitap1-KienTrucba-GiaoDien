'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, postAPI, likeAPI } from '@/lib/api';
import { User, Post } from '@/types';
import Navigation from '@/components/Navigation';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userIdStr = params.userId as string;
  const userId = parseInt(userIdStr, 10);

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNaN(userId)) return;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const userData = await userAPI.getById(userId);
        setUser(userData);

        const userPosts = await postAPI.getUserPosts(userId);
        setPosts(Array.isArray(userPosts) ? userPosts : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

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

  const handleDeletePost = async (postId: number) => {
    if (!currentUser) return;
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await postAPI.delete(postId, currentUser.userId);
      setPosts(posts.filter((post) => post.postId !== postId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <p className="text-center text-destructive">{error || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  const username = user.username || "Unknown";

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

        {/* Profile Header */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-primary">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">{username}</h1>
              <p className="text-muted-foreground mb-4">{user.email}</p>
              {user.bio && <p className="text-foreground">{user.bio}</p>}
              {currentUser?.userId === user.userId && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push(`/profile/${user.userId}/edit`)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Posts</h2>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.postId}
                post={post}
                onLike={() => handleLike(post.postId)}
                onUnlike={() => handleUnlike(post.postId)}
                onDelete={currentUser?.userId === user.userId ? handleDeletePost : undefined}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
