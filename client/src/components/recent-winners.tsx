import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { apiRequest, authApiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function RecentWinners() {
  const qc = useQueryClient();
  const { data: winners, isLoading } = useQuery<any[]>({
    queryKey: ["/api/winners"],
    queryFn: () => apiRequest("/winners"),
  });
  const addMutation = useMutation({
    mutationFn: (payload: any) => authApiRequest("/admin/winners", { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/winners"] })
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: any) => authApiRequest(`/admin/winners/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/winners"] })
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => authApiRequest(`/admin/winners/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/winners"] })
  });
  const resetMutation = useMutation({
    mutationFn: () => authApiRequest(`/admin/winners/reset`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/winners"] })
  });
  const { user } = useAuth();

  if (isLoading) {
    return (
      <section id="winners" className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <Trophy className="inline mr-3 casino-gold" size={40} />
              Recent Winners
            </h2>
            <p className="text-xl text-gray-300">Loading winner information...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="winners" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-4xl font-bold text-dark-brown mb-1">
              <Trophy className="inline mr-3 casino-gold" size={40} />
              Winners & Earnings
            </h2>
            <p className="text-sm text-gray-600">Live results plus admin-managed entries</p>
          </div>
          {user?.isAdmin && (
            <div className="flex items-center gap-2">
              <button className="bg-casino-gold text-white px-3 py-1 rounded" onClick={() => addMutation.mutate({ lobbyId: 1, userId: user.id, amount: 0, note: 'Manual' })}>Add</button>
              <button className="bg-gray-800 text-white px-3 py-1 rounded" onClick={() => resetMutation.mutate()}>Reset</button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Game</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Lobby</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Note</th>
                <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {winners?.map((w: any) => (
                <tr key={w.id} className="border-t border-gray-200">
                  <td className="px-3 py-2 text-sm">{w.id}</td>
                  <td className="px-3 py-2 text-sm">{w.gameId ?? '-'}</td>
                  <td className="px-3 py-2 text-sm">{w.lobbyId}</td>
                  <td className="px-3 py-2 text-sm">{w.userId}</td>
                  <td className="px-3 py-2 text-sm text-right">${Number(w.amount || 0).toFixed(2)}</td>
                  <td className="px-3 py-2 text-sm">{w.note || ''}</td>
                  <td className="px-3 py-2 text-sm text-right">
                    {user?.isAdmin && (
                      <>
                        <button className="bg-blue-600 text-white px-2 py-1 rounded mr-2" onClick={() => updateMutation.mutate({ id: w.id, updates: { note: prompt('Note', w.note || '') || w.note } })}>Edit</button>
                        <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => deleteMutation.mutate(w.id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
