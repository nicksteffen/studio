"use client";

import { Button } from "@/components/ui/button";
import { signUpForWaitlist } from "./signUpForWaitlistAction";
import { useToast } from "@/hooks/use-toast";

interface WaitlistButtonProps {
  isOnWaitlist: boolean;
}

export default function WaitlistButton({ isOnWaitlist }: WaitlistButtonProps) {
  const { toast } = useToast();
  const onSignUpForWaitlist = async () => {
    const signUpResult = await signUpForWaitlist();
    toast({
      title: signUpResult?.status === "success" ? "Success!" : "Error!",
      description: signUpResult?.message,
      variant: signUpResult?.status === "success" ? "default" : "destructive",
    });
  };

  return (
    <>
      <Button
        size="lg"
        className="w-full"
        onClick={onSignUpForWaitlist}
        disabled={isOnWaitlist}
      >
        Sign Up for the Waitlist Now!
      </Button>
      {isOnWaitlist ? (
        <p className="text-center text-sm text-muted-foreground">
          You are already on the waitlist!
        </p>
      ) : null}
    </>
  );
}
