'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { postAPI, likeAPI } from '@/lib/api';
import { Post } from '@/types';
import Navigation from '@/components/Navigation';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const query = searchParams.get('q') || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) {
      router.push('/feed');
      return;
    }

    const search = async () => {
      try {
        setIsLoading(true);
        // Backend does not have a search endpoint. 
        // We fetch all posts and filter client-side by content/author matching the query.
        const allPosts = await postAPI.getAll(1, 100);
        const validPosts = Array.isArray(allPosts) ? allPosts : [];
        const lowerQuery = query.toLowerCase();
        const filtered = validPosts.filter((post) => 
          (post.content && post.content.toLowerCase().includes(lowerQuery)) ||
          (post.authorUsername && post.authorUsername.toLowerCase().includes(lowerQuery))
        );
        setPosts(filtered);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [query, router]);

  const handleToggleLike = async (postId: number) => {
    if (!currentUser) return;
    try {
      const result = await likeAPI.togglePostLike(postId, currentUser.userId);
      setPosts(
        posts.map((post) =>
          post.postId === postId
            ? { 
                ...post, 
                isLiked: result.liked, 
                likeCount: result.liked 
                  ? post.likeCount + 1 
                  : Math.max(0, post.likeCount - 1) 
              }
            : post
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle like');
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

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Searching...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">{posts.length} post(s) found</p>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  onLike={() => handleToggleLike(post.postId)}
                  onUnlike={() => handleToggleLike(post.postId)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
