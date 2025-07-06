'use client';
import { useState, useRef, Fragment, useEffect, useActionState } from 'react';
import type { ListItem } from '@/lib/types';
import type { User } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { GripVertical, Plus, Share2, Image as ImageIcon, Trash2, Check, Circle, Edit, LoaderCircle, Save, X, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import download from 'downloadjs';
import { useToast } from "@/hooks/use-toast";
import { ImageGenerator } from './image-generator'; // Import new server actions
import { addListItem, deleteListItem, toggleItemComplete, updateListItemPosition, updateListItemText, updateListTitle } from './actions';
import Link from 'next/link';
import { ShareButton } from '@/components/share-button';

interface MyListClientProps {
    user: User;
    initialListId: string | null;
    initialListTitle: string;
    initialItems: ListItem[];
    initialUsername: string | null;
}

export default function MyListClient({ user, initialListId, initialListTitle, initialItems, initialUsername }: MyListClientProps) {
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [listId, setListId] = useState<string | null>(initialListId);
  const [username, setUsername] = useState<string | null>(initialUsername);
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const [listTitle, setListTitle] = useState(initialListTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleActionState, titleFormAction, isTitleSaving] = useActionState(updateListTitle, { message: '', error: false, success: false });

  const { toast } = useToast();

  const imageGeneratorRef = useRef<HTMLDivElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    setItems(initialItems);
    setListId(initialListId);
    setListTitle(initialListTitle);
    setUsername(initialUsername);
    if (typeof window !== 'undefined' && initialUsername) {
        setShareUrl(`${window.location.origin}/public/${initialUsername}`);
    }
  }, [initialItems, initialListId, initialListTitle, initialUsername]);

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
    const newItemPayload = {
      list_id: listId,
      user_id: user.id, // User ID is available from props
      text: newItemText,
      // Temporary ID for optimistic update - will be replaced by server ID
      completed: false,
      category: 'Other' as const,
      position: items.length,
    };
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

  const handleGenerateImage = async () => {
    if (!imageGeneratorRef.current) {
      toast({
        title: 'Error',
        description: 'Image generator is not ready.',
        variant: 'destructive',
      });
      return;
    }
    if (items.length === 0) {
      toast({
        title: 'Empty List',
        description: 'Add some items to your list before generating an image.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingImage(true);

    const node = imageGeneratorRef.current;
    
    const clone = node.cloneNode(true) as HTMLElement;
    
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0px';
    clone.style.zIndex = '-1';
    
    document.body.appendChild(clone);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(clone, {
        useCORS: true,
        scale: 2, 
        width: 1080,
        height: 1920,
        backgroundColor: null, 
      });

      const dataUrl = canvas.toDataURL('image/png');
      download(dataUrl, 'my-before-30-list.png');
      toast({ title: 'Success!', description: 'Your image has been downloaded.' });
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error Generating Image',
        description: err.message || 'Could not generate image. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      document.body.removeChild(clone);
      setIsGeneratingImage(false);
    }
  };
  
  const handleNoUsername = () => {
    toast({
        title: "Set a Username First!",
        description: (
          <span>
            You need a username to share your public profile. You can set one on the{' '}
            <Link href="/profile" className="underline font-bold">Profile page</Link>.
          </span>
        ),
        variant: "default",
    });
  }

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

        <div className="flex justify-end gap-2 mb-4">
             {username ? (
                <>
                    <ShareButton url={shareUrl} title={listTitle} />
                    <Button variant="outline" asChild>
                        <Link href={`/public/${username}`}>
                            <Eye className="mr-2 h-4 w-4" /> Preview
                        </Link>
                    </Button>
                </>
            ) : (
                <Button variant="outline" onClick={handleNoUsername}>
                    <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
            )}
            <Button onClick={handleGenerateImage} disabled={isGeneratingImage}>
                {isGeneratingImage ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <ImageIcon className="mr-2 h-4 w-4" />
                )}
                {isGeneratingImage ? 'Generating...' : 'Generate Image'}
            </Button>
        </div>

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
      <ImageGenerator ref={imageGeneratorRef} items={items} listTitle={listTitle} />
    </>
  );
}
