'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { useTasksStore } from '@/hooks/use-tasks';
import { KanbanBoard, KanbanCard, KanbanCards, KanbanHeader, KanbanProvider } from '@/components/ui/shadcn-io/kanban';
import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AddTaskDialog, EditTaskDialog, DeleteTaskAlert, AiSuggestionsDialog } from '@/components/tasks';
import { Task, TaskStatus } from '@/types/task';
import { Plus, Sparkles, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const columns = [
  { id: TaskStatus.TODO, name: 'Todo', color: '#6B7280' },
  { id: TaskStatus.IN_PROGRESS, name: 'In Progress', color: '#F59E0B' },
  { id: TaskStatus.DONE, name: 'Done', color: '#10B981' },
];

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

// Transform Task to Kanban format with proper typing
type KanbanTask = Task & { 
  name: string; 
  column: string;
  [key: string]: unknown; // Index signature for KanbanItemProps compatibility
};

export default function DashboardPage() {
  const tasks = useTasksStore((state) => state.tasks);
  const fetchTasks = useTasksStore((state) => state.fetchTasks);
  const updateTask = useTasksStore((state) => state.updateTask);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isUpdating, setIsUpdating] = useState(false); // Prevent concurrent updates

  useEffect(() => {
    fetchTasks().catch(() => {
      toast.error('Failed to fetch tasks');
    });
  }, [fetchTasks]);

  // Transform tasks to kanban format
  const kanbanTasks = useMemo((): KanbanTask[] => {
    if (!Array.isArray(tasks)) {
      return [];
    }
    return tasks.map(task => ({
      ...task,
      name: task.title,
      column: task.status,
    }));
  }, [tasks]);

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  const handleDelete = (task: Task) => {
    setSelectedTask(task);
    setDeleteAlertOpen(true);
  };

  const handleDataChange = async (newTasks: KanbanTask[]) => {
    // Prevent concurrent updates
    if (isUpdating) {
      console.log('Update already in progress, skipping...');
      return;
    }

    // Find the task that changed status
    for (const newTask of newTasks) {
      const oldTask = kanbanTasks.find(t => t.id === newTask.id);

      if (oldTask && newTask.column !== oldTask.column) {
        console.log(`Task ${newTask.id} moved from ${oldTask.column} to ${newTask.column}`);
        
        setIsUpdating(true);
        try {
          // Wait for the update to complete
          await updateTask(newTask.id, { status: newTask.column as TaskStatus });
          
          const columnName = columns.find(c => c.id === newTask.column)?.name;
          toast.success(`Task moved to ${columnName}`);
        } catch (error) {
          toast.error('Failed to update task status');
          console.error('Update task error:', error);
          
          // Refresh tasks to revert UI to actual state
          await fetchTasks();
        } finally {
          setIsUpdating(false);
        }
        break; // Only handle the first changed task
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="h-full">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Task Board</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setAiDialogOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                AI Suggestions
              </Button>
              <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>

          <KanbanProvider
            columns={columns}
            data={kanbanTasks}
            onDataChange={handleDataChange}
          >
            {(column) => (
              <KanbanBoard id={column.id} key={column.id}>
                <KanbanHeader>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <span>{column.name}</span>
                    <span className="text-muted-foreground text-sm">
                      ({kanbanTasks.filter(t => t.status === column.id).length})
                    </span>
                  </div>
                </KanbanHeader>
                <KanbanCards id={column.id}>
                  {(task: KanbanTask): ReactNode => (
                    <KanbanCard
                      column={task.column}
                      id={task.id}
                      key={task.id}
                      name={task.name}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="flex-1 font-medium text-sm">
                            {task.title}
                          </p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="sr-only">Open menu</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="12" cy="5" r="1" />
                                  <circle cx="12" cy="19" r="1" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(task)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(task)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {task.description && (
                          <p className="text-muted-foreground text-xs line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <p className="text-muted-foreground text-xs">
                          {shortDateFormatter.format(new Date(task.createdAt))}
                        </p>
                      </div>
                    </KanbanCard>
                  )}
                </KanbanCards>
              </KanbanBoard>
            )}
          </KanbanProvider>
        </div>

        <AddTaskDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
        <EditTaskDialog task={selectedTask} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
        <DeleteTaskAlert task={selectedTask} open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen} />
        <AiSuggestionsDialog open={aiDialogOpen} onOpenChange={setAiDialogOpen} />
      </div>
    </ProtectedRoute>
  );
}

