import { useCallback, useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { Navbar } from './components/Navbar.tsx';
import { PostDetailModal } from './components/PostDetailModal.tsx';
import { PublicHome } from './components/PublicHome.tsx';
import type { PostItem } from './shared/types.ts';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'admin'>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      return 'admin';
    }
    return 'home';
  });
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [preselectedService, setPreselectedService] = useState<string>('');

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = (await res.json()) as { posts: PostItem[] };
        setPosts(data.posts);
      }
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  function handleNavigateView(view: 'home' | 'admin', sectionId?: string) {
    setActiveView(view);
    if (typeof window !== 'undefined') {
      const nextUrl = view === 'admin' ? '/admin' : '/';
      if (window.location.pathname !== nextUrl) {
        window.history.pushState({}, '', nextUrl);
      }
    }
    if (view === 'home' && sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else if (view === 'admin') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  useEffect(() => {
    const onPopState = () => {
      setActiveView(window.location.pathname.startsWith('/admin') ? 'admin' : 'home');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function handleRequestWebApp(post: PostItem) {
    setSelectedPost(null);
    setPreselectedService(post.title);
    handleNavigateView('home', 'tu-van');
  }

  function handleDownloadTracked(postId: string, newCount: number) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, downloads: newCount } : p)),
    );
    setSelectedPost((prev) =>
      prev && prev.id === postId ? { ...prev, downloads: newCount } : prev,
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar activeView={activeView} onNavigateView={handleNavigateView} />

      <div className="flex-1">
        {activeView === 'home' ? (
          <PublicHome
            posts={posts}
            loading={loadingPosts}
            onSelectPost={setSelectedPost}
            preselectedService={preselectedService}
            onClearPreselectedService={() => setPreselectedService('')}
            onOpenAdmin={() => handleNavigateView('admin')}
          />
        ) : (
          <AdminDashboard
            onPostsChanged={fetchPosts}
            onBackHome={() => handleNavigateView('home', 'top')}
            onPreviewPost={(post) => setSelectedPost(post)}
          />
        )}
      </div>

      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onRequestWebApp={handleRequestWebApp}
        onDownloadTracked={handleDownloadTracked}
      />
    </div>
  );
}
