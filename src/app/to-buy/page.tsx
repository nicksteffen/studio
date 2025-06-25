import Image from 'next/image';
import Link from 'next/link';
import { sampleAffiliateItems, CATEGORIES } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { AdPlaceholder } from '@/components/ad-placeholder';

export default function ToBuyPage() {
  return (
    <div className="bg-white">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">
            Shop The List
          </h1>
          <p className="mt-2 text-lg text-foreground/80 max-w-2xl mx-auto">
            Get the gear you need for your next adventure. These picks are curated to help you check off your list.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map(category => (
            <Button key={category} variant="secondary" className="rounded-full">{category}</Button>
          ))}
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sampleAffiliateItems.map(item => (
            <Card key={item.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="aspect-square relative w-full overflow-hidden rounded-md">
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" data-ai-hint="product image" />
                </div>
                <CardTitle className="font-headline text-lg pt-4">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full group">
                  <Link href={item.affiliateUrl}>
                    View on Amazon <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
          <AdPlaceholder className="md:col-span-2 lg:col-span-1 xl:col-span-1" />
        </div>
      </div>
    </div>
  );
}
