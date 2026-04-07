'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { postAPI, likeAPI } from '@/lib/api';
import { Post } from '@/types';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

export default function FeedPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Fetch posts
  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const responseList = await postAPI.getAll(page, 10);
        const validList = Array.isArray(responseList) ? responseList : [];
        if (page === 1) {
          setPosts(validList);
        } else {
          setPosts((prev) => [...prev, ...validList]);
        }
        setHasMore(validList.length === 10);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user, page]);

  const handleCreatePost = async (content: string, imageUrl?: string) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      let newPost;
      if (imageUrl) {
        newPost = await postAPI.createImagePost({ 
           authorId: user.userId, 
           imageUrls: [imageUrl],
           imageNames: ["image"],
           mimeTypes: ["image/jpeg"],
           captions: [""],
           visibility: "PUBLIC"
        });
      } else {
        newPost = await postAPI.createTextPost({ 
           authorId: user.userId, 
           content,
           visibility: "PUBLIC"
        });
      }
      setPosts([newPost, ...posts]);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!user) return;
    try {
      await likeAPI.likePost(postId, user.userId);
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
    if (!user) return;
    try {
      // API Details says Thích/Bỏ Thích dùng chung 1 endpoint POST /likes/post/{postId} và toggle trạng thái
      // Nhưng frontend component chia thành like/unlike. Ta cũng gọi likeAPI.likePost
      await likeAPI.likePost(postId, user.userId);
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
    if (!user) return;
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await postAPI.delete(postId, user.userId);
      setPosts(posts.filter((post) => post.postId !== postId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const handleEditPost = (post: Post) => {
    // TODO: Implement edit functionality
    console.log('Edit post:', post);
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Create Post Button */}
        <div className="mb-8">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full bg-primary hover:bg-primary/90 h-12 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create a post
          </Button>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {isLoading && posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.postId}
                post={post}
                onLike={() => handleLike(post.postId)}
                onUnlike={() => handleUnlike(post.postId)}
                onDelete={() => handleDeletePost(post.postId)}
                onEdit={() => handleEditPost(post)}
              />
            ))
          )}

          {/* Load More */}
          {hasMore && !isLoading && posts.length > 0 && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                className="px-8"
              >
                Load More Posts
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
        isLoading={isSubmitting}
      />
    </div>
  );
}
