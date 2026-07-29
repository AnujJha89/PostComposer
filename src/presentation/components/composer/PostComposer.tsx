

import { useEffect } from 'react';
import { Send, Save, RotateCcw, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  setComposerTitle,
  setComposerContent,
  resetComposer,
  createPostThunk,
  updatePostThunk,
  schedulePostThunk,
  selectComposer,
  selectIsSubmitting,
  selectSubmitError,
  selectSubmitSuccess,
  clearSubmitError,
  clearSubmitSuccess,
} from '../../../store/slices/postSlice';
import { selectCurrentUser } from '../../../store/slices/authSlice';
import { PlatformSelector } from './PlatformSelector';
import { ValidationMatrix } from './ValidationMatrix';
import { MediaUploader } from './MediaUploader';
import { ScheduleTimePicker } from './ScheduleTimePicker';
import { PUBLISH_NOW_SENTINEL } from '../../../domain/value-objects/ScheduleTime';
import { motion } from 'framer-motion';

export function PostComposer() {
  const dispatch = useAppDispatch();
  const composer = useAppSelector(selectComposer);
  const user = useAppSelector(selectCurrentUser);
  const isSubmitting = useAppSelector(selectIsSubmitting);
  const submitError = useAppSelector(selectSubmitError);
  const submitSuccess = useAppSelector(selectSubmitSuccess);

  const isEditing = !!composer.id;
  const canSubmit = !isSubmitting && composer.platforms.length > 0 && composer.title.trim().length > 0 && composer.content.trim().length > 0;
  const hasViolations = composer.violations.length > 0;

  useEffect(() => {
    if (submitSuccess) {
      const t = setTimeout(() => dispatch(clearSubmitSuccess()), 4000);
      return () => clearTimeout(t);
    }
  }, [submitSuccess, dispatch]);

  const handleSaveDraft = async () => {
    if (!user.userId) return;
    if (isEditing) {
      await dispatch(updatePostThunk({
        postId: composer.id!,
        authorId: user.userId,
        title: composer.title,
        content: composer.content,
        platforms: composer.platforms,
        mediaFiles: composer.mediaFiles,
        scheduleTime: PUBLISH_NOW_SENTINEL,
      }));
    } else {
      await dispatch(createPostThunk({
        authorId: user.userId,
        title: composer.title,
        content: composer.content,
        platforms: composer.platforms,
        mediaFiles: composer.mediaFiles,
        scheduleTime: PUBLISH_NOW_SENTINEL,
      }));
    }
  };

  const handleSchedule = async () => {
    if (!user.userId || hasViolations) return;
    if (isEditing) {
      
      const result = await dispatch(updatePostThunk({
        postId: composer.id!,
        authorId: user.userId,
        title: composer.title,
        content: composer.content,
        platforms: composer.platforms,
        mediaFiles: composer.mediaFiles,
        scheduleTime: composer.scheduleTime,
      }));
      if (updatePostThunk.fulfilled.match(result)) {
        await dispatch(schedulePostThunk({ postId: composer.id!, requesterId: user.userId }));
      }
    } else {
      const result = await dispatch(createPostThunk({
        authorId: user.userId,
        title: composer.title,
        content: composer.content,
        platforms: composer.platforms,
        mediaFiles: composer.mediaFiles,
        scheduleTime: composer.scheduleTime,
      }));
      if (createPostThunk.fulfilled.match(result)) {
        await dispatch(schedulePostThunk({ postId: result.payload.id, requesterId: user.userId }));
      }
    }
  };

  return (
    <div className="composer-layout animate-fade-in">
      {}
      <div className="composer-form">
        {submitSuccess && (
          <div className="alert alert--success">
            <CheckCircle size={16} className="alert__icon" />
            <div className="alert__content">{submitSuccess}</div>
            <button className="alert__close" onClick={() => dispatch(clearSubmitSuccess())}><X size={14} /></button>
          </div>
        )}
        {submitError && (
          <div className="alert alert--error">
            <AlertCircle size={16} className="alert__icon" />
            <div className="alert__content">
              <div className="alert__title">Submission Failed</div>
              {submitError}
            </div>
            <button className="alert__close" onClick={() => dispatch(clearSubmitError())}><X size={14} /></button>
          </div>
        )}

        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="form-group">
            <label htmlFor="post-title" className="form-label">Post Title</label>
            <input
              id="post-title"
              type="text"
              className="form-input"
              placeholder="Give your post a clear title..."
              value={composer.title}
              onChange={(e) => dispatch(setComposerTitle(e.target.value))}
              maxLength={200}
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label htmlFor="post-content" className="form-label">
              Content
              <span style={{ marginLeft: '8px' }}>
                {composer.content.length} characters
              </span>
            </label>
            <textarea
              id="post-content"
              className={`form-textarea${hasViolations ? ' error' : ''}`}
              placeholder="Write your post content here... Character limits will be checked per platform."
              value={composer.content}
              onChange={(e) => dispatch(setComposerContent(e.target.value))}
              rows={8}
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <PlatformSelector />
          </div>

          <div style={{ marginTop: '16px' }}>
            <MediaUploader />
          </div>

          <div className="composer-actions">
            <button
              id="btn-reset-composer"
              type="button"
              className="btn btn--ghost"
              onClick={() => dispatch(resetComposer())}
              disabled={isSubmitting}
            >
              <RotateCcw size={14} />
              {isEditing ? 'Cancel Edit' : 'Clear'}
            </button>
            <button
              id="btn-save-draft"
              type="button"
              className={`btn btn--secondary${isSubmitting ? ' btn--loading' : ''}`}
              onClick={handleSaveDraft}
              disabled={!canSubmit}
            >
              <Save size={14} />
              {isEditing ? 'Save Changes' : 'Save Draft'}
            </button>
            <button
              id="btn-schedule-post"
              type="button"
              className={`btn btn--publish${isSubmitting ? ' btn--loading' : ''}`}
              onClick={handleSchedule}
              disabled={!canSubmit || hasViolations}
              title={hasViolations ? 'Fix platform violations before scheduling' : ''}
            >
              {composer.scheduleTime === PUBLISH_NOW_SENTINEL ? 'Publish Now' : 'Schedule Post'}
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="composer-sidebar"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ScheduleTimePicker />
        <ValidationMatrix />
        {hasViolations && (
          <div className="alert alert--warning" style={{ fontSize: '12px' }}>
            <AlertCircle size={14} className="alert__icon" />
            <div className="alert__content">
              Fix all violations before scheduling or publishing.
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
