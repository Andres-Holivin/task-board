'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasksStore } from '@/hooks/use-tasks';
import { TaskSuggestion, TaskStatus } from '@/types/task';
import { toast } from 'sonner';
import { Sparkles, Check } from 'lucide-react';

interface AiSuggestionsDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function AiSuggestionsDialog({ open, onOpenChange }: AiSuggestionsDialogProps) {
  const [context, setContext] = useState('');
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const getSuggestions = useTasksStore((state) => state.getSuggestions);
  const createTask = useTasksStore((state) => state.createTask);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSelectedSuggestions(new Set());
    try {
      const results = await getSuggestions(context || undefined);
      setSuggestions(results);
      toast.success('Generated task suggestions');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleAddSelected = async () => {
    if (selectedSuggestions.size === 0) {
      toast.error('Please select at least one suggestion');
      return;
    }

    setIsAdding(true);
    try {
      const tasksToAdd = Array.from(selectedSuggestions).map(index => suggestions[index]);
      
      await Promise.all(
        tasksToAdd.map(suggestion =>
          createTask({
            title: suggestion.title,
            description: suggestion.description,
            status: TaskStatus.TODO,
          })
        )
      );

      toast.success(`Added ${tasksToAdd.length} task${tasksToAdd.length > 1 ? 's' : ''}`);
      setSuggestions([]);
      setSelectedSuggestions(new Set());
      setContext('');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add tasks');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI Task Suggestions
          </DialogTitle>
          <DialogDescription>
            Let AI help you create tasks. Provide context or generate general suggestions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="context">Context (Optional)</Label>
            <Input
              id="context"
              placeholder="e.g., Building a Next.js app with authentication"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate Suggestions'}
          </Button>

          {suggestions.length > 0 && (
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Select tasks to add:</h3>
                <span className="text-xs text-muted-foreground">
                  {selectedSuggestions.size} selected
                </span>
              </div>
              
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <Card
                    key={`${suggestion.title}-${suggestion.description.substring(0, 10)}`}
                    className={`cursor-pointer transition-all ${
                      selectedSuggestions.has(suggestions.indexOf(suggestion))
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => toggleSuggestion(suggestions.indexOf(suggestion))}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-medium">
                          {suggestion.title}
                        </CardTitle>
                        {selectedSuggestions.has(suggestions.indexOf(suggestion)) && (
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    {suggestion.description && (
                      <CardContent className="pt-0">
                        <CardDescription className="text-xs">
                          {suggestion.description}
                        </CardDescription>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {suggestions.length > 0 && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSelected}
              disabled={selectedSuggestions.size === 0 || isAdding}
            >
              {isAdding ? 'Adding...' : `Add Selected (${selectedSuggestions.size})`}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
