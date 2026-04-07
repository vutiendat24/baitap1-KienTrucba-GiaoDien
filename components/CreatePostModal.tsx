'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, imageUrl?: string) => Promise<void>;
  isLoading?: boolean;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreatePostModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Please write something');
      return;
    }

    try {
      await onSubmit(content, imageUrl || undefined);
      setContent('');
      setImageUrl('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-xl font-bold text-foreground">Create Post</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User Preview */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {user?.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-semibold text-foreground">{user?.username}</span>
          </div>

          {/* Content */}
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-32 p-4 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            disabled={isLoading}
          />

          {/* Image URL */}
          <div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <ImageIcon className="w-4 h-4" />
              Image URL (optional)
            </label>
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="relative rounded-lg overflow-hidden max-h-48">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setError('Invalid image URL')}
              />
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
