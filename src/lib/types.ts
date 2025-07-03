export type ListItemCategory = "Travel" | "Food" | "Adventure" | "Skills" | "Wellness" | "Creative" | "Community" | "Finance" | "Career" | "Other";

export type ListItem = {
  id: string;
  text: string;
  completed: boolean;
  category: ListItemCategory;
  position: number;
  list_id: string;
  user_id: string;
  created_at: string;
};

export type UserList = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  items: ListItem[];
};

export type CommunityList = {
  id: string;
  title: string | null;
  author: {
      username: string | null;
      avatar_url: string | null;
  } | null;
  list_items: {
      id: string;
      text: string;
      completed: boolean;
  }[];
}

export type AffiliateItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
  category: ListItemCategory;
};
