import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: todos } = await supabase.from("todos").select();

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🛒 nextHermes Store</h1>
        <p className="text-gray-500 mb-6">Multi-tenant e-commerce platform</p>

        {todos ? (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li key={todo.id} className="p-3 bg-gray-50 rounded-lg text-gray-700">
                {todo.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-center py-8">
            No todos yet — create your first product in Supabase! 🚀
          </p>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
          ✅ Supabase connected — ready for e-commerce setup
        </div>
      </div>
    </main>
  );
}