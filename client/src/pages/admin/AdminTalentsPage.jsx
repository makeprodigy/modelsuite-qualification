import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import API from '../../api/axios';

const AdminTalentsPage = () => {
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTalents = async () => {
    try {
      const { data } = await API.get('/users/talents');
      setTalents(data);
    } catch {
      setError('Failed to load talents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTalents();
  }, []);

  const thCls = 'text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.7px] text-text-faint border-b border-border whitespace-nowrap';
  const tdCls = 'px-5 py-4 border-b border-border align-middle';

  return (
    <div className="flex min-h-screen bg-bg-dark">
      <Sidebar />

      <main className="ml-[240px] flex-1 px-10 py-9">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[26px] font-bold tracking-tight text-text-primary">Talents</h1>
          <p className="mt-1 text-sm text-text-muted">Manage all registered talents on the platform.</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-danger/10 border border-danger/20 text-danger rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <h2 className="text-[16px] font-semibold text-text-primary">All Talents</h2>
            
            <span className="text-[12px] text-text-faint bg-bg-input border border-border px-2.5 py-1 rounded-full">
              {talents.length} total
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-text-faint text-[15px]">Loading talents...</div>
          ) : talents.length === 0 ? (
            <div className="py-16 text-center text-text-faint text-[15px]">
              No talents found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-bg-surface">
                    <th className={thCls}>Talent Name</th>
                    <th className={thCls}>Email Address</th>
                    <th className={thCls}>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {talents.map((talent) => (
                    <tr key={talent._id} className="border-b border-border last:border-0 hover:bg-bg-hover transition-colors">
                      {/* Talent Name */}
                      <td className={`${tdCls} whitespace-nowrap`}>
                        <div className="flex items-center gap-3">
                          <div className="w-[30px] h-[30px] rounded-full avatar-talent flex items-center justify-center text-[12px] font-bold text-white shrink-0">
                            {talent.name?.[0] ?? '?'}
                          </div>
                          <span className="font-medium text-text-primary">{talent.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className={tdCls}>
                        <span className="text-text-muted">{talent.email}</span>
                      </td>

                      {/* Joined Date */}
                      <td className={`${tdCls} text-text-muted`}>
                        {new Date(talent.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminTalentsPage;
