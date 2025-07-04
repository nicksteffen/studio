'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, Copy, Mail, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// SVG Icons for social media brands
const PinterestIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#E60023" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 16.05 4.43 19.45 8.01 20.49C8.11 20.08 8.19 19.32 8.28 18.89C8.38 18.42 8.89 16.2 8.89 16.2C8.89 16.2 8.57 15.61 8.57 14.77C8.57 13.55 9.41 12.63 10.33 12.63C11.12 12.63 11.55 13.25 11.55 13.88C11.55 14.59 11.09 15.76 10.83 16.9C10.6 17.92 11.41 18.73 12.42 18.73C14.28 18.73 15.67 16.93 15.67 14.33C15.67 11.96 13.89 10.12 11.51 10.12C8.81 10.12 7.12 12.28 7.12 14.5C7.12 15.39 7.49 16.22 7.9 16.63C7.96 16.71 7.97 16.79 7.95 16.89L7.76 17.7C7.74 17.78 7.69 17.82 7.61 17.79C6.54 17.41 5.86 16.26 5.86 15.01C5.86 12.01 8.29 9.5 11.96 9.5C15.54 9.5 18.14 11.82 18.14 14.86C18.14 17.71 16.48 19.86 13.88 19.86C13.01 19.86 12.23 19.47 11.95 19.01C11.95 19.01 11.53 20.61 11.45 20.93C11.31 21.49 11.66 22 12.25 22C17.63 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" />
    </svg>
);

const FacebookIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 16.85 5.64 20.92 10.25 21.76V14.88H7.88V12H10.25V9.77C10.25 7.42 11.72 6 13.88 6C14.89 6 15.83 6.17 16.12 6.21V8.69H14.7C13.56 8.69 13.25 9.38 13.25 10.13V12H16.04L15.62 14.88H13.25V21.76C18.36 20.92 22 16.85 22 12Z" />
    </svg>
);

const XIcon = () => (
    <svg width="24" height="24" viewBox="0 0 1200 1227" fill="#000000" xmlns="http://www.w3.org/2000/svg">
        <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
    </svg>
);

interface ShareButtonProps {
    url: string;
    title: string;
    imageUrl?: string;
}

export function ShareButton({ url, title, imageUrl }: ShareButtonProps) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const shareOptions = [
        {
            name: 'Email',
            icon: <Mail className="h-5 w-5" />,
            href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this list: ${url}`)}`,
        },
        {
            name: 'Pinterest',
            icon: <PinterestIcon />,
            href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl || '')}&description=${encodeURIComponent(title)}`,
        },
        {
            name: 'Facebook',
            icon: <FacebookIcon />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        },
        {
            name: 'X',
            icon: <XIcon />,
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        },
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            toast({ title: 'Link Copied!', description: 'The link is now on your clipboard.' });
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleSocialShare = (href: string) => {
        window.open(href, '_blank', 'noopener,noreferrer');
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-2">
                <div className="flex flex-col gap-1">
                    {shareOptions.map((option) => (
                        <Button
                            key={option.name}
                            variant="ghost"
                            className="w-full justify-start gap-3 px-3"
                            onClick={() => handleSocialShare(option.href)}
                        >
                            {option.icon}
                            <span>{option.name}</span>
                        </Button>
                    ))}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 px-3"
                        onClick={handleCopy}
                    >
                        {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
