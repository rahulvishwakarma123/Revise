import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { RoadmapView } from './components/roadmap/RoadmapView';
import { ProblemTrackerView } from './components/problems/ProblemTrackerView';
import { MistakeJournalView } from './components/mistakes/MistakeJournalView';
import { SchedulerView } from './components/scheduler/SchedulerView';
import { ActiveRecallModal } from './components/session/ActiveRecallModal';
import {
  LayoutDashboard,
  Compass,
  CheckSquare,
  BookOpen,
  CalendarDays,
} from 'lucide-react';

export const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, isLoading } = useApp();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 selection:text-primary transition-colors">
      {/* Top Navbar */}
      <Navbar />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Responsive Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 pb-24 md:pb-8 overflow-y-auto min-w-0">
          {isLoading ? (
            <div className="py-24 text-center text-muted-foreground">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Synchronizing your DSA revision workspace...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'roadmap' && <RoadmapView />}
              {activeTab === 'problems' && <ProblemTrackerView />}
              {activeTab === 'mistakes' && <MistakeJournalView />}
              {activeTab === 'scheduler' && <SchedulerView />}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border flex items-center justify-around py-2 px-1 text-card-foreground">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'roadmap', label: 'Roadmap', icon: Compass },
          { id: 'problems', label: 'Problems', icon: CheckSquare },
          { id: 'mistakes', label: 'Mistakes', icon: BookOpen },
          { id: 'scheduler', label: 'Schedule', icon: CalendarDays },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Global Modals */}
      <ActiveRecallModal />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
