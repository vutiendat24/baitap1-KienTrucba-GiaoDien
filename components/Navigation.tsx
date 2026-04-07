'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, User, Search, Home } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/feed" className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
              S
            </div>
            <span>Social</span>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xs"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Nav Items */}
          <div className="flex items-center gap-4">
            {/* Mobile Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden text-muted-foreground hover:text-primary transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Home */}
            <Link
              href="/feed"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Home className="w-5 h-5" />
            </Link>

            {/* Profile */}
            <Link
              href={`/profile/${user?.userId}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <form onSubmit={handleSearch} className="mt-4 md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </nav>
  );
}
