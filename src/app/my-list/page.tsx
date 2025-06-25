'use client';
import { useState, useRef, Fragment } from 'react';
import { sampleMyList } from '@/lib/mock-data';
import type { ListItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { GripVertical, Plus, Share2, Image as ImageIcon, Trash2, Check, Circle, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { ImageGenerator } from './image-generator';
import { useToast } from "@/hooks/use-toast";


export default function MyListPage() {
  const [items, setItems] = useState<ListItem[]>(sampleMyList);
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const { toast } = useToast();

  const imageGeneratorRef = useRef<HTMLDivElement>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _items = [...items];
    const draggedItemContent = _items.splice(dragItem.current, 1)[0];
    _items.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setItems(_items);
  };

  const handleAddItem = () => {
    if (newItemText.trim() === '') return;
    const newItem: ListItem = {
      id: new Date().toISOString(),
      text: newItemText,
      completed: false,
      category: 'Other',
    };
    setItems([...items, newItem]);
    setNewItemText('');
  };

  const handleToggleComplete = (id: string) => {
    setItems(
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };
  
  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const handleStartEditing = (item: ListItem) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const handleSaveEdit = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, text: editingText } : item));
    setEditingItemId(null);
    setEditingText('');
  };

  const completedCount = items.filter(item => item.completed).length;
  const progressValue = (completedCount / 30) * 100;

  const handleGenerateImage = async () => {
    if (imageGeneratorRef.current === null) {
        toast({ title: "Error", description: "Could not generate image. Please try again.", variant: "destructive" });
        return;
    }
    try {
        const dataUrl = await toPng(imageGeneratorRef.current, { cacheBust: true, pixelRatio: 2 });
        download(dataUrl, 'my-before-30-list.png');
        toast({ title: "Success!", description: "Your image has been downloaded." });
    } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Could not generate image. Please try again.", variant: "destructive" });
    }
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied!", description: "Your public list URL is now on your clipboard." });
  }

  return (
    <>
      <ImageGenerator ref={imageGeneratorRef} items={items} />
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
            <Button onClick={handleGenerateImage}>
                <ImageIcon className="mr-2 h-4 w-4" /> Generate Image
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}
