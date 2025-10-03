'use client';

import { TaskLoadingType, useTaksActions } from '@/hooks/use-tasks';
import { DragEndEvent, KanbanBoard, KanbanCard, KanbanCards, KanbanHeader, KanbanProvider } from '@/components/ui/shadcn-io/kanban';
import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AddTaskDialog, EditTaskDialog, DeleteTaskAlert, AiSuggestionsDialog, ViewTaskDialog } from '@/components/tasks';
import { Task, TaskStatus } from '@/types/task';
import { Plus, Sparkles, Edit, Trash2, EllipsisVertical, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import moment from 'moment';
import { useAuthActions } from '@/hooks/use-auth';
import { Loading } from '@/components/ui/custom/loading';
import { arrayMove } from '@dnd-kit/sortable';

const columns = [
  { id: TaskStatus.TODO, name: 'Todo', color: '#6B7280' },
  { id: TaskStatus.IN_PROGRESS, name: 'In Progress', color: '#F59E0B' },
  { id: TaskStatus.DONE, name: 'Done', color: '#10B981' },
];

// Transform Task to Kanban format with proper typing
type KanbanTask = Task & {
  name: string;
  column: string;
  [key: string]: unknown; // Index signature for KanbanItemProps compatibility
};

export default function DashboardPage() {
  const { tasks, fetchTasks, updateTask, isLoading, error, errorType } = useTaksActions();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  useAuthActions({ enable: true });

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const kanbanTasks: KanbanTask[] = useMemo(() => tasks.map(task => ({
    ...task,
    name: task.title,
    column: task.status,
  })), [tasks]);

  if (isLoading === TaskLoadingType.FETCH_TASKS) {
    return (<Loading />);
  }

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  const handleView = (task: Task) => {
    setSelectedTask(task);
    setViewDialogOpen(true);
  };

  const handleDelete = (task: Task) => {
    setSelectedTask(task);
    setDeleteAlertOpen(true);
  };

  const handleDataChange = async (newTasks: KanbanTask[]) => {
    // Find the task that changed status
    console.log('New Tasks:', newTasks);
    for (const newTask of newTasks) {

      if (newTask.column !== newTask.status) {
        console.log(`Task ${newTask.id} moved from ${newTask.status} to ${newTask.column}`);

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
          } 
          break; // Only handle the first changed task
      }
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    let newTasks = [...kanbanTasks];

    const oldIndex = newTasks.findIndex((item) => item.id === active.id);
    const newIndex = newTasks.findIndex((item) => item.id === over.id);

    newTasks = arrayMove(newTasks, oldIndex, newIndex);

    handleDataChange(newTasks);
  };
  return (
    <div className="h-full">
      <div className="flex flex-col space-y-4 h-full px-8 py-6">
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
          onDragEnd={handleDragEnd}
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
                            >
                              <span className="sr-only">Open menu</span>
                              <EllipsisVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(task)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
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
                        {moment(task.createdAt).format('DD MMM YYYY')}
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
      <ViewTaskDialog task={selectedTask} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
      <EditTaskDialog task={selectedTask} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
      <DeleteTaskAlert task={selectedTask} open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen} />
      <AiSuggestionsDialog open={aiDialogOpen} onOpenChange={setAiDialogOpen} />
    </div>
  );
}

