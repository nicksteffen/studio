'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { addItemFromCommunity } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ListPlus, LoaderCircle, Check } from 'lucide-react';

const initialState = {
  message: '',
  error: false,
  success: false,
};

function SubmitButton({ isSuccess }: { isSuccess: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || isSuccess;

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" type="submit" disabled={isDisabled}>
      {pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : isSuccess ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <ListPlus className="h-4 w-4" />
      )}
      <span className="sr-only">Add to my list</span>
    </Button>
  );
}

export default function AddToListButton({ itemText }: { itemText: string }) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(addItemFromCommunity, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (state.message) {
      toast({
        title: state.error ? "Error" : "Success!",
        description: state.message,
        variant: state.error ? "destructive" : "default",
      });
    }

    if (state.success) {
        // Reset form state after a delay to allow re-adding
        setTimeout(() => {
            formRef.current?.reset();
        }, 2000);
    }
  }, [state, toast]);

  return (
    <form action={formAction} ref={formRef}>
      <input type="hidden" name="itemText" value={itemText} />
      <SubmitButton isSuccess={!!state.success} />
    </form>
  );
}
