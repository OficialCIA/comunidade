import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-5xl font-extrabold text-indigo-600 mb-4">
        CIA Comunidade
      </h1>
      <p className="text-gray-500 text-lg max-w-md mb-8">
        Conecte-se com outros membros, compartilhe ideias, faça amigos e fique
        por dentro de tudo.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/feed"
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Ver Feed
        </Link>
        <Link
          href="/auth"
          className="bg-white border border-indigo-200 text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
        >
          Entrar / Cadastrar
        </Link>
      </div>
    </div>
  );
}
