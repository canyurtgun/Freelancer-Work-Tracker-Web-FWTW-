import { useMemo, useState, useCallback, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useProjects } from './hooks/useProjects';
import { aggregateStats, totalProjectValue } from './utils/stats';
import {
  dismissTodayPromptForToday,
  getTodayActiveDeliveries,
  isDueToday,
  isActiveProject,
} from './utils/dates';
import * as api from './api';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import ChartsPanel from './components/ChartsPanel';
import Toolbar from './components/Toolbar';
import ProjectList from './components/ProjectList';
import ProjectFormModal from './components/ProjectFormModal';
import TodayCheckInModal from './components/TodayCheckInModal';
import TodayDeliveryEntryButton from './components/TodayDeliveryEntryButton';

function sortProjects(list, sortBy) {
  const copy = [...list];
  const deliveryTime = (p) => {
    if (!p.deliveryDate) return Number.MAX_SAFE_INTEGER;
    return new Date(p.deliveryDate).getTime();
  };
  const created = (p) => new Date(p.createdAt || 0).getTime();

  switch (sortBy) {
    case 'delivery_asc':
      return copy.sort((a, b) => deliveryTime(a) - deliveryTime(b));
    case 'delivery_desc':
      return copy.sort((a, b) => deliveryTime(b) - deliveryTime(a));
    case 'created_desc':
      return copy.sort((a, b) => created(b) - created(a));
    case 'value_desc':
      return copy.sort((a, b) => totalProjectValue(b) - totalProjectValue(a));
    case 'today_first': {
      return copy.sort((a, b) => {
        const aToday = isDueToday(a.deliveryDate) && isActiveProject(a);
        const bToday = isDueToday(b.deliveryDate) && isActiveProject(b);
        if (aToday && !bToday) return -1;
        if (!aToday && bToday) return 1;
        return deliveryTime(a) - deliveryTime(b);
      });
    }
    default:
      return copy;
  }
}

function Dashboard() {
  const { isAdmin } = useAuth();
  const { projects, add, update, remove, exportJson } = useProjects();
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('today_first');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [todayPromptOpen, setTodayPromptOpen] = useState(false);
  const [todayHandledIds, setTodayHandledIds] = useState(() => new Set());

  // Fetch all users for project assignment
  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await api.getUsers();
        setAllUsers(data);
      } catch {
        // Non-admin can't access — that's fine, leave empty
        setAllUsers([]);
      }
    }
    fetchUsers();
  }, []);

  const todayPromptItems = useMemo(
    () => getTodayActiveDeliveries(projects).filter((p) => !todayHandledIds.has(p.id)),
    [projects, todayHandledIds]
  );

  useEffect(() => {
    if (!todayPromptOpen || todayPromptItems.length > 0) return;
    dismissTodayPromptForToday();
    setTodayPromptOpen(false);
  }, [todayPromptOpen, todayPromptItems.length]);

  const handleTodayClose = useCallback(() => {
    dismissTodayPromptForToday();
    setTodayPromptOpen(false);
  }, []);

  const handleTodayStatus = useCallback(
    (id, status) => {
      update(id, { status });
      setTodayHandledIds((prev) => new Set(prev).add(id));
    },
    [update]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (modalOpen) {
        setModalOpen(false);
        return;
      }
      if (todayPromptOpen) {
        dismissTodayPromptForToday();
        setTodayPromptOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, todayPromptOpen]);

  const stats = useMemo(() => aggregateStats(projects), [projects]);

  const filtered = useMemo(() => {
    let list = [...projects];
    if (statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.customerName || '').toLowerCase().includes(q) ||
          (p.content || '').toLowerCase().includes(q) ||
          (p.notes || '').toLowerCase().includes(q)
      );
    }
    return sortProjects(list, sortBy);
  }, [projects, search, statusFilter, sortBy]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((project) => {
    setEditing(project);
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (payload, id) => {
      if (id) update(id, payload);
      else add(payload);
    },
    [add, update]
  );

  const handleExport = useCallback(async () => {
    const json = await exportJson();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `freelance-yedek-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportJson]);

  return (
    <div className="ft-app">
      <div className="ft-bg" aria-hidden />
      <div className="ft-shell">
        <Header onExport={handleExport} />
        <TodayDeliveryEntryButton
          pendingCount={todayPromptItems.length}
          modalOpen={todayPromptOpen}
          onOpen={() => setTodayPromptOpen(true)}
        />
        <SummaryCards stats={stats} />
        <ChartsPanel projects={projects} />
        <section className="ft-section">
          <h2 className="ft-section-title">Projeler</h2>
          <Toolbar
            search={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            sortBy={sortBy}
            onSort={setSortBy}
            onAdd={openCreate}
          />
          <ProjectList projects={filtered} onEdit={openEdit} onDelete={remove} />
        </section>
        <footer className="ft-footer">
          <p>
            Veriler sunucu tarafında SQLite veritabanında saklanır.
            {isAdmin && ' Admin olarak JSON dışa aktarma yapabilirsiniz.'}
          </p>
          <h5>Muhammet Can Yurtgün | 2026</h5>
        </footer>
      </div>
      <ProjectFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSubmit={handleSubmit}
        allUsers={allUsers}
      />
      <TodayCheckInModal
        open={todayPromptOpen}
        items={todayPromptItems}
        onClose={handleTodayClose}
        onSetStatus={handleTodayStatus}
      />
    </div>
  );
}

function AppShell() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="ft-app">
        <div className="ft-bg" aria-hidden />
        <div className="ft-loading-screen">
          <span className="ft-login-spinner ft-login-spinner--lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
