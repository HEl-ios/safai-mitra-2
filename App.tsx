

import React, { useState, useCallback, useEffect } from 'react';
import { View, Badge, BadgeSlug, HistoryItem, WasteClassificationResult, ReportHistoryItem, ReportStatus, PenaltyStatus } from './types.ts';
import { BADGE_DEFINITIONS } from './constants.tsx';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import WasteClassifier from './components/WasteClassifier.tsx';
import FacilityLocator from './components/FacilityLocator.tsx';
import Quiz from './components/Quiz.tsx';
import ReportWaste from './components/ReportWaste.tsx';
import Chatbot from './components/Chatbot.tsx';
import UserProfile from './components/UserProfile.tsx';
import BottomNavBar from './components/BottomNavBar.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import TransparencyDashboard from './components/TransparencyDashboard.tsx';
import TrainingHub from './components/training/TrainingHub.tsx';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [unlockedBadges, setUnlockedBadges] = useState<Set<BadgeSlug>>(new Set());
  const [reportCount, setReportCount] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    // Lazy initializer for history to load from localStorage
    try {
      const savedHistory = localStorage.getItem('appHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Revive Date objects from strings
        return parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
    } catch (e) {
      console.error("Could not parse history from localStorage", e);
    }
    return [];
  });
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('userName') || 'Eco-Warrior');

  // Persist history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('appHistory', JSON.stringify(history));
    } catch (e) {
      console.error("Could not save history to localStorage", e);
    }
  }, [history]);

  const handleSetUserName = (name: string) => {
      const newName = name.trim() === '' ? 'Eco-Warrior' : name;
      setUserName(newName);
      localStorage.setItem('userName', newName);
  }

  const addPoints = useCallback((points: number) => {
    setUserPoints(prev => prev + points);
  }, []);

  const unlockBadge = useCallback((slug: BadgeSlug) => {
    setUnlockedBadges(prev => {
      const newBadges = new Set(prev);
      if (!newBadges.has(slug)) {
        newBadges.add(slug);
        const badge = BADGE_DEFINITIONS.find(b => b.slug === slug);
        if (badge) {
          addPoints(badge.points);
        }
        console.log(`Badge unlocked: ${slug}`);
      }
      return newBadges;
    });
  }, [addPoints]);
  
  const incrementReportCount = useCallback(() => {
    setReportCount(prev => prev + 1);
  }, []);

  const addClassificationToHistory = useCallback((result: WasteClassificationResult) => {
    const newHistoryItem: HistoryItem = {
      id: `class-${Date.now()}`,
      type: 'classification',
      timestamp: new Date(),
      data: result,
    };
    setHistory(prev => [newHistoryItem, ...prev]);
  }, []);

  const addReportToHistory = useCallback((reportData: Omit<ReportHistoryItem['data'], 'status' | 'penaltyStatus'> & Partial<Pick<ReportHistoryItem['data'], 'analysis'>>) => {
    const newHistoryItem: HistoryItem = {
      id: `report-${Date.now()}`,
      type: 'report',
      timestamp: new Date(),
      data: { 
        ...reportData, 
        status: 'Pending',
        penaltyStatus: reportData.analysis?.isBulkGenerator ? 'Drafted' : 'None',
      },
    };
    setHistory(prev => [newHistoryItem, ...prev]);
  }, []);

  const updateReportStatus = useCallback((reportId: string, newStatus: ReportStatus) => {
    setHistory(prevHistory => {
      return prevHistory.map(item => {
        if (item.id === reportId && item.type === 'report') {
          return {
            ...item,
            data: { ...item.data, status: newStatus },
          };
        }
        return item;
      });
    });
  }, []);

  const updateReportPenaltyStatus = useCallback((reportId: string, newStatus: PenaltyStatus) => {
    setHistory(prevHistory => {
      return prevHistory.map(item => {
        if (item.id === reportId && item.type === 'report') {
          return {
            ...item,
            data: { ...item.data, penaltyStatus: newStatus },
          };
        }
        return item;
      });
    });
  }, []);


  useEffect(() => {
    if (reportCount === 1) {
      unlockBadge('eco-reporter');
    }
    if (reportCount === 3) {
      unlockBadge('community-helper');
    }
  }, [reportCount, unlockBadge]);
  
  const renderView = () => {
    const reports = history.filter(item => item.type === 'report') as ReportHistoryItem[];
    switch (currentView) {
      case View.CLASSIFIER:
        return <WasteClassifier unlockBadge={unlockBadge} addPoints={addPoints} addClassificationToHistory={addClassificationToHistory} />;
      case View.LOCATOR:
        return <FacilityLocator />;
      case View.QUIZ:
        return <Quiz unlockBadge={unlockBadge} />;
      case View.REPORT:
        return <ReportWaste incrementReportCount={incrementReportCount} addReportToHistory={addReportToHistory} addPoints={addPoints} />;
      case View.CHATBOT:
        return <Chatbot unlockBadge={unlockBadge} />;
      case View.PROFILE:
        return <UserProfile userName={userName} setUserName={handleSetUserName} />;
      case View.ADMIN_DASHBOARD:
        return <AdminDashboard reports={reports} updateReportStatus={updateReportStatus} updateReportPenaltyStatus={updateReportPenaltyStatus} />;
      case View.TRANSPARENCY_DASHBOARD:
        return <TransparencyDashboard reports={reports} />;
      case View.TRAINING:
        return <TrainingHub addPoints={addPoints} unlockBadge={unlockBadge} />;
      case View.DASHBOARD:
      default:
        return (
          <Dashboard
            setView={setCurrentView}
            userPoints={userPoints}
            userName={userName}
            unlockedBadges={Array.from(unlockedBadges).map(slug => BADGE_DEFINITIONS.find(b => b.slug === slug)).filter(Boolean) as Badge[]}
            history={history}
          />
        );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-gray-800 pb-28">
      <Header setView={setCurrentView} userPoints={userPoints} currentView={currentView} />
      <main className="p-4 sm:p-6 lg:p-8">
        <div key={currentView} className="page-transition-wrapper">
          {renderView()}
        </div>
      </main>
      <BottomNavBar currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

export default App;