'use client';
import { useState, useRef, Fragment, useEffect } from 'react';
import type { ListItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { GripVertical, Plus, Share2, Image as ImageIcon, Trash2, Check, Circle, Edit, LoaderCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import download from 'downloadjs';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { Skeleton } from '@/components/ui/skeleton';
import { generateListImageAction } from './actions';


export default function MyListPage() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [listId, setListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    const fetchListData = async (user: User) => {
        let { data: listData, error: listError } = await supabase
            .from('lists')
            .select('id')
            .eq('user_id', user.id)
            .single();
        
        let currentListId = listData?.id;

        if (listError && listError.code !== 'PGRST116') {
            console.error('Error fetching list:', listError);
            toast({ title: "Error", description: "Could not fetch your list.", variant: "destructive" });
            setLoading(false);
            return;
        }

        if (!listData) {
            const { data: newListData, error: newListError } = await supabase
                .from('lists')
                .insert({ user_id: user.id, title: `${user.email?.split('@')[0] || 'My'}'s 30 Before 30 List` })
                .select('id')
                .single();

            if (newListError) {
                console.error('Error creating list:', newListError);
                toast({ title: "Error", description: "Could not create a new list for you.", variant: "destructive" });
                setLoading(false);
                return;
            }
            currentListId = newListData.id;
        }

        if (currentListId) {
            setListId(currentListId);
            const { data: itemsData, error: itemsError } = await supabase
                .from('list_items')
                .select('*')
                .eq('list_id', currentListId)
                .order('position', { ascending: true });
    
            if (itemsError) {
                console.error('Error fetching items:', itemsError);
                toast({ title: "Error", description: "Could not fetch your list items.", variant: "destructive" });
            } else {
                setItems(itemsData || []);
            }
        }
        setLoading(false);
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
            setUser(session.user);
            fetchListData(session.user);
        } else {
            setUser(null);
            setItems([]);
            setLoading(false);
            router.push('/login');
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, [router, toast]);


  const handleDragSort = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const originalItems = [...items];
    const _items = [...items];
    const draggedItemContent = _items.splice(dragItem.current, 1)[0];
    _items.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setItems(_items);

    const updates = _items.map((item, index) => 
        supabase
            .from('list_items')
            .update({ position: index })
            .eq('id', item.id)
    );
    
    const results = await Promise.all(updates);
    const firstError = results.find(res => res.error);
    
    if (firstError) {
        toast({ title: 'Error saving order', description: firstError.error.message, variant: 'destructive' });
        setItems(originalItems); // Revert on error
    }
  };

  const handleAddItem = async () => {
    if (newItemText.trim() === '' || !listId || !user) return;
    const newItemPayload = {
      list_id: listId,
      user_id: user.id,
      text: newItemText,
      completed: false,
      category: 'Other' as const,
      position: items.length,
    };
    const { data, error } = await supabase
        .from('list_items')
        .insert(newItemPayload)
        .select()
        .single();
    if (error) {
        toast({ title: "Error adding item", description: error.message, variant: "destructive" });
        return;
    }
    if (data) {
        setItems([...items, data]);
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
    const { error } = await supabase
        .from('list_items')
        .update({ completed: !itemToToggle.completed })
        .eq('id', id);
    if(error){
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setItems(originalItems);
    }
  };
  
  const handleDeleteItem = async (id: string) => {
    const originalItems = [...items];
    setItems(items.filter(item => item.id !== id));
    const { error } = await supabase.from('list_items').delete().eq('id', id);
    if (error) {
      toast({ title: "Error deleting item", description: error.message, variant: "destructive" });
      setItems(originalItems);
    }
  };
  
  const handleStartEditing = (item: ListItem) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const handleSaveEdit = async (id: string) => {
    const originalItems = [...items];
    setItems(items.map(item => item.id === id ? { ...item, text: editingText } : item));
    setEditingItemId(null);
    setEditingText('');

    const { error } = await supabase.from('list_items').update({ text: editingText }).eq('id', id);
    if (error) {
        toast({ title: "Error saving item", description: error.message, variant: "destructive" });
        setItems(originalItems);
    }
  };

  const completedCount = items.filter(item => item.completed).length;
  const progressValue = (completedCount / 30) * 100;

  const handleGenerateImage = async () => {
    if (!items || items.length === 0) {
      toast({
        title: 'Empty List',
        description: 'Add some items to your list before generating an image.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const result = await generateListImageAction({ items });

      if (result.error || !result.imageDataUri) {
        throw new Error(result.error || 'Failed to generate image.');
      }

      download(result.imageDataUri, 'my-before-30-list.png');
      toast({ title: 'Success!', description: 'Your image has been downloaded.' });
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error Generating Image',
        description: err.message || 'Could not generate image. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied!", description: "Your public list URL is now on your clipboard." });
  }

  return (
    <>
      <div className="container mx-auto max-w-3xl py-12 px-4">
        <div className="text-center mb-4">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">
            My 30 Before 30 List
          </h1>
          <p className="mt-2 text-lg text-foreground/80">
            Drag and drop to reorder. Check off your accomplishments.
          </p>
        </div>

        <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" onClick={handleShareLink}>
                <Share2 className="mr-2 h-4 w-4" /> Share Link
            </Button>
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
            {loading ? (
                <div className="space-y-4 pt-4">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            ) : (
            <>
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
                    <button onClick={() => handleToggleComplete(item.id)} className="mr-3">
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
            {items.length < 30 && (
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
            </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
