

import { useEffect, useState } from 'react';
import { PenLine, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { TopBar } from '../components/common/TopBar';
import { PostCard } from '../components/composer/PostCard';
import { EmptyState } from '../components/common/EmptyState';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPostsThunk, selectAllPosts, selectIsLoadingList, resetComposer, selectPostsByStatus } from '../../store/slices/postSlice';
import { selectCurrentUser, selectIsAdmin } from '../../store/slices/authSlice';
import type { PostResponseDTO } from '../../application/dtos';

type FilterStatus = 'ALL' | 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';

export function ScheduledPostsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const posts = useAppSelector(selectAllPosts);
  const isLoading = useAppSelector(selectIsLoadingList);
  const [filter, setFilter] = useState<FilterStatus>('ALL');

  useEffect(() => {
    if (user.userId) {
      dispatch(fetchPostsThunk({ authorId: user.userId, isAdmin: !!isAdmin }));
    }
  }, [dispatch, user.userId, isAdmin]);

  const filteredPosts = useAppSelector((state) => selectPostsByStatus(state, filter));

  const handleNewPost = () => {
    dispatch(resetComposer());
    navigate('/compose');
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <TopBar
          title="Posts"
          subtitle={`${posts.length} total post${posts.length !== 1 ? 's' : ''}`}
          actions={
            <button id="btn-new-post-from-list" className="btn btn--primary" onClick={handleNewPost}>
              <PenLine size={14} />
              New Post
            </button>
          }
        />
        <div className="page-content">
          {}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {(['ALL', 'DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED'] as FilterStatus[]).map((s) => (
              <button
                key={s}
                id={`filter-tab-${s.toLowerCase()}`}
                className={`btn btn--sm ${filter === s ? 'btn--primary' : 'btn--secondary'}`}
                onClick={() => setFilter(s)}
              >
                <Filter size={12} />
                {s === 'ALL' ? 'All Posts' : s.charAt(0) + s.slice(1).toLowerCase()}
                {s !== 'ALL' && (
                  <span style={{
                    marginLeft: '4px',
                    background: filter === s ? 'rgba(255,255,255,0.25)' : 'var(--color-bg-subtle)',
                    color: filter === s ? '#fff' : 'var(--color-text-tertiary)',
                    borderRadius: '9999px',
                    padding: '1px 6px',
                    fontSize: '10px',
                  }}>
                    {posts.filter((p) => p.status === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="loading-overlay">
              <div className="spinner" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState
              variant="posts"
              title="No posts here yet"
              description={
                filter === 'ALL'
                  ? "Start composing your first post. You can schedule it for any platform in seconds."
                  : `No posts with status "${filter.toLowerCase()}".`
              }
              action={
                filter === 'ALL' ? (
                  <button id="btn-empty-new-post" className="btn btn--primary btn--lg" onClick={handleNewPost}>
                    <PenLine size={16} />
                    Compose First Post
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="posts-grid">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
