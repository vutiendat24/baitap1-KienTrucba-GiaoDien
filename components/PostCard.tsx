'use client';

import { Post } from '@/types';
import { Heart, MessageCircle, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  onUnlike: (postId: number) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: number) => void;
  isDeleting?: boolean;
}

export default function PostCard({
  post,
  onLike,
  onUnlike,
  onEdit,
  onDelete,
  isDeleting,
}: PostCardProps) {
  const { user } = useAuth();
  const isAuthor = user?.userId === post.authorId;

  const handleLike = async () => {
    if (post.isLiked) {
      onUnlike(post.postId);
    } else {
      onLike(post.postId);
    }
  };

  const imageUrl = post.images && post.images.length > 0 ? post.images[0].imageUrl : null;
  const username = post.authorUsername || "Unknown";

  return (
    <article className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <Link
              href={`/profile/${post.authorId}`}
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              {username}
            </Link>
            <p className="text-xs text-muted-foreground" suppressHydrationWarning>
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
            </p>
          </div>
        </div>

        {isAuthor && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(post)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(post.postId)}
                disabled={isDeleting}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-foreground whitespace-pre-wrap break-words">{post.content}</p>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={post.images[0]?.caption || "Post image"}
            className="mt-4 rounded-lg max-h-96 w-full object-cover"
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4">
        <Link
          href={`/post/${post.postId}`}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.commentCount || 0} {(post.commentCount === 1) ? 'comment' : 'comments'}</span>
        </Link>

        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors ${
            post.isLiked ? 'text-primary' : 'hover:text-primary'
          }`}
        >
          <Heart
            className="w-4 h-4"
            fill={post.isLiked ? 'currentColor' : 'none'}
          />
          <span>{post.likeCount || 0} {(post.likeCount === 1) ? 'like' : 'likes'}</span>
        </button>
      </div>
    </article>
  );
}
