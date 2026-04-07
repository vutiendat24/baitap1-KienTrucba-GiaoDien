'use client';

import { useState } from 'react';
import { Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import CommentCard from './CommentCard';
import { Send } from 'lucide-react';

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
  onAddComment: (content: string, parentCommentId?: number) => Promise<void>;
  onLikeComment: (commentId: number) => Promise<void>;
  onUnlikeComment: (commentId: number) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function CommentSection({
  postId,
  comments,
  onAddComment,
  onLikeComment,
  onUnlikeComment,
  onDeleteComment,
  isLoading,
  error,
}: CommentSectionProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!commentText.trim()) {
      setLocalError('Please write a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddComment(commentText, replyingTo || undefined);
      setCommentText('');
      setReplyingTo(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <p className="text-muted-foreground">Sign in to comment</p>
      </div>
    );
  }

  const username = user.username || "Unknown";

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-foreground">{username}</p>
            {replyingTo && (
              <p className="text-xs text-muted-foreground mt-1">
                Replying to comment{' '}
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-primary hover:underline"
                >
                  (cancel)
                </button>
              </p>
            )}
          </div>
        </div>

        <textarea
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full min-h-20 p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none mb-4"
          disabled={isSubmitting || isLoading}
        />

        {(localError || error) && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4">
            <p className="text-destructive text-sm">{localError || error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || isLoading || !commentText.trim()}
            className="bg-primary hover:bg-primary/90"
            size="sm"
          >
            <Send className="w-4 h-4 mr-2" />
            Comment
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">
          Comments ({comments.length})
        </h3>
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-sm">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.commentId} className="border border-border rounded-lg p-4">
              <CommentCard
                comment={comment}
                postId={postId}
                onLike={onLikeComment}
                onUnlike={onUnlikeComment}
                onDelete={onDeleteComment}
                onReply={(parentCommentId) => setReplyingTo(parentCommentId)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
