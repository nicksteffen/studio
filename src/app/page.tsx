import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Heart, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: serverUser } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col">
      <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-background to-secondary">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                  Your life's to-do list, before the big 3-0.
                </h1>
                {/* <h1> {{ serverUser }} </h1> */}
                <p className="max-w-[600px] text-foreground/80 md:text-xl">
                  Don't let your twenties just fly by. Create your ultimate "30
                  Before 30" bucket list, find inspiration from a global
                  community, and start living your adventures.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="group">
                  <Link href="/my-list">
                    Start Your List
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/browse">Browse Ideas</Link>
                </Button>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl transform rotate-3 w-full max-w-md">
                <h2 className="font-headline text-2xl sm:text-3xl text-primary mb-4">
                  My 30 Before 30
                </h2>
                <ul className="space-y-3 text-sm sm:text-base">
                  <li className="flex items-center line-through text-muted-foreground">
                    <CheckCircle className="h-5 w-5 mr-3 text-accent" />
                    Learn to make pasta from scratch
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-3 text-border" />
                    Visit Japan during cherry blossom season
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-3 text-border" />
                    Go scuba diving
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-3 text-border" />
                    See the Northern Lights
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-3 text-border" />
                    Run a half-marathon
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-primary">
              Key Features
            </div>
            <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">
              Everything you need to plan your dreams
            </h2>
            <p className="max-w-[900px] text-foreground/70 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              From AI-powered suggestions to beautiful, shareable lists, we've
              got you covered.
            </p>
          </div>
          <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
            <div className="grid gap-1 text-center p-4 rounded-lg hover:bg-secondary transition-colors">
              <Heart className="h-8 w-8 mx-auto text-primary mb-2" />
              <h3 className="text-lg font-bold font-headline">
                Craft Your Perfect List
              </h3>
              <p className="text-sm text-muted-foreground">
                Easily add, remove, and reorder items. Mark things as complete
                and watch your progress grow.
              </p>
            </div>
            <div className="grid gap-1 text-center p-4 rounded-lg hover:bg-secondary transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 mx-auto text-primary mb-2"
              >
                <path d="m12 3-1.9 5.8-5.9.8 4.2 4.1-.9 5.8L12 16l5.3 2.8-.9-5.8 4.2-4.1-5.8-.8z" />
              </svg>
              <h3 className="text-lg font-bold font-headline">
                AI-Powered Inspiration
              </h3>
              <p className="text-sm text-muted-foreground">
                Stuck for ideas? Our AI suggests personalized goals based on
                your interests and popular trends.
              </p>
            </div>
            <div className="grid gap-1 text-center p-4 rounded-lg hover:bg-secondary transition-colors">
              <Share2 className="h-8 w-8 mx-auto text-primary mb-2" />
              <h3 className="text-lg font-bold font-headline">
                Share Your Journey
              </h3>
              <p className="text-sm text-muted-foreground">
                Generate a beautiful, Instagram-ready image of your list and
                inspire your friends to start their own.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
