"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from("profiles")
          .select("username")
          .eq("user_id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) setUsername(profile.username);
          });
      }
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          CIA Comunidade
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link
                href="/feed"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Feed
              </Link>
              {username && (
                <Link
                  href={`/u/${username}`}
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Perfil
                </Link>
              )}
              <Link
                href="/settings"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Configurações
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/feed"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Feed
              </Link>
              <Link
                href="/auth"
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Entrar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
