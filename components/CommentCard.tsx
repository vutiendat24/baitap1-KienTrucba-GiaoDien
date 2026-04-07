'use client';

import { Comment } from '@/types';
import { Heart, MessageCircle, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface CommentCardProps {
  comment: Comment;
  postId: number;
  onLike: (commentId: number) => void;
  onUnlike: (commentId: number) => void;
  onDelete?: (commentId: number) => void;
  onReply?: (parentCommentId: number) => void;
  isDeleting?: boolean;
  level?: number;
}

export default function CommentCard({
  comment,
  postId,
  onLike,
  onUnlike,
  onDelete,
  onReply,
  isDeleting,
  level = 0,
}: CommentCardProps) {
  const { user } = useAuth();
  const isAuthor = user?.userId === comment.authorId;
  const [showReplies, setShowReplies] = useState(true);

  const handleLike = async () => {
    if (comment.isLiked) {
      onUnlike(comment.commentId);
    } else {
      onLike(comment.commentId);
    }
  };

  const username = comment.authorUsername || "Unknown";

  return (
    <div className={`${level > 0 ? 'ml-6 border-l-2 border-border pl-6' : ''}`}>
      <article className="py-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <Link
                href={`/profile/${comment.authorId}`}
                className="font-semibold text-sm text-foreground hover:text-primary transition-colors"
              >
                {username}
              </Link>
              <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Just now'}
              </p>
            </div>
          </div>

          {isAuthor && (
            <div className="flex gap-1">
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(comment.commentId)}
                  disabled={isDeleting}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-sm text-foreground">{comment.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors ${
              comment.isLiked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <Heart
              className="w-3 h-3"
              fill={comment.isLiked ? 'currentColor' : 'none'}
            />
            <span>{comment.likeCount || 0}</span>
          </button>

          {onReply && level < 2 && (
            <button
              onClick={() => onReply(comment.commentId)}
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              <span>Reply</span>
            </button>
          )}
        </div>
      </article>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && showReplies && (
        <div>
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.commentId}
              comment={reply}
              postId={postId}
              onLike={onLike}
              onUnlike={onUnlike}
              onDelete={onDelete}
              onReply={onReply}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
