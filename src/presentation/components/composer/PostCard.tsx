

import { Pencil, Trash2, Calendar, Clock, CheckCircle, XCircle, Paperclip } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { deletePostThunk, loadPostIntoComposer } from '../../../store/slices/postSlice';
import { selectCurrentUser } from '../../../store/slices/authSlice';
import type { PostResponseDTO } from '../../../application/dtos';
import { Platform } from '../../../domain/value-objects/Platform';
import { useNavigate } from 'react-router-dom';
import { PlatformIcon, PLATFORM_META } from '../common/PlatformIcons';
import { motion } from 'framer-motion';

interface PostCardProps {
  post: PostResponseDTO;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; Icon: any }> = {
  DRAFT: { label: 'Draft', cls: 'badge--draft', Icon: Clock },
  SCHEDULED: { label: 'Scheduled', cls: 'badge--scheduled', Icon: Calendar },
  PUBLISHED: { label: 'Published', cls: 'badge--published', Icon: CheckCircle },
  FAILED: { label: 'Failed', cls: 'badge--failed', Icon: XCircle },
  DELETED: { label: 'Deleted', cls: 'badge--deleted', Icon: XCircle },
};

export function PostCard({ post }: PostCardProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const statusCfg = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.DRAFT;
  const StatusIcon = statusCfg.Icon;

  const handleEdit = () => {
    dispatch(loadPostIntoComposer(post));
    navigate('/compose');
  };

  const handleDelete = () => {
    if (!user.userId) return;
    if (window.confirm(`Delete "${post.title}"? This action is reversible only via data restore.`)) {
      dispatch(deletePostThunk({ postId: post.id, requesterId: user.userId }));
    }
  };

  const canEdit = post.status !== 'PUBLISHED' && post.status !== 'DELETED';

  return (
    <motion.div 
      className="card card--hover post-card animate-fade-in" 
      id={`post-card-${post.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
    >
      <div className="post-card__meta">
        <span className={`badge ${statusCfg.cls}`}>
          <StatusIcon size={10} />
          {statusCfg.label}
        </span>
        {post.platforms.map((p) => (
          <span
            key={p}
            className={`platform-badge platform-badge--${p.toLowerCase()}`}
          >
            <PlatformIcon platform={p} size={10} />
            {PLATFORM_META[p]?.label ?? p}
          </span>
        ))}
      </div>

      <h3 className="post-card__title">{post.title}</h3>
      <p className="post-card__preview">{post.contentPreview}</p>

      {post.mediaFiles.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {post.mediaFiles.map((f) => (
            <span key={f.id} className="badge badge--draft" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Paperclip size={10} /> {f.fileName.length > 20 ? f.fileName.slice(0, 20) + '...' : f.fileName}
            </span>
          ))}
        </div>
      )}

      <div className="post-card__footer">
        <div className="post-card__time">
          <Calendar size={12} />
          {post.scheduleTimeLabel}
        </div>
        <div className="post-card__actions">
          {canEdit && (
            <button
              id={`btn-edit-${post.id}`}
              className="btn btn--ghost btn--sm"
              onClick={handleEdit}
              title="Edit post"
            >
              <Pencil size={13} />
              Edit
            </button>
          )}
          {canEdit && (
            <button
              id={`btn-delete-${post.id}`}
              className="btn btn--danger btn--sm"
              onClick={handleDelete}
              title="Delete post"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {post.failureReason && (
        <div className="alert alert--error" style={{ padding: '8px 12px', marginTop: '8px' }}>
          <XCircle size={12} />
          <span style={{ fontSize: '11px' }}>{post.failureReason}</span>
        </div>
      )}
    </motion.div>
  );
}
