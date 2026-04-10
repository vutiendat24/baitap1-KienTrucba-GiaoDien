'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/lib/api';
import { User } from '@/types';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userIdStr = params.userId as string;
  const userId = parseInt(userIdStr, 10);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNaN(userId)) return;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const userData = await userAPI.getById(userId);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

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
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-1">{username}</h1>
              <p className="text-lg font-semibold text-foreground mb-3">{user.fullName}</p>
              <p className="text-muted-foreground mb-2">{user.email}</p>
              {user.bio && <p className="text-foreground mb-3">{user.bio}</p>}
              <p className="text-xs text-muted-foreground">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
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
      </div>
    </div>
  );
}
