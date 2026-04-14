"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/lib/types";
import CommentSection from "./CommentSection";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onDeleted?: (id: string) => void;
}

export default function PostCard({
  post,
  currentUserId,
  onDeleted,
}: PostCardProps) {
  const supabase = createClient();
  const [likes, setLikes] = useState(post.likes_count ?? 0);
  const [liked, setLiked] = useState(post.user_has_liked ?? false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) return;
    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .match({ post_id: post.id, user_id: currentUserId });
      setLikes((l) => l - 1);
      setLiked(false);
    } else {
      await supabase
        .from("likes")
        .insert({ post_id: post.id, user_id: currentUserId });
      setLikes((l) => l + 1);
      setLiked(true);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Deletar este post?")) return;
    await supabase.from("posts").delete().eq("id", post.id);
    onDeleted?.(post.id);
  };

  const avatarUrl = post.profiles?.avatar_url;
  const username = post.profiles?.username ?? "usuário";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={username}
            width={40}
            height={40}
            className="rounded-full object-cover w-10 h-10"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
            {username[0].toUpperCase()}
          </div>
        )}
        <div>
          <Link
            href={`/u/${username}`}
            className="font-semibold text-gray-900 hover:text-indigo-600"
          >
            {username}
          </Link>
          <p className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        {currentUserId === post.user_id && (
          <button
            onClick={handleDelete}
            className="ml-auto text-xs text-red-400 hover:text-red-600"
          >
            Deletar
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-800 whitespace-pre-wrap mb-3">{post.content}</p>

      {post.image_url && (
        <div className="relative w-full mb-3 rounded-xl overflow-hidden">
          <Image
            src={post.image_url}
            alt="Post image"
            width={600}
            height={400}
            className="w-full object-cover rounded-xl max-h-80"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t border-gray-50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 transition-colors ${liked ? "text-red-500" : "hover:text-red-400"}`}
        >
          <span>{liked ? "❤️" : "🤍"}</span>
          <span>{likes}</span>
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1 hover:text-indigo-500 transition-colors"
        >
          💬 Comentários
        </button>
      </div>

      {showComments && (
        <CommentSection postId={post.id} currentUserId={currentUserId} />
      )}
    </div>
  );
}
