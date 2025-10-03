'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task, TaskStatus } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import moment from 'moment';

interface ViewTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  [TaskStatus.TODO]: { label: 'To Do', variant: 'secondary' as const },
  [TaskStatus.IN_PROGRESS]: { label: 'In Progress', variant: 'default' as const },
  [TaskStatus.DONE]: { label: 'Done', variant: 'outline' as const },
};

export function ViewTaskDialog({ task, open, onOpenChange }: Readonly<ViewTaskDialogProps>) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Title</h3>
            <p className="text-lg font-semibold">{task.title}</p>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
            <Badge variant={statusConfig[task.status].variant}>
              {statusConfig[task.status].label}
            </Badge>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p className="text-sm whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created At
              </h3>
              <p className="text-sm">{moment(task.createdAt).format('MMMM DD, YYYY')}</p>
              <p className="text-xs text-muted-foreground">
                {moment(task.createdAt).format('h:mm A')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last Updated
              </h3>
              <p className="text-sm">{moment(task.updatedAt).format('MMMM DD, YYYY')}</p>
              <p className="text-xs text-muted-foreground">
                {moment(task.updatedAt).format('h:mm A')}
              </p>
            </div>
          </div>

          {/* Task ID */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Task ID</h3>
            <p className="text-sm font-mono text-muted-foreground">{task.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
