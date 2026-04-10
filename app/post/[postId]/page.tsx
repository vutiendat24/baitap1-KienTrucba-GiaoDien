'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { postAPI, commentAPI, likeAPI } from '@/lib/api';
import { Post, Comment } from '@/types';
import Navigation from '@/components/Navigation';
import PostCard from '@/components/PostCard';
import CommentSection from '@/components/CommentSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const postIdStr = params.postId as string;
  const postId = parseInt(postIdStr, 10);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNaN(postId)) return;

    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const postData = await postAPI.getById(postId);
        setPost(postData);

        const commentsData = await commentAPI.getByPostId(postId);
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleToggleLikePost = async () => {
    if (!post || !user) return;
    try {
      const result = await likeAPI.togglePostLike(post.postId, user.userId);
      setPost((prev) =>
        prev
          ? { 
              ...prev, 
              isLiked: result.liked, 
              likeCount: result.liked 
                ? prev.likeCount + 1 
                : Math.max(0, prev.likeCount - 1) 
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle like');
    }
  };

  const handleAddComment = async (content: string, parentCommentId?: number) => {
    if (!user) return;
    try {
      if (parentCommentId) {
        await commentAPI.reply(parentCommentId, {
          authorId: user.userId,
          postId: postId,
          content,
        });
        // Reload all comments to get proper nesting
        const commentsData = await commentAPI.getByPostId(postId);
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } else {
        const newComment = await commentAPI.create(postId, {
          authorId: user.userId,
          content,
        });
        setComments([...comments, newComment]);
      }
      if (post) {
        setPost({ ...post, commentCount: post.commentCount + 1 });
      }
    } catch (err) {
      throw err;
    }
  };

  const handleToggleLikeComment = async (commentId: number) => {
    if (!user) return;
    try {
      const result = await likeAPI.toggleCommentLike(commentId, user.userId);
      // Update comment like state using response
      const updateCommentLike = (commentList: Comment[]): Comment[] => {
        return commentList.map((comment) => {
          if (comment.commentId === commentId) {
            return { 
              ...comment, 
              isLiked: result.liked, 
              likeCount: result.liked 
                ? comment.likeCount + 1 
                : Math.max(0, comment.likeCount - 1) 
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: updateCommentLike(comment.replies) };
          }
          return comment;
        });
      };
      setComments(updateCommentLike(comments));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle comment like');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user) return;
    if (!confirm('Delete this comment?')) return;

    try {
      await commentAPI.delete(commentId, user.userId);
      // Remove from list (also check nested replies)
      const removeComment = (commentList: Comment[]): Comment[] => {
        return commentList
          .filter((c) => c.commentId !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies ? removeComment(c.replies) : [],
          }));
      };
      setComments(removeComment(comments));
      if (post) {
        setPost({ ...post, commentCount: Math.max(0, post.commentCount - 1) });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  const handleDeletePost = async () => {
    if (!user) return;
    if (!confirm('Delete this post?')) return;
    try {
      await postAPI.delete(postId, user.userId);
      router.push('/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
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
          <p className="text-center text-destructive">{error || 'Post not found'}</p>
        </div>
      </div>
    );
  }

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

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Post */}
        <PostCard
          post={post}
          onLike={handleToggleLikePost}
          onUnlike={handleToggleLikePost}
          onDelete={user?.userId === post.authorId ? handleDeletePost : undefined}
        />

        {/* Comments Section */}
        <div className="mt-8">
          <CommentSection
            postId={postId}
            comments={comments}
            onAddComment={handleAddComment}
            onLikeComment={handleToggleLikeComment}
            onUnlikeComment={handleToggleLikeComment}
            onDeleteComment={handleDeleteComment}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
