'use client';
import { useState, useRef, Fragment, useEffect, useActionState, useCallback } from 'react';
import type { ImageOptions, ListItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { GripVertical, Plus, Share2, Image as ImageIcon, Trash2, Check, Circle, Edit, LoaderCircle, Save, X, Eye, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { addListItem, deleteListItem, toggleItemComplete, updateListItemPosition, updateListItemText, updateListTitle } from './actions';
import { ImagePreviewCard } from '@/components/ImagePreviewCard';
import { ListActions } from './ListActions';
import { useToast } from '@/hooks/use-toast';

interface MyListClientProps {
    initialListId: string | null;
    initialListTitle: string;
    initialItems: ListItem[];
    initialUsername: string | null;
    userConfigOptions: ImageOptions,
    isPremium? : boolean
}



export default function MyListClient({initialListId, initialListTitle, initialItems, initialUsername, userConfigOptions, isPremium = false }: MyListClientProps) {
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [listId, setListId] = useState<string | null>(initialListId);
  const [username, setUsername] = useState<string | null>(initialUsername);
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const [listTitle, setListTitle] = useState(initialListTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleActionState, titleFormAction, isTitleSaving] = useActionState(updateListTitle, { message: '', error: false, success: false });

  const { toast } = useToast();

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const [initialImageOptions, setInitialImageOptions] = useState<ImageOptions>(userConfigOptions);
  const [currentOptions, setCurrentOptions] = useState<ImageOptions>(initialImageOptions);

  useEffect(() => {
    setItems(initialItems);
    setListId(initialListId);
    setListTitle(initialListTitle);
    setUsername(initialUsername);
    setInitialImageOptions(initialImageOptions)
  }, [initialItems, initialListId, initialListTitle, initialUsername, initialImageOptions]);

  const isFirstTitleRender = useRef(true);
  useEffect(() => {
    if (isFirstTitleRender.current) {
        isFirstTitleRender.current = false;
        return;
    }
    if (titleActionState.message) {
      toast({
        title: titleActionState.error ? "Error" : "Success!",
        description: titleActionState.message,
        variant: titleActionState.error ? "destructive" : "default",
      });
    }
    if (titleActionState.success) {
      setIsEditingTitle(false);
    }
  }, [titleActionState, toast]);

  const handleDragSort = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const originalItems = [...items];
    const _items = [...items];
    const draggedItemContent = _items.splice(dragItem.current, 1)[0];
    _items.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setItems(_items);

    // Call server action to update positions
    const updates = _items.map((item, index) => ({ id: item.id, position: index }));
    const result = await updateListItemPosition(updates); // Use the new server action
    if (result.error) {
        toast({ title: 'Error saving order', description: result.message, variant: 'destructive' });
        setItems(originalItems); // Revert on error
    }
  };

  const handleAddItem = async () => {
    if (newItemText.trim() === '' || !listId) return;
    const result = await addListItem(
      listId, newItemText, items.length);
    if (result.error) {
       toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setNewItemText('');
  };

  const handleToggleComplete = async (id: string) => {
    const originalItems = [...items];
    const itemToToggle = items.find(item => item.id === id);
    if (!itemToToggle) return;
    setItems(
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    const result = await toggleItemComplete(id, !itemToToggle.completed); // Use the new server action
    if (result.error) {
        toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };
  
  const handleDeleteItem = async (id: string) => {
    const originalItems = [...items];
    setItems(items.filter(item => item.id !== id));
    const result = await deleteListItem(id); // Use the new server action
    if (result.error) {
      setItems(originalItems);
    }
  };
  
  const handleStartEditing = (item: ListItem) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const handleSaveEdit = async (id: string) => {
    if (editingText.trim() === '') {
        // Optionally show an error or prevent saving empty text
        toast({ title: "Input Error", description: "Item text cannot be empty.", variant: "destructive" });
        // Revert to original text if editing becomes empty
        const originalItem = items.find(item => item.id === id);
        if (originalItem) setEditingText(originalItem.text);
        return;
    }

    const originalItems = [...items];
    setItems(items.map(item => item.id === id ? { ...item, text: editingText.trim() } : item));
    setEditingItemId(null);
    setEditingText('');
    const result = await updateListItemText(id, editingText.trim()); // Use the new server action
  };

  const completedCount = items.filter(item => item.completed).length;
  const progressValue = (completedCount / 30) * 100;


  const handleGenerateImage = useCallback(() => {
    if (items.length === 0) {
      toast({
        title: 'Empty List',
        description: 'Add some items to your list before generating an image.',
        variant: 'destructive',
      });
      return;
    }
    const previewElement = document.getElementById('image-preview-content');
    if (previewElement) {
      html2canvas(previewElement, {
          useCORS: true,
          scale: 2,
          backgroundColor: currentOptions.backgroundColor, // Use the configured background color
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${listTitle.replace(/\s+/g, '_').toLowerCase()}_list.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  }, [listTitle, currentOptions.backgroundColor]);

  return (
    <>
      <div className="container mx-auto max-w-3xl py-12 px-4">
        <div className="text-center mb-4">
          {isEditingTitle ? (
                <form action={titleFormAction} className="flex items-center gap-2 justify-center w-full max-w-lg mx-auto">
                    <input type="hidden" name="listId" value={listId || ''} />
                    <Input
                        name="newTitle"
                        defaultValue={listTitle}
                        className="text-2xl sm:text-4xl font-bold tracking-tight text-primary font-headline text-center h-auto p-1 border-b-2 border-primary/50 focus-visible:ring-0 shadow-none"
                        autoFocus
                    />
                    <Button type="submit" size="icon" disabled={isTitleSaving}>
                        {isTitleSaving ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setIsEditingTitle(false)} disabled={isTitleSaving}>
                        <X className="h-5 w-5" />
                    </Button>
                </form>
            ) : (
                <div className="flex items-center justify-center gap-2 group">
                    <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">
                        {listTitle}
                    </h1>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingTitle(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit className="h-5 w-5" />
                        <span className="sr-only">Edit list title</span>
                    </Button>
                </div>
            )}
          <p className="mt-2 text-lg text-foreground/80">
            Drag and drop to reorder. Check off your accomplishments.
          </p>
        </div>

        <ListActions listId={listId || ''} userId={username} isPremium={isPremium} onGenerateImage={handleGenerateImage}/>
        {/* List Display */}
        <Card className="shadow-xl">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Progress</span>
                    <span>{completedCount} / 30</span>
                </CardTitle>
                <Progress value={progressValue} className="w-full h-2" />
            </CardHeader>
          <CardContent>
            <div
              className="space-y-2"
              onDragEnd={handleDragSort}
            >
              {items.map((item, index) => (
                <Fragment key={item.id}>
                  <div
                    draggable
                    onDragStart={() => (dragItem.current = index)}
                    onDragEnter={() => (dragOverItem.current = index)}
                    onDragOver={(e) => e.preventDefault()}
                    className="group flex items-center p-2 rounded-lg transition-colors hover:bg-secondary"
                  >
                    <GripVertical className="h-5 w-5 mr-2 text-muted-foreground cursor-grab group-hover:text-foreground" />
                    <span className="w-6 text-sm text-muted-foreground font-mono text-right">{index + 1}.</span>
                    <button onClick={() => handleToggleComplete(item.id)} className="ml-3 mr-3">
                      {item.completed ? <Check className="h-6 w-6 text-accent" /> : <Circle className="h-6 w-6 text-border" />}
                    </button>

                    {editingItemId === item.id ? (
                      <Input 
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => handleSaveEdit(item.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                        autoFocus
                        className="flex-1"
                      />
                    ) : (
                      <span className={cn('flex-1', item.completed && 'line-through text-muted-foreground')}>
                        {item.text}
                      </span>
                    )}
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <Button variant="ghost" size="icon" onClick={() => editingItemId === item.id ? handleSaveEdit(item.id) : handleStartEditing(item)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>

                  </div>
                  {index === 29 && (
                     <div className="relative text-center my-2">
                        <Separator />
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card px-2 text-xs text-muted-foreground font-semibold">THE BIG 30</span>
                    </div>
                  )}
                </Fragment>
              ))}

            </div>
            {items.length < 40 && (
                <div className="mt-6 pt-4 border-t border-dashed">
                    <div className="flex items-center gap-2">
                        <Input
                        type="text"
                        placeholder="Add a new goal..."
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                        />
                        <Button onClick={handleAddItem}>
                            <Plus className="h-4 w-4 mr-2" /> Add
                        </Button>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ImagePreviewCard hidden={true} listTitle={listTitle} listItems={items} imageOptions={initialImageOptions}/>
    </>
  );
}
