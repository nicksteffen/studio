import type { ListItem, UserList, AffiliateItem, ListItemCategory } from './types';

export const CATEGORIES: ListItemCategory[] = ["Travel", "Food", "Adventure", "Skills", "Wellness", "Creative", "Community", "Finance", "Career", "Other"];

const now = new Date().toISOString();

export const sampleMyList: ListItem[] = [
  { id: '1', text: 'Visit Japan during cherry blossom season', completed: false, category: 'Travel', position: 0, list_id: 'mock', user_id: 'mock_user', created_at: now },
  { id: '2', text: 'Learn to make pasta from scratch', completed: true, category: 'Food', position: 1, list_id: 'mock', user_id: 'mock_user', created_at: now },
  { id: '3', text: 'Go scuba diving in the Great Barrier Reef', completed: false, category: 'Adventure', position: 2, list_id: 'mock', user_id: 'mock_user', created_at: now },
  { id: '4', text: 'Run a half marathon', completed: false, category: 'Wellness', position: 3, list_id: 'mock', user_id: 'mock_user', created_at: now },
  { id: '5', text: 'Learn a new language to conversational level', completed: false, category: 'Skills', position: 4, list_id: 'mock', user_id: 'mock_user', created_at: now },
  { id: '6', text: 'Write a short story', completed: true, category: 'Creative', position: 5, list_id: 'mock', user_id: 'mock_user', created_at: now },
  { id: '7', text: 'Volunteer for a cause I care about', completed: false, 'category': 'Community', position: 6, list_id: 'mock', user_id: 'mock_user', created_at: now },
  { id: '8', text: 'Create a 5-year financial plan', completed: false, category: 'Finance', position: 7, list_id: 'mock', user_id: 'mock_user', created_at: now },
];

export const sampleCommunityLists: UserList[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Jessica L.',
    userAvatar: 'https://placehold.co/100x100.png',
    title: "Jessica's Adventures Before 30",
    items: [
      { id: 'c1-1', text: 'Hike the Inca Trail to Machu Picchu', completed: true, category: 'Adventure', position: 0, list_id: '1', user_id: 'user1', created_at: now },
      { id: 'c1-2', text: 'Take a cooking class in Thailand', completed: false, category: 'Food', position: 1, list_id: '1', user_id: 'user1', created_at: now },
      { id: 'c1-3', text: 'See the Northern Lights', completed: false, category: 'Travel', position: 2, list_id: '1', user_id: 'user1', created_at: now },
    ]
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Ben H.',
    userAvatar: 'https://placehold.co/100x100.png',
    title: 'My Growth & Goals List',
    items: [
      { id: 'c2-1', text: 'Get a professional certification', completed: true, category: 'Career', position: 0, list_id: '2', user_id: 'user2', created_at: now },
      { id: 'c2-2', text: 'Read 50 books in one year', completed: true, category: 'Skills', position: 1, list_id: '2', user_id: 'user2', created_at: now },
      { id: 'c2-3', text: 'Start a side hustle', completed: false, category: 'Finance', position: 2, list_id: '2', user_id: 'user2', created_at: now },
    ]
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Lauren B.',
    userAvatar: 'https://placehold.co/100x100.png',
    title: 'Creative & Wellness Journey',
    items: [
      { id: 'c3-1', text: 'Complete a 30-day yoga challenge', completed: false, category: 'Wellness', position: 0, list_id: '3', user_id: 'user3', created_at: now },
      { id: 'c3-2', text: 'Learn pottery', completed: false, category: 'Creative', position: 1, list_id: '3', user_id: 'user3', created_at: now },
      { id: 'c3-3', text: 'Visit all the museums in my city', completed: true, category: 'Creative', position: 2, list_id: '3', user_id: 'user3', created_at: now },
    ]
  }
];

export const sampleAffiliateItems: AffiliateItem[] = [
    { 
        id: 'a1', 
        title: 'Osprey Fairview 40 Travel Backpack', 
        description: 'The perfect carry-on for all your adventures. Comfortable, durable, and spacious.', 
        imageUrl: 'https://placehold.co/300x300.png',
        affiliateUrl: '#',
        category: 'Travel',
    },
    { 
        id: 'a2', 
        title: 'Pasta Maker Machine', 
        description: 'Create delicious, fresh pasta at home with this easy-to-use pasta maker.',
        imageUrl: 'https://placehold.co/300x300.png',
        affiliateUrl: '#',
        category: 'Food',
    },
    { 
        id: 'a3', 
        title: 'GoPro HERO12 Black', 
        description: 'Capture all your thrilling moments in stunning 5.3K video.',
        imageUrl: 'https://placehold.co/300x300.png',
        affiliateUrl: '#',
        category: 'Adventure',
    },
    { 
        id: 'a4', 
        title: 'The Artist\'s Way by Julia Cameron', 
        description: 'A course in discovering and recovering your creative self. Perfect for any creative goal.',
        imageUrl: 'https://placehold.co/300x300.png',
        affiliateUrl: '#',
        category: 'Creative',
    },
     { 
        id: 'a5', 
        title: 'High-Quality Yoga Mat', 
        description: 'A non-slip, cushioned mat to support your wellness and yoga journey.', 
        imageUrl: 'https://placehold.co/300x300.png',
        affiliateUrl: '#',
        category: 'Wellness',
    },
    { 
        id: 'a6', 
        title: 'Rosetta Stone - Lifetime Subscription', 
        description: 'Master a new language with the immersive Rosetta Stone method.',
        imageUrl: 'https://placehold.co/300x300.png',
        affiliateUrl: '#',
        category: 'Skills',
    }
];
