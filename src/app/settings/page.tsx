"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/auth");
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      if (p) {
        setProfile(p as Profile);
        setUsername(p.username);
        setBio(p.bio ?? "");
      }
    });
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!profile) return;

    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getUser();
    const userId = sessionData.user?.id;
    if (!userId) return;

    let avatarUrl = profile.avatar_url;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });

      if (uploadErr) {
        setError("Erro ao fazer upload do avatar: " + uploadErr.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);
      // Bust cache
      avatarUrl = urlData.publicUrl + "?t=" + Date.now();
    }

    // Check username uniqueness (only if changed)
    if (username.trim() !== profile.username) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.trim())
        .maybeSingle();

      if (existing) {
        setError("Este nome de usuário já está em uso.");
        setLoading(false);
        return;
      }
    }

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({
        username: username.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
      })
      .eq("user_id", userId);

    if (updateErr) {
      setError(updateErr.message);
    } else {
      setSuccess("Perfil atualizado com sucesso!");
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              username: username.trim(),
              bio: bio.trim() || null,
              avatar_url: avatarUrl ?? null,
            }
          : prev
      );
      setAvatarFile(null);
      if (fileRef.current) fileRef.current.value = "";
    }

    setLoading(false);
  };

  const displayAvatar =
    avatarPreview ?? profile?.avatar_url ?? null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
      >
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 text-sm rounded-xl px-4 py-3">
            {success}
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-4">
          {displayAvatar ? (
            <Image
              src={displayAvatar}
              alt="avatar"
              width={72}
              height={72}
              className="rounded-full object-cover w-[72px] h-[72px] flex-shrink-0"
            />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold flex-shrink-0">
              {username[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <label className="cursor-pointer inline-block text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Alterar foto
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
            <p className="text-xs text-gray-400">JPG, PNG ou GIF, máx 2 MB</p>
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome de usuário
          </label>
          <input
            type="text"
            required
            minLength={3}
            maxLength={30}
            pattern="^[a-zA-Z0-9_]+$"
            title="Apenas letras, números e underscores"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            rows={3}
            maxLength={200}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Conte um pouco sobre você…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Salvando…" : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
