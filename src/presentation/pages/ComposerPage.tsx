

import { Sidebar } from '../components/common/Sidebar';
import { TopBar } from '../components/common/TopBar';
import { PostComposer } from '../components/composer/PostComposer';
import { useAppSelector } from '../../store/hooks';
import { selectComposer } from '../../store/slices/postSlice';

export function ComposerPage() {
  const composer = useAppSelector(selectComposer);
  const isEditing = !!composer.id;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <TopBar
          title={isEditing ? 'Edit Post' : 'Compose New Post'}
          subtitle={isEditing ? `Editing: "${composer.title || 'Untitled'}"` : 'Create and schedule content across all your platforms'}
        />
        <div className="page-content">
          <PostComposer />
        </div>
      </main>
    </div>
  );
}
