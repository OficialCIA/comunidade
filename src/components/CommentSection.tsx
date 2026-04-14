"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Comment } from "@/lib/types";

interface CommentSectionProps {
  postId: string;
  currentUserId?: string;
}

export default function CommentSection({
  postId,
  currentUserId,
}: CommentSectionProps) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("comments")
      .select("*, profiles(username, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setComments(data as unknown as Comment[]);
      });
  }, [postId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentUserId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: currentUserId, text })
      .select("*, profiles(username, avatar_url)")
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, data as unknown as Comment]);
      setText("");
    }
    setLoading(false);
  };

  return (
    <div className="mt-4 pt-3 border-t border-gray-100">
      <div className="space-y-3 mb-3">
        {comments.length === 0 && (
          <p className="text-xs text-gray-400">Nenhum comentário ainda.</p>
        )}
        {comments.map((c) => {
          const avatar = c.profiles?.avatar_url;
          const uname = c.profiles?.username ?? "?";
          return (
            <div key={c.id} className="flex gap-2 text-sm">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={uname}
                  width={28}
                  height={28}
                  className="rounded-full object-cover w-7 h-7 flex-shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                  {uname[0].toUpperCase()}
                </div>
              )}
              <div className="bg-gray-50 rounded-xl px-3 py-1.5 flex-1">
                <span className="font-medium text-gray-800 mr-1">{uname}</span>
                <span className="text-gray-700">{c.text}</span>
              </div>
            </div>
          );
        })}
      </div>

      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Adicionar comentário…"
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            Enviar
          </button>
        </form>
      )}
    </div>
  );
}
