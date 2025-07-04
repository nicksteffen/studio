'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { getSuggestions } from '@/app/actions';
import { addSuggestionToList } from '@/app/my-list/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, ListPlus, LoaderCircle, ServerCrash, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const getSuggestionsInitialState = {
  message: '',
  suggestions: [],
  error: false,
};

function SubmitSuggestionButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
      Get Suggestions
    </Button>
  );
}

function AddToListButton({ isSuccess }: { isSuccess: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || isSuccess;

  return (
    <Button type="submit" variant="ghost" size="sm" disabled={isDisabled}>
      {pending ? (
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
      ) : isSuccess ? (
        <Check className="mr-2 h-4 w-4 text-green-500" />
      ) : (
        <ListPlus className="mr-2 h-4 w-4" />
      )}
      {isSuccess ? 'Added' : 'Add to List'}
    </Button>
  );
}

const addToListInitialState = { message: '', error: false, success: false };

function SuggestionItem({ suggestion }: { suggestion: string }) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(addSuggestionToList, addToListInitialState);

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
  }, [state, toast]);

  return (
    <li className="flex items-center justify-between p-3 bg-secondary rounded-lg">
      <span className="text-secondary-foreground">{suggestion}</span>
      <form action={formAction}>
        <input type="hidden" name="suggestion" value={suggestion} />
        <AddToListButton isSuccess={!!state.success} />
      </form>
    </li>
  );
}

export default function SuggestionsClientPage() {
  const [state, formAction] = useActionState(getSuggestions, getSuggestionsInitialState);

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">
          Need Some Inspiration?
        </h1>
        <p className="mt-2 text-lg text-foreground/80">
          Let our AI help you brainstorm ideas for your list. Just tell us what you're into!
        </p>
      </div>

      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle>AI Suggestion Tool</CardTitle>
          <CardDescription>Enter some of your hobbies, passions, or things you'd like to try. For example: "traveling, photography, learning Spanish, coffee".</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="interests">Your Interests</Label>
              <Textarea
                id="interests"
                name="interests"
                placeholder="e.g., travel, food, adventure..."
                required
              />
            </div>
            <SubmitSuggestionButton />
          </form>

          {state.message && state.error && (
             <Alert variant="destructive" className="mt-6">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Oops!</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {state.suggestions && state.suggestions.length > 0 && (
            <div className="mt-8">
              <h3 className="font-headline text-2xl text-primary mb-4">Here are some ideas!</h3>
              <ul className="space-y-3">
                {state.suggestions.map((suggestion, index) => (
                  <SuggestionItem key={index} suggestion={suggestion} />
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
