import React, { useState, useEffect, useRef, FormEvent } from 'react';
import AdminSettingsPanel from './AdminSettingsPanel';
import { supabase } from './supabaseClient';

/* ==========================================================================
   1. TYPES & INTERFACES
   ========================================================================== */
export type AdminTabState = 'dashboard' | 'sows' | 'gestation' | 'finder' | 'settings';

export interface Sow {
  id: number;
  user_id?: string;
  sow_id: string;
  name: string;
  tag_number: string;
  status: 'Healthy' | 'Breeding' | 'Gestating' | 'Isolated';
  notes: string;
}

export interface GestationTask {
  id: number;
  user_id?: string;
  title: string;
  description: string;
  task_type: string;
  task_date: string; // YYYY-MM-DD
  task_time: string;
  sow_id?: string;
  sow_tag_id?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Completed' | 'Cancelled';
}

interface AdminPortalProps {
  adminTab: AdminTabState;
  setAdminTab: (tab: AdminTabState) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  fontSize: number;
  setFontSize: (val: number) => void;
  user?: any;
  profileName?: string;
  avatarUrl?: string;
}

interface CaretakerProfileDropdownProps {
  user?: any;
  profileName?: string;
  avatarUrl?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

/* ==========================================================================
   2. CARETAKER DROPDOWN MENU COMPONENT
   ========================================================================== */
function CaretakerProfileDropdown({ user, profileName, avatarUrl }: CaretakerProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { label: 'Profile', icon: '👤', description: 'User account & role settings', action: () => {} },
    { label: 'Notifications', icon: '🔔', description: 'Alert preferences & logs', action: () => {} },
    { label: 'Language', icon: '🌐', description: 'Localization & regional settings', action: () => {} },
    { label: 'About', icon: 'ℹ️', description: 'Platform overview & version details', action: () => {} },
    { label: 'Logout', icon: '➜]', description: 'Log out from dashboard', action: handleLogout },
  ];

  const userEmail = user?.email || 'Not Signed In';
  const displayAvatarLetter = profileName
    ? profileName.charAt(0).toUpperCase()
    : userEmail.charAt(0).toUpperCase();

  return (
    <div className="relative z-50 inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl cursor-pointer transition-all duration-200 select-none ${
          isOpen ? 'neu-pressed' : 'neu-flat'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-xs neu-flat shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            displayAvatarLetter
          )}
        </div>
        <div className="text-left text-xs">
          <p className="font-bold leading-tight text-gray-800 dark:text-gray-100">
            {profileName || 'Caretaker'}
          </p>
          <p className="text-[10px] text-gray-400 leading-tight truncate max-w-[120px]">
            {userEmail}
          </p>
        </div>
        <span
          className={`text-xs text-blue-500 font-bold transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 neu-flat p-4 rounded-3xl space-y-3 transition-all duration-300 shadow-2xl border border-white/20 dark:border-gray-800/20">
          <div className="neu-pressed p-2.5 rounded-2xl text-[11px] text-gray-500 dark:text-gray-400 italic text-center">
            Isolated Portal • Authenticated
          </div>

          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-2xl neu-pressed hover:neu-button group transition-all duration-200 text-left"
              >
                <div className="w-8 h-8 rounded-xl neu-flat flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-500 transition-colors">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   3. ADMIN PORTAL LAYOUT COMPONENT
   ========================================================================== */
function AdminPortalLayout({
  adminTab,
  setAdminTab,
  darkMode,
  setDarkMode,
  fontSize,
  setFontSize,
  user,
}: AdminPortalProps) {
  return (
    <div className="flex max-w-7xl mx-auto min-h-[85vh] p-4 gap-6 flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 neu-flat p-6 rounded-3xl space-y-6 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          <nav className="flex flex-col gap-3">
            {[
              { id: 'dashboard', label: '📊 Dashboard' },
              { id: 'sows', label: '🐖 Sow Records' },
              { id: 'gestation', label: '📅 Gestation & Schedule' },
              { id: 'finder', label: '🛒 Store Finder' },
              { id: 'settings', label: '⚙️ Settings & Appearance' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAdminTab(item.id as AdminTabState)}
                className={`w-full text-left px-4 py-3 rounded-2xl font-semibold transition text-sm ${
                  adminTab === item.id
                    ? 'neu-pressed text-blue-500 font-bold'
                    : 'neu-button'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Font Size Control */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold">
            <span>Font Size</span>
            <span>{fontSize}px</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">A-</span>
            <input
              type="range"
              min="12"
              max="18"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-blue-500 h-1 neu-pressed rounded-lg cursor-pointer"
            />
            <span className="text-sm font-bold">A+</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 neu-flat p-6 rounded-3xl">
        {adminTab === 'dashboard' && <AdminDashboardView user={user} />}
        {adminTab === 'sows' && <SowRecordsCRUDView user={user} />}
        {adminTab === 'gestation' && <GestationCalendarView user={user} />}
        {adminTab === 'finder' && <StoreFinderView />}
        {adminTab === 'settings' && (
          <AdminSettingsPanel
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            fontSize={fontSize}
            setFontSize={setFontSize}
            user={user}
          />
        )}
      </main>
    </div>
  );
}

/* ==========================================================================
   4. MAIN APPLICATION CONTAINER (WITH DYNAMIC AUTH)
   ========================================================================== */
export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<AdminTabState>('dashboard');
  const [fontSize, setFontSize] = useState<number>(14);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileName, setProfileName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#121212';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#E0E5EC';
    }
  }, [darkMode]);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();

      if (data) {
        if (data.full_name) setProfileName(data.full_name);
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
      }
    } catch (err) {
      console.error('Error fetching header profile:', err);
    }
  };

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setCurrentUser(session.user);
          const fullName =
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0];
          setProfileName(fullName || 'Caretaker');
          loadUserProfile(session.user.id);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setCurrentUser(session.user);
          const fullName =
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0];
          setProfileName(fullName || 'Caretaker');
          loadUserProfile(session.user.id);
        } else {
          setCurrentUser(null);
          setProfileName('');
          setAvatarUrl('');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  return (
    <>
      <style>{`
        :root {
          --neu-bg: #E0E5EC;
          --neu-flat-shadow: 9px 9px 16px #a3b1c6, -9px -9px 16px #ffffff;
          --neu-button-shadow: 6px 6px 12px #b8c6d9, -6px -6px 12px #ffffff;
          --neu-button-active: inset 4px 4px 8px #b8c6d9, inset -4px -4px 8px #ffffff;
          --neu-pressed-shadow: inset 6px 6px 10px #a3b1c6, inset -6px -6px 10px #ffffff;
        }
        html.dark, body.dark, .dark {
          --neu-bg: #121212;
          --neu-flat-shadow: 6px 6px 14px #0a0a0a, -6px -6px 14px #1a1a1a;
          --neu-button-shadow: 4px 4px 10px #080808, -4px -4px 10px #1c1c1c;
          --neu-button-active: inset 3px 3px 6px #080808, inset -3px -3px 6px #1c1c1c;
          --neu-pressed-shadow: inset 5px 5px 8px #080808, inset -5px -5px 8px #1c1c1c;
        }
        body {
          background-color: var(--neu-bg);
          margin: 0;
          padding: 0;
          transition: background-color 0.3s ease;
        }
        .neu-flat { box-shadow: var(--neu-flat-shadow); background-color: var(--neu-bg); }
        .neu-button { box-shadow: var(--neu-button-shadow); background-color: var(--neu-bg); transition: all 0.2s ease; }
        .neu-button:active { box-shadow: var(--neu-button-active); }
        .neu-pressed { box-shadow: var(--neu-pressed-shadow); background-color: var(--neu-bg); }
      `}</style>

      <div
        style={{ fontSize: `${fontSize}px` }}
        className={`min-h-screen bg-[var(--neu-bg)] transition-colors duration-300 ${
          darkMode ? 'dark text-gray-100' : 'light text-gray-800'
        }`}
      >
        <header className="p-4 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏠</span>
              <h1 className="font-extrabold text-xl tracking-wide">Piggery Admin</h1>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold neu-pressed text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active quick indicator
            </span>
          </div>

          <div className="flex-1 max-w-md w-full">
            <div className="neu-pressed px-4 py-2 rounded-2xl flex items-center gap-2">
              <span className="text-gray-400">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Look up sow IDs, feed brands, or medical logs"
                className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="neu-button p-2.5 rounded-2xl flex items-center justify-center text-lg transition-transform active:scale-95"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <button className="neu-button p-2.5 rounded-2xl relative" type="button">
              <span className="text-lg">🔔</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            <CaretakerProfileDropdown user={currentUser} profileName={profileName} avatarUrl={avatarUrl} />
          </div>
        </header>

        <AdminPortalLayout
          adminTab={adminTab}
          setAdminTab={setAdminTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          fontSize={fontSize}
          setFontSize={setFontSize}
          user={currentUser}
          profileName={profileName}
          avatarUrl={avatarUrl}
        />
      </div>
    </>
  );
}

/* ==========================================================================
   5. MAPS & AUXILIARY SUB-VIEWS
   ========================================================================== */
function GoogleMapsComponent() {
  const storeLat = 10.3157;
  const storeLng = 123.8854;

  return (
    <div className="space-y-4">
      <div className="w-full h-64 neu-pressed rounded-2xl overflow-hidden relative">
        <iframe
          title="Store Location Google Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          src={`https://maps.google.com/maps?q=${storeLat},${storeLng}&z=15&output=embed`}
        />
      </div>
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${storeLat},${storeLng}`}
        target="_blank"
        rel="noreferrer"
        className="inline-block neu-button px-6 py-3 rounded-xl font-bold text-blue-500 text-sm"
      >
        📍 Navigate via Google Maps
      </a>
    </div>
  );
}

function StoreFinderView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Store & Feed Locator</h2>
      <div className="neu-flat p-6 rounded-3xl space-y-4">
        <GoogleMapsComponent />
        <div className="space-y-3 pt-4">
          <h3 className="font-bold text-sm">Nearby Feed Suppliers</h3>
          <div className="neu-pressed p-3 rounded-xl flex justify-between items-center text-xs">
            <div>
              <p className="font-bold">Central Agri Feed Hub</p>
              <p className="text-gray-400">2.4 km away • Inahin 1 In Stock</p>
            </div>
            <button type="button" className="neu-button px-3 py-1.5 rounded-lg text-blue-500 font-bold">
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   6. DYNAMIC DYNAMIC CALENDAR & TASK SCHEDULER VIEW
   ========================================================================== */
function GestationCalendarView({ user }: { user?: any }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<GestationTask[]>([]);
  const [sows, setSows] = useState<Sow[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<GestationTask | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('General');
  const [formTime, setFormTime] = useState('08:00 AM');
  const [formSowId, setFormSowId] = useState('');
  const [formPriority, setFormPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [formStatus, setFormStatus] = useState<'Pending' | 'Completed' | 'Cancelled'>('Pending');

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchSows();
      subscribeToTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gestation_tasks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      console.error('Error fetching calendar tasks:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSows = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('sows').select('*').eq('user_id', user.id);
      setSows(data || []);
    } catch (err: any) {
      console.error('Error fetching sows:', err.message);
    }
  };

  const subscribeToTasks = () => {
    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gestation_tasks', filter: `user_id=eq.${user?.id}` },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const openCreateModal = (dateStr: string) => {
    setEditingTask(null);
    setSelectedDate(dateStr);
    setFormTitle('');
    setFormDesc('');
    setFormType('General');
    setFormTime('08:00 AM');
    setFormSowId(sows[0]?.sow_id || '');
    setFormPriority('Medium');
    setFormStatus('Pending');
    setIsModalOpen(true);
  };

  const openEditModal = (task: GestationTask) => {
    setEditingTask(task);
    setSelectedDate(task.task_date);
    setFormTitle(task.title);
    setFormDesc(task.description || '');
    setFormType(task.task_type || 'General');
    setFormTime(task.task_time || '08:00 AM');
    setFormSowId(task.sow_id || '');
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      user_id: user.id,
      title: formTitle,
      description: formDesc,
      task_type: formType,
      task_date: selectedDate,
      task_time: formTime,
      sow_id: formSowId,
      priority: formPriority,
      status: formStatus,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingTask) {
        const { error } = await supabase
          .from('gestation_tasks')
          .update(payload)
          .eq('id', editingTask.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('gestation_tasks').insert([payload]);
        if (error) throw error;
      }
      await fetchTasks();
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Failed to save task: ' + err.message);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const { error } = await supabase
        .from('gestation_tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      await fetchTasks();
    } catch (err: any) {
      alert('Error deleting task: ' + err.message);
    }
  };

  const handleToggleComplete = async (task: GestationTask) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const { error } = await supabase
        .from('gestation_tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', task.id)
        .eq('user_id', user.id);
      if (error) throw error;
      await fetchTasks();
    } catch (err: any) {
      console.error('Error toggling status:', err.message);
    }
  };

  // Calendar render constants
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const selectedDateTasks = tasks.filter((t) => t.task_date === selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">📅 Gestation Task Scheduling</h2>
          <p className="text-gray-500 text-sm">
            Manage breeding timelines, iron injections, ultrasound checks, and farrowing alarms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="neu-button px-4 py-2 rounded-xl text-xs font-bold text-blue-500"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => openCreateModal(selectedDate)}
            className="neu-button px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400"
          >
            + Create Task
          </button>
        </div>
      </div>

      {/* Calendar Header Controls */}
      <div className="neu-flat p-4 rounded-2xl flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="neu-button px-3 py-1.5 rounded-xl font-bold text-sm"
        >
          ❮ Previous
        </button>
        <span className="font-extrabold text-base tracking-wide">
          {monthNames[month]} {year}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="neu-button px-3 py-1.5 rounded-xl font-bold text-sm"
        >
          Next ❯
        </button>
      </div>

      {/* Grid Calendar */}
      <div className="grid grid-cols-7 gap-2 text-center font-bold">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="p-2 neu-flat rounded-xl text-xs text-gray-400">
            {d}
          </div>
        ))}

        {/* Empty Padding Days */}
        {Array.from({ length: startDay }).map((_, idx) => (
          <div key={`empty-${idx}`} className="neu-pressed/30 h-24 rounded-xl opacity-20" />
        ))}

        {/* Month Days */}
        {Array.from({ length: totalDays }).map((_, i) => {
          const dayNum = i + 1;
          const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
          const formattedMonth = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
          const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

          const dayTasks = tasks.filter((t) => t.task_date === dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <div
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`neu-pressed h-24 rounded-xl p-2 text-xs text-left relative cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500 font-bold' : ''
              } ${isToday ? 'border border-emerald-500/50' : ''}`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-[11px] ${isToday ? 'text-emerald-500 font-black' : 'text-gray-400'}`}>
                  {dayNum}
                </span>
                {dayTasks.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </div>

              {/* Task Badges */}
              <div className="mt-1 space-y-1 max-h-14 overflow-y-auto pr-0.5">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(t);
                    }}
                    className={`text-[9px] px-1.5 py-0.5 rounded truncate font-bold ${
                      t.status === 'Completed'
                        ? 'line-through bg-gray-500/20 text-gray-400'
                        : t.priority === 'High'
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-blue-500/20 text-blue-500'
                    }`}
                  >
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tasks List for Selected Date */}
      <div className="neu-flat p-6 rounded-3xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base">
            Tasks for <span className="text-blue-500">{selectedDate}</span>
          </h3>
          <button
            type="button"
            onClick={() => openCreateModal(selectedDate)}
            className="neu-button px-3 py-1.5 rounded-xl text-xs font-bold text-blue-500"
          >
            + Add Task for Date
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-gray-400 italic">Loading tasks...</p>
        ) : selectedDateTasks.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No tasks scheduled for this date.</p>
        ) : (
          <div className="space-y-3">
            {selectedDateTasks.map((t) => (
              <div
                key={t.id}
                className="neu-pressed p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(t)}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] ${
                        t.status === 'Completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-gray-400'
                      }`}
                    >
                      {t.status === 'Completed' ? '✓' : ''}
                    </button>
                    <span
                      className={`font-bold text-sm ${
                        t.status === 'Completed' ? 'line-through text-gray-400' : ''
                      }`}
                    >
                      {t.title}
                    </span>
                    <span className="text-[10px] neu-flat px-2 py-0.5 rounded-full text-gray-400 font-bold">
                      {t.task_time}
                    </span>
                    {t.sow_id && (
                      <span className="text-[10px] neu-button px-2 py-0.5 rounded-full text-blue-500 font-bold">
                        🐖 {t.sow_id}
                      </span>
                    )}
                  </div>
                  {t.description && <p className="text-xs text-gray-400 pl-6">{t.description}</p>}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => openEditModal(t)}
                    className="neu-button px-3 py-1.5 rounded-xl text-xs font-bold text-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(t.id)}
                    className="neu-button px-3 py-1.5 rounded-xl text-xs font-bold text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <form onSubmit={handleSaveTask} className="neu-flat p-6 rounded-3xl max-w-lg w-full space-y-4">
            <h3 className="text-xl font-bold">
              {editingTask ? 'Edit Gestation Task' : 'Schedule New Gestation Task'}
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-gray-400 font-bold block mb-1">Task Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="neu-pressed w-full p-2.5 rounded-xl outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 font-bold block mb-1">Task Time</label>
                <input
                  type="text"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="neu-pressed w-full p-2.5 rounded-xl outline-none"
                  placeholder="08:00 AM"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 font-bold block mb-1 text-xs">Title</label>
              <input
                required
                placeholder="e.g. Iron Injection, Ultrasound Check"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="neu-pressed w-full p-2.5 rounded-xl outline-none text-xs"
              />
            </div>

            <div>
              <label className="text-gray-400 font-bold block mb-1 text-xs">Description</label>
              <textarea
                placeholder="Task details..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="neu-pressed w-full p-2.5 rounded-xl outline-none text-xs resize-none h-16"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-gray-400 font-bold block mb-1">Associate Sow</label>
                <select
                  value={formSowId}
                  onChange={(e) => setFormSowId(e.target.value)}
                  className="neu-pressed w-full p-2.5 rounded-xl outline-none"
                >
                  <option value="">None</option>
                  {sows.map((s) => (
                    <option key={s.id} value={s.sow_id}>
                      {s.sow_id} ({s.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">Priority</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  className="neu-pressed w-full p-2.5 rounded-xl outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="neu-pressed w-full p-2.5 rounded-xl outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                className="neu-button flex-1 py-2.5 rounded-xl font-bold text-xs text-blue-500"
              >
                Save Task
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="neu-button flex-1 py-2.5 rounded-xl font-bold text-xs text-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   7. MAIN ADMIN DASHBOARD VIEW WITH DYNAMIC STATS
   ========================================================================== */
function AdminDashboardView({ user }: { user?: any }) {
  const [sows, setSows] = useState<Sow[]>([]);
  const [tasks, setTasks] = useState<GestationTask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [sowsRes, tasksRes] = await Promise.all([
        supabase.from('sows').select('*').eq('user_id', user.id),
        supabase.from('gestation_tasks').select('*').eq('user_id', user.id),
      ]);

      if (sowsRes.data) setSows(sowsRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);
    } catch (err: any) {
      console.error('Error loading dashboard statistics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const pendingTasks = tasks.filter((t) => t.status === 'Pending');
  const todaysTasks = tasks.filter((t) => t.task_date === todayStr);
  const upcomingTasks = tasks.filter((t) => t.task_date > todayStr && t.status === 'Pending');
  const overdueTasks = tasks.filter((t) => t.task_date < todayStr && t.status === 'Pending');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neu-flat p-5 rounded-2xl relative flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500">Active Sows</p>
              <p className="text-3xl font-black mt-1">{loading ? '...' : sows.length}</p>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Registered Sows</p>
            </div>
            <span className="neu-button p-2 rounded-xl text-blue-500">📈</span>
          </div>
          <div className="mt-4">
            <span className="neu-pressed px-3 py-1 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 inline-block">
              {sows.filter((s) => s.status === 'Gestating').length} Gestating
            </span>
          </div>
        </div>

        <div className="neu-flat p-5 rounded-2xl relative flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500">Pending Tasks</p>
              <p className="text-3xl font-black mt-1">{loading ? '...' : pendingTasks.length}</p>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">High-Priority Tasks</p>
            </div>
            <span className="neu-button p-2 rounded-xl text-amber-500">📋</span>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="neu-pressed px-2 py-1 rounded-xl text-[11px] font-bold text-gray-600 dark:text-gray-300">
              {todaysTasks.length} Due Today
            </span>
            <span className="neu-pressed px-2 py-1 rounded-xl text-[11px] font-bold text-red-500">
              {overdueTasks.length} Overdue
            </span>
          </div>
        </div>

        <div className="neu-flat p-5 rounded-2xl relative flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500">Low Stock Feed</p>
              <p className="text-3xl font-black mt-1">
                3 <span className="text-sm font-bold">Feed Brands</span>
              </p>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Immediate Alerts</p>
            </div>
            <span className="neu-button p-2 rounded-xl text-red-500">📦</span>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="neu-button px-2 py-1 rounded-lg text-xs">🌾 Inahin 1</span>
            <span className="neu-button px-2 py-1 rounded-lg text-xs">🌽 Grower</span>
          </div>
        </div>

        <div className="neu-flat p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500">Upcoming Tasks</p>
            <p className="text-2xl font-black mt-1">{upcomingTasks.length}</p>
            <p className="text-xs text-gray-400 font-semibold">Scheduled Ahead</p>
            <span className="text-xs font-bold text-blue-500 mt-2 block">🐷 Synchronized</span>
          </div>
          <div className="w-16 h-16 rounded-full neu-pressed flex items-center justify-center relative">
            <div className="w-12 h-12 rounded-full neu-flat flex items-center justify-center">
              <span className="text-xs font-black text-blue-500">{upcomingTasks.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Overviews: Today, Overdue, Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Gestation Tasks */}
        <div className="neu-flat p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <span>📅 Today's Tasks</span>
            <span className="text-xs neu-pressed px-2 py-0.5 rounded-full text-blue-500 font-extrabold">
              {todayStr}
            </span>
          </h3>

          {todaysTasks.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No tasks scheduled for today.</p>
          ) : (
            <div className="space-y-2">
              {todaysTasks.map((t) => (
                <div key={t.id} className="neu-pressed p-3 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold">{t.title}</p>
                    <p className="text-[10px] text-gray-400">
                      {t.task_time} {t.sow_id ? `• Sow ${t.sow_id}` : ''}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="neu-flat p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-base text-red-500">⚠️ Overdue Tasks</h3>
          {overdueTasks.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No overdue tasks. All caught up!</p>
          ) : (
            <div className="space-y-2">
              {overdueTasks.map((t) => (
                <div key={t.id} className="neu-pressed p-3 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold">{t.title}</p>
                    <p className="text-[10px] text-red-400 font-bold">Due: {t.task_date}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-500">
                    Overdue
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="neu-flat p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-base">⏳ Upcoming Schedule</h3>
          {upcomingTasks.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No upcoming tasks scheduled.</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {upcomingTasks.slice(0, 5).map((t) => (
                <div key={t.id} className="neu-pressed p-3 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold">{t.title}</p>
                    <p className="text-[10px] text-gray-400">{t.task_date}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold neu-button text-blue-500">
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   8. SOW RECORDS CRUD VIEW
   ========================================================================== */
function SowRecordsCRUDView({ user }: { user?: any }) {
  const [sows, setSows] = useState<Sow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSow, setEditingSow] = useState<Sow | null>(null);

  const [sowIdInput, setSowIdInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (user) {
      fetchSows();
      subscribeToSows();
    }
  }, [user]);

  const fetchSows = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sows')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setSows(data || []);
    } catch (err: any) {
      console.error('Error fetching sow records:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToSows = () => {
    const channel = supabase
      .channel('sows_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sows', filter: `user_id=eq.${user?.id}` },
        () => {
          fetchSows();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAddSow = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      user_id: user.id,
      sow_id: sowIdInput,
      name: nameInput,
      tag_number: tagInput,
      status: 'Healthy' as const,
      notes: '',
    };

    try {
      const { error } = await supabase.from('sows').insert([payload]);
      if (error) throw error;
      await fetchSows();
      setSowIdInput('');
      setNameInput('');
      setTagInput('');
      setIsAddOpen(false);
    } catch (err: any) {
      alert('Error saving sow record: ' + err.message);
    }
  };

  const handleUpdateSow = async () => {
    if (!editingSow || !user) return;
    try {
      const { error } = await supabase
        .from('sows')
        .update({
          name: editingSow.name,
          status: editingSow.status,
          notes: editingSow.notes,
        })
        .eq('id', editingSow.id)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchSows();
      setEditingSow(null);
    } catch (err: any) {
      alert('Error updating sow record: ' + err.message);
    }
  };

  const handleDeleteSow = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sow record?')) return;
    try {
      const { error } = await supabase
        .from('sows')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchSows();
    } catch (err: any) {
      alert('Error deleting sow record: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sow Records Management</h2>
          <p className="text-xs text-gray-400">Authenticated Supabase User Isolation</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="neu-button px-4 py-2 rounded-xl font-bold text-blue-500 text-xs"
        >
          + Add New Sow
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-gray-400 italic">Loading sow records...</p>
      ) : sows.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No sows registered yet. Click above to create one!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-300/30 text-sm text-gray-400">
                <th className="py-3 px-2">Sow ID</th>
                <th className="py-3 px-2">Name</th>
                <th className="py-3 px-2">Tag No.</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300/20 text-sm font-medium">
              {sows.map((sow) => (
                <tr key={sow.id}>
                  <td className="py-4 px-2 font-bold">{sow.sow_id}</td>
                  <td className="py-4 px-2">{sow.name}</td>
                  <td className="py-4 px-2">{sow.tag_number}</td>
                  <td className="py-4 px-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold neu-pressed">
                      {sow.status}
                    </span>
                  </td>
                  <td className="py-4 px-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingSow(sow)}
                      className="neu-button px-3 py-1 rounded-lg text-xs font-bold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSow(sow.id)}
                      className="neu-button px-3 py-1 rounded-lg text-xs font-bold text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Add New Sow */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <form onSubmit={handleAddSow} className="neu-flat p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">Register Sow Tag</h3>
            <input
              required
              placeholder="Sow ID (e.g., SOW-004)"
              value={sowIdInput}
              onChange={(e) => setSowIdInput(e.target.value)}
              className="neu-pressed w-full p-3 rounded-xl outline-none text-xs"
            />
            <input
              required
              placeholder="Name (e.g., Daisy)"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="neu-pressed w-full p-3 rounded-xl outline-none text-xs"
            />
            <input
              required
              placeholder="Tag Number (e.g., TAG-9083)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="neu-pressed w-full p-3 rounded-xl outline-none text-xs"
            />
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="neu-button flex-1 py-2 rounded-xl font-bold text-xs text-blue-500"
              >
                Save Record
              </button>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="neu-button flex-1 py-2 rounded-xl font-bold text-xs text-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Edit Sow */}
      {editingSow && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="neu-flat p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">Edit Sow {editingSow.sow_id}</h3>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">Name</label>
              <input
                value={editingSow.name}
                onChange={(e) => setEditingSow({ ...editingSow, name: e.target.value })}
                className="neu-pressed w-full p-3 rounded-xl outline-none text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">Status</label>
              <select
                value={editingSow.status}
                onChange={(e) =>
                  setEditingSow({
                    ...editingSow,
                    status: e.target.value as Sow['status'],
                  })
                }
                className="neu-pressed w-full p-3 rounded-xl outline-none text-xs"
              >
                <option value="Healthy">Healthy</option>
                <option value="Breeding">Breeding</option>
                <option value="Gestating">Gestating</option>
                <option value="Isolated">Isolated</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">Notes</label>
              <textarea
                value={editingSow.notes || ''}
                onChange={(e) => setEditingSow({ ...editingSow, notes: e.target.value })}
                className="neu-pressed w-full p-3 rounded-xl outline-none resize-none h-20 text-xs"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleUpdateSow}
                className="neu-button flex-1 py-2 rounded-xl font-bold text-xs text-blue-500"
              >
                Update Record
              </button>
              <button
                type="button"
                onClick={() => setEditingSow(null)}
                className="neu-button flex-1 py-2 rounded-xl font-bold text-xs text-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}