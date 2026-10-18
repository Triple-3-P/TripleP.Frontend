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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';

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
          <Breadcrumb aria-label={t('preview.projects')}>
            <BreadcrumbList className="preview-breadcrumb-list">
              <BreadcrumbItem>
                <FolderKanban size={13} />
                {t('preview.projects')}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('preview.project')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Badge variant="outline" className="concept-badge">
            {t('preview.label')}
          </Badge>
        </div>
        <div className="preview-heading">
          <div>
            <h3>{t('preview.project')}</h3>
            <p>{t('preview.description')}</p>
          </div>
          <div className="preview-avatars" aria-label={t('preview.people')}>
            {[0, 1, 2].map((person) => (
              <Avatar key={person}>
                <AvatarFallback>
                  <UserRound />
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
        <Tabs
          value={view}
          onValueChange={(value) => {
            if (value === 'board' || value === 'list') setView(value);
          }}
        >
          <TabsList
            className="preview-toolbar"
            aria-label={t('preview.project')}
          >
            <TabsTrigger value="board">
              <Columns3 size={13} />
              {t('preview.board')}
            </TabsTrigger>
            <TabsTrigger value="list">
              <List size={13} />
              {t('preview.list')}
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value={view}
            className={cn('preview-columns', view === 'list' && 'preview-list')}
          >
            {columns.map((column) => (
              <div key={column.id} className="preview-column">
                <div className="preview-column-title">
                  <span
                    className={cn('column-dot', `column-dot-${column.id}`)}
                  />
                  <span>{t(`preview.${column.id}`)}</span>
                  <span className="column-count">{column.tasks.length}</span>
                  <MoreHorizontal size={14} aria-hidden="true" />
                </div>
                {column.tasks.map((task) => (
                  <Card className="preview-task" key={task.id}>
                    <Badge variant="secondary" className="task-category">
                      {t(`preview.${task.category}`)}
                    </Badge>
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
                  </Card>
                ))}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
