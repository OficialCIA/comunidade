"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface FollowButtonProps {
  currentUserId: string;
  targetUserId: string;
  initialIsFollowing: boolean;
}

export default function FollowButton({
  currentUserId,
  targetUserId,
  initialIsFollowing,
}: FollowButtonProps) {
  const supabase = createClient();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .match({ follower_id: currentUserId, following_id: targetUserId });
      setIsFollowing(false);
    } else {
      await supabase.from("follows").insert({
        follower_id: currentUserId,
        following_id: targetUserId,
      });
      setIsFollowing(true);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
        isFollowing
          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
      }`}
    >
      {loading ? "…" : isFollowing ? "Seguindo" : "Seguir"}
    </button>
  );
}
