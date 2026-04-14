"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/types";

export default function FeedPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id);
    });
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select(
        `*, profiles(username, avatar_url),
         likes_count:likes(count)`
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (!data) return;

    const userId = (await supabase.auth.getUser()).data.user?.id;

    // Determine which posts user has liked
    let likedPostIds = new Set<string>();
    if (userId) {
      const { data: likedRows } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", userId);
      if (likedRows) likedPostIds = new Set(likedRows.map((r) => r.post_id));
    }

    const formatted: Post[] = data.map((p) => ({
      ...p,
      likes_count: Array.isArray(p.likes_count)
        ? (p.likes_count[0] as { count: number })?.count ?? 0
        : 0,
      user_has_liked: likedPostIds.has(p.id),
    }));

    setPosts(formatted);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !currentUserId) return;
    setLoading(true);
    setError(null);

    let imageUrl: string | null = null;

    if (image) {
      const ext = image.name.split(".").pop();
      const path = `${currentUserId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("post-images")
        .upload(path, image, { upsert: false });

      if (uploadErr) {
        setError("Erro ao fazer upload da imagem: " + uploadErr.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const { error: insertErr } = await supabase.from("posts").insert({
      user_id: currentUserId,
      content: content.trim(),
      image_url: imageUrl,
    });

    if (insertErr) {
      setError(insertErr.message);
    } else {
      setContent("");
      setImage(null);
      setImagePreview(null);
      if (fileRef.current) fileRef.current.value = "";
      await loadPosts();
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Feed</h1>

      {/* Create post */}
      {currentUserId ? (
        <form
          onSubmit={handleCreatePost}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3"
        >
          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O que está acontecendo?"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          {imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt="preview"
              className="w-full max-h-48 object-cover rounded-xl"
            />
          )}
          <div className="flex items-center gap-3">
            <label className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-700">
              📎 Imagem
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="ml-auto bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-indigo-50 rounded-2xl p-5 text-center text-sm text-indigo-700">
          <a href="/auth" className="font-semibold underline">
            Faça login
          </a>{" "}
          para publicar no feed.
        </div>
      )}

      {/* Posts list */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">
          Nenhum post ainda. Seja o primeiro!
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onDeleted={(id) =>
                setPosts((prev) => prev.filter((p) => p.id !== id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
