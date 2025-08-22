import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Check, Star } from "lucide-react";
import { getIsOnWaitlist } from "./signUpForWaitlistAction";
import PremiumSignupButton from "./PremiumSignupButton";
import WaitlistButton from "./WaitlistButton";

const premiumFeatures = [
  "Unlimited AI Idea Generation",
  "Create and Manage Multiple Lists",
  "Advanced List Styling for Sharing",
  "Ad-Free Browsing Experience",
  "Priority Support",
  "Keep Your Lists Private",
];

export default async function BillingPage() {
  const supabase = createClient();

  const isOnWaitlist: boolean = (await getIsOnWaitlist()) || false;
  const premiumActive = false;

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="shadow-2xl border-accent">
        <CardHeader className="text-center">
          <div className="mx-auto bg-accent/20 text-accent p-3 rounded-full w-fit mb-4">
            <Star className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-4xl text-primary">
            Unlock Premium
          </CardTitle>
          <CardDescription className="text-lg text-foreground/80 pt-2">
            Supercharge your bucket list journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="my-8">
            <h3 className="font-headline text-2xl text-center mb-6">
              Premium Features Include:
            </h3>
            <ul className="space-y-4">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-center text-base">
                  <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          {premiumActive ? (
            <>
              <PremiumSignupButton />
              <p className="text-xs text-muted-foreground">
                We're putting the finishing touches on our premium offering.
                Stay tuned!
              </p>
            </>
          ) : (
            <WaitlistButton initialIsOnWaitlist={isOnWaitlist} />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
