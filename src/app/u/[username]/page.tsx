import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/types";
import FollowButton from "./FollowButton";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Posts
  const { data: rawPosts } = await supabase
    .from("posts")
    .select(
      `*, profiles(username, avatar_url), likes_count:likes(count)`
    )
    .eq("user_id", profile.user_id)
    .order("created_at", { ascending: false });

  // Likes by current user
  let likedPostIds = new Set<string>();
  if (currentUser) {
    const { data: likedRows } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", currentUser.id);
    if (likedRows) likedPostIds = new Set(likedRows.map((r) => r.post_id));
  }

  const posts: Post[] = (rawPosts ?? []).map((p) => ({
    ...p,
    likes_count: Array.isArray(p.likes_count)
      ? (p.likes_count[0] as { count: number })?.count ?? 0
      : 0,
    user_has_liked: likedPostIds.has(p.id),
  }));

  // Follow counts
  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.user_id);

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.user_id);

  // Is current user following this profile?
  let isFollowing = false;
  if (currentUser && currentUser.id !== profile.user_id) {
    const { data: followRow } = await supabase
      .from("follows")
      .select("follower_id")
      .match({ follower_id: currentUser.id, following_id: profile.user_id })
      .maybeSingle();
    isFollowing = !!followRow;
  }

  const isOwn = currentUser?.id === profile.user_id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Profile header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-5">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              width={80}
              height={80}
              className="rounded-full object-cover w-20 h-20 flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold flex-shrink-0">
              {profile.username[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              @{profile.username}
            </h1>
            {profile.bio && (
              <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>
            )}
            <div className="flex gap-5 mt-3 text-sm text-gray-500">
              <span>
                <strong className="text-gray-900">{followersCount ?? 0}</strong>{" "}
                seguidores
              </span>
              <span>
                <strong className="text-gray-900">{followingCount ?? 0}</strong>{" "}
                seguindo
              </span>
              <span>
                <strong className="text-gray-900">{posts.length}</strong> posts
              </span>
            </div>
          </div>
          <div className="ml-auto flex-shrink-0">
            {isOwn ? (
              <Link
                href="/settings"
                className="text-sm border border-gray-200 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Editar perfil
              </Link>
            ) : currentUser ? (
              <FollowButton
                currentUserId={currentUser.id}
                targetUserId={profile.user_id}
                initialIsFollowing={isFollowing}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">
            Nenhum post ainda.
          </p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
