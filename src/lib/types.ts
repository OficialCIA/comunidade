export type Profile = {
  user_id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles?: Profile;
  likes_count?: number;
  user_has_liked?: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles?: Profile;
};

export type Like = {
  post_id: string;
  user_id: string;
};

export type Follow = {
  follower_id: string;
  following_id: string;
};
