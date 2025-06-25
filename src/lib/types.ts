export type ListItemCategory = "Travel" | "Food" | "Adventure" | "Skills" | "Wellness" | "Creative" | "Community" | "Finance" | "Career" | "Other";

export type ListItem = {
  id: string;
  text: string;
  completed: boolean;
  category: ListItemCategory;
};

export type UserList = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  items: ListItem[];
};

export type AffiliateItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
  category: ListItemCategory;
};
