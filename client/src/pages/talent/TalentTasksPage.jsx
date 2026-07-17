import { useEffect, useState, useMemo } from 'react';
import TalentSidebar from '../../components/talent/TalentSidebar';
import MyTasksList from '../../components/talent/MyTasksList';
import CustomSelect from '../../components/common/CustomSelect';
import { fetchMyTasks } from '../../api/talent';

const STATUS_OPTIONS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'Claimed', label: 'Claimed' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

const DATE_OPTIONS = [
  { value: 'soonest', label: 'Due Soonest' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

const TalentTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateSort, setDateSort] = useState('soonest');

  const loadTasks = async () => {
    try {
      const { data } = await fetchMyTasks();
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setDateSort('soonest');
  };

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }

    // Date sort
    result.sort((a, b) => {
      if (dateSort === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (dateSort === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (dateSort === 'soonest') {
        // Sort by dueDate closest to now, pushing missing dates to bottom
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return 0;
    });

    return result;
  }, [tasks, searchQuery, statusFilter, dateSort]);

  return (
    <div className="flex min-h-screen bg-[#050505]">
      <TalentSidebar />

      <main className="ml-[220px] flex-1 px-8 py-8" style={{ maxWidth: 'calc(100vw - 220px)' }}>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[26px] font-bold tracking-tight text-[#F0F0F0] font-sans">My Tasks</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Manage, filter, and track all your assigned tasks.</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Filters Toolbar */}
        <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-[#4B5563] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Status Select */}
          <div className="w-[180px]">
            <CustomSelect
              options={STATUS_OPTIONS}
              value={STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}
              onChange={(val) => setStatusFilter(val)}
            />
          </div>

          {/* Date Sort Select */}
          <div className="w-[180px]">
            <CustomSelect
              options={DATE_OPTIONS}
              value={DATE_OPTIONS.find(o => o.value === dateSort)?.label}
              onChange={(val) => setDateSort(val)}
            />
          </div>

          {/* Clear Button */}
          <button
            onClick={handleClearFilters}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-lg text-sm font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="py-16 text-center text-white/50 text-[15px]">Loading tasks...</div>
        ) : (
          <MyTasksList tasks={filteredTasks} onRefresh={loadTasks} />
        )}

      </main>
    </div>
  );
};

export default TalentTasksPage;
