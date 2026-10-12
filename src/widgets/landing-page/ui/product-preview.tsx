'use client';

import { useTranslate } from '@tolgee/react';
import {
  ArrowUp,
  Check,
  Circle,
  Columns3,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  List,
  MoreHorizontal,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/shared/lib/cn';

const columns = [
  {
    id: 'toDo',
    tasks: [
      { id: 'taskOne', category: 'research', priority: 'normal' },
      { id: 'taskTwo', category: 'design', priority: 'high' },
    ],
  },
  {
    id: 'inProgress',
    tasks: [
      { id: 'taskThree', category: 'design', priority: 'high' },
      { id: 'taskFour', category: 'design', priority: 'normal' },
    ],
  },
  {
    id: 'done',
    tasks: [
      { id: 'taskFive', category: 'planning', priority: 'normal' },
      { id: 'taskSix', category: 'research', priority: 'normal' },
    ],
  },
];

export function ProductPreview({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslate();
  const [view, setView] = useState<'board' | 'list'>('board');

  return (
    <div
      className={cn('product-preview', compact && 'product-preview-compact')}
    >
      <aside className="preview-sidebar">
        <span className="preview-workspace">
          <span className="mini-mark" aria-hidden="true" />
          {t('preview.workspace')}
        </span>
        <span className="preview-team">{t('preview.team')}</span>
        <div className="preview-nav">
          <span>
            <LayoutDashboard />
            {t('preview.overview')}
          </span>
          <span className="preview-nav-active">
            <FolderKanban />
            {t('preview.projects')}
          </span>
          <span>
            <Inbox />
            {t('preview.inbox')}
          </span>
        </div>
        <div className="sidebar-bottom">
          <span className="status-dot" />
          TripleP
        </div>
      </aside>
      <div className="preview-main">
        <div className="preview-breadcrumb">
          <FolderKanban size={13} />
          <span>{t('preview.projects')}</span>
          <span>/</span>
          <span>{t('preview.project')}</span>
          <span className="concept-badge">{t('preview.label')}</span>
        </div>
        <div className="preview-heading">
          <div>
            <h3>{t('preview.project')}</h3>
            <p>{t('preview.description')}</p>
          </div>
          <div className="preview-avatars" aria-label={t('preview.people')}>
            <span>
              <UserRound />
            </span>
            <span>
              <UserRound />
            </span>
            <span>
              <UserRound />
            </span>
          </div>
        </div>
        <div
          className="preview-toolbar"
          role="group"
          aria-label={t('preview.project')}
        >
          <button
            type="button"
            onClick={() => setView('board')}
            aria-pressed={view === 'board'}
          >
            <Columns3 size={13} />
            {t('preview.board')}
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
          >
            <List size={13} />
            {t('preview.list')}
          </button>
        </div>
        <div
          className={cn('preview-columns', view === 'list' && 'preview-list')}
        >
          {columns.map((column) => (
            <div key={column.id} className="preview-column">
              <div className="preview-column-title">
                <span className={cn('column-dot', `column-dot-${column.id}`)} />
                <span>{t(`preview.${column.id}`)}</span>
                <span className="column-count">{column.tasks.length}</span>
                <MoreHorizontal size={14} aria-hidden="true" />
              </div>
              {column.tasks.map((task) => (
                <div className="preview-task" key={task.id}>
                  <div className="task-category">
                    {t(`preview.${task.category}`)}
                  </div>
                  <div className="task-name">
                    {column.id === 'done' && (
                      <Check size={12} aria-hidden="true" />
                    )}
                    {t(`preview.${task.id}`)}
                  </div>
                  <div className="task-bottom">
                    <span aria-label={t(`preview.${task.priority}`)}>
                      {task.priority === 'high' ? (
                        <ArrowUp size={11} />
                      ) : (
                        <Circle size={9} />
                      )}
                      {t(`preview.${task.priority}`)}
                    </span>
                    <UserRound size={12} aria-hidden="true" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
