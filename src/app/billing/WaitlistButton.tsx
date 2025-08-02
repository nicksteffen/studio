"use client";

import { Button } from "@/components/ui/button";
import { getIsOnWaitlist, signUpForWaitlist } from "./signUpForWaitlistAction";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface WaitlistButtonProps {
  initialIsOnWaitlist: boolean;
}

export default function WaitlistButton({
  initialIsOnWaitlist,
}: WaitlistButtonProps) {
  const { toast } = useToast();
  const [isOnWaitlist, setIsOnWaitlist] = useState(initialIsOnWaitlist);

  useEffect(() => {
    setIsOnWaitlist(initialIsOnWaitlist);
  }, [initialIsOnWaitlist]);

  const onSignUpForWaitlist = async () => {
    const signUpResult = await signUpForWaitlist();
    const newStatus = await getIsOnWaitlist();
    setIsOnWaitlist(newStatus);
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
