import React, { useState, useCallback, useEffect } from 'react';
import { View, Badge, BadgeSlug, HistoryItem, WasteClassificationResult, ReportHistoryItem, ReportStatus, PenaltyStatus, Community, CommunityMember, CommunityMessage, Building, Penalty, Warning, PickupRequest, PickupStatus, BulkPickupRequest, BulkPickupStatus, ComplianceReport, Vehicle, VehicleStatus, EquipmentRequest } from './types.ts';
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
import CommunityHub from './components/CommunityHub.tsx';
import BuildingStatus from './components/BuildingStatus.tsx';
import Marketplace from './components/Marketplace.tsx';
import B2BPortal from './components/B2BPortal.tsx';
import { useTranslation } from './i18n/useTranslation.ts';
import { moderateChatMessage } from './services/geminiService.ts';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [unlockedBadges, setUnlockedBadges] = useState<Set<BadgeSlug>>(new Set());
  const [reportCount, setReportCount] = useState<number>(0);
  
  const { language } = useTranslation();

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem('appHistory');
      if (savedHistory) {
          return JSON.parse(savedHistory).map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) }));
      }
      // Add mock reports if no history exists for demonstration
      return [
          {
              id: `report-${Date.now() - 100000}`, type: 'report', timestamp: new Date(Date.now() - 100000),
              data: {
                  image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAPDw8QEA8QDw8PDw8PDw8PDw8PDw8PFRUWFhUVFRUYHSggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//ABEIAIAAgAMBIgACEQEDEQH/xAAbAAEAAwEBAQEAAAAAAAAAAAAABAUGAwECB//EADUQAAIBAgMECQIHAQAAAAAAAAABAgMEBREhYRIxQVFxEzJhgZHwIqGxwdEGFCRCUuHxIzP/xAAXAQEBAQEAAAAAAAAAAAAAAAAAAQID/8QAGhEBAQEAAwEAAAAAAAAAAAAAAAERIQISUf/aAAwDAQACEQMRAD8A/cQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAjre8pWs3KrLlHZd29kVzH8Tp2/sUYqpLovCHi+4HEcUxarcu9arOUm+7fJHwRcrzKxLqP1zqw/U+i8NEdw/pCvRko1kqsfiXhkvP6HYMPxGjXWem03zT4ZeqA4kndbW2zNOcX+aLROgAAAAAAAAAAAAAFK9v6VBZ6skvN+CAuqT4V3e0qKzVZLyb4IDmeK8brVOOEVTj4Ljl5v6HG1JOTcpNtvi23xbLK/wAYrVXnrVXJ+fBHwRz0m3JJNtvgklxbA+gAAGlKpKDzRk4yXBxlysDdoVqlN5qc5Ql1jJxZ1fAvKFUpZKN/i/LUXBf5Lz4nDAAlbiOK0aCz1a0Yrwy8UvN9DYYHx2pS4Un6yPty+FefAHEAdxw/iFC6Wam8tT4qcuGS/Yv3NulhNaaSjCVSb6RjKX6IDmgkqWAXN/jCgvzVqv8A5RXwZ6IelWjWfJUVSK61J5n/ANRXAFgAAAADO4N0gq28lRrNKrwUXJ8NTw8+oGlQpTqSUIRcpPgoxWWzseC9HKtVo1K7dOm+OVfFJforyOmWdjToQVOlFRjHxbfVvqwLlGnGnFQhFRjFcFFAV7Owpt5lTis3HK0m2/F82aGJ9K1qis8Z1JdILKvN8DZAcTxTpHcV1wpQhBdcj1ku3P5HNV5ubcpNyk+LbfFvoC/i+I1K9R1VastZ9Oy6RXJI54AAAAAAAAAAAAWcHw6pdVFCC4fFJ8Ix6t/oA5wD9C4L0do2yU6mWtVXNrxY/pXr1ZYo0I04qEIqMY8FGOiQDn+A9GaVllqSw1ay4OTXBH+leZ0IAAAAAAAAAAAAAAAAAAAAAAAACld39Kis1aUY+L4Zei5sDWxeJUqEdapLsz+KXgjl+Kccr1eGFKn4Li5efAc/xTj1Spxp/Vw8PiXn0OOlJybcpNtvjKT4tgfQAAAAAAAAAAAAsYXiVWg81Kbir8WuMZeq4AdPwDpDrNUqFZrP8NR8M/B9zucLxSjXXsSTfNT4JLzRwAI2AAAAAAAAAAAH/9k=',
                  description: 'Large pile of construction debris left on the sidewalk near Greenview Apartments.',
                  location: { latitude: 28.6139, longitude: 77.2090 },
                  status: 'Pending',
                  analysis: {
                      estimatedVolume: 'Large',
                      wasteTypeCategory: 'Construction Debris',
                      isBulkGenerator: true,
                      analysisSummary: 'Large-sized pile of construction debris, likely from a bulk generator.'
                  },
                  penaltyStatus: 'Drafted'
              },
          },
          {
              id: `report-${Date.now() - 200000}`, type: 'report', timestamp: new Date(Date.now() - 200000),
              data: {
                  image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAPDw8QEA8QDw8PDw8PDw8PDw8PDw8PFRUWFhUVFRUYHSggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//EADUQAAIBAgMECQIHAQAAAAAAAAABAgMEBREhYRIxQVFxEzJhgZHwIqGxwdEGFCRCUuHxIzP/xAAYAQEBAQEBAAAAAAAAAAAAAAAAAgEDBv/EAB4RAQEBAAEFAQEAAAAAAAAAAAABEQIhMQMSQVFh/9oADAMBAAIRAxEAPwD8rAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABCXt3GjTlUm9IrxbfJIrcVxKnQg6lV6LkuLb6JAcz0g4m7qp6uDxUqb0XKa/U/wR+ZtJJJJKyS0SSPIAAAAAAAAAAAAAAdH0P406c1Rqv7OT+y38L6eTOnH56j9E6NMQ7WtGpJ/ZNqNT9Pxfk7AbkGle3dOjBzqSsiricdp0oqU+KcuEVxfmBr39/SoLPUkl0XFvyRw3F+MVq3DK+qj8MP1bPO8xarVeKtWT83wR8Ec8AA0qUpQkpQk4yXBlFSysDv8AhHShOKjXWdeMvFJeZ1PD8RpV1npST5p8Ml5o/PIsYbiFWi81Kbir8WuMZeq4AfodWcYLNKSilxbasyzifSW1pr4nWl0gsq/N8D86qScpOUm5OTyylJ5W2aYF7G8SqV561WWz4Rj8MV4I5gAAAAAAAAs4Lh0rqooQXd+KT4Rj1b/QB0Xo7wN3Ms9RZW8fiXGLf6R/foffbW2hShGnBKKirJItWFjToQVOlFRjHxbfVvqwJwAAAAAAAAAAAAAAAAAAAAAAApXt/SoLPVlFer4JeSOB4vxutU4YRU4+C45eb+hzgGxxTj1Spxp/AFx5vxfQ44AAAAAAAAAAAAdP0N43kfsasvdfFDw6xOYA/QMPxSjXXsSTfNT4JLzRjF+kVrRXjKtJclHh83wPzvA8dqUuFJ+sj7c/hXnwB+g1Oke4rLJRjCmvDxy/Uznq1Z1Juc5OUnycuLOVwDiMKyzU3lqfFTlwkv2L9zdvMLq0leKmuuXBLzAoAaAAAAAAAAAAAAAAAAAAAAAf//Z',
                  description: 'Overflowing public dustbin at the corner of Sunshine Towers. Has not been cleared for days.',
                  location: { latitude: 19.0760, longitude: 72.8777 },
                  status: 'In Progress',
                  penaltyStatus: 'None',
                  buildingId: 'BLD-002'
              },
          },
          {
            id: `report-${Date.now() - 300000}`, type: 'report', timestamp: new Date(Date.now() - 300000),
            data: {
                image: 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
                description: 'Household garbage dumped incorrectly behind the main market.',
                status: 'Resolved',
                penaltyStatus: 'None'
            },
        }
      ];
    } catch (e) { console.error("Could not parse history", e); return []; }
  });

  const [userName, setUserName] = useState<string>(() => localStorage.getItem('userName') || 'Eco-Warrior');
  const [userBuildingId, setUserBuildingId] = useState<string>(() => localStorage.getItem('userBuildingId') || '');

  const [userId] = useState<string>(() => {
      let id = localStorage.getItem('userId');
      if (!id) {
          id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('userId', id);
      }
      return id;
  });

  // Community State
  const [communities, setCommunities] = useState<Community[]>(() => {
      try {
          const saved = localStorage.getItem('communities');
          return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
  });
  const [communityMembers, setCommunityMembers] = useState<Record<string, CommunityMember[]>>(() => {
      try {
          const saved = localStorage.getItem('communityMembers');
          return saved ? JSON.parse(saved) : {};
      } catch (e) { return {}; }
  });
  const [communityMessages, setCommunityMessages] = useState<Record<string, CommunityMessage[]>>(() => {
      try {
          const saved = localStorage.getItem('communityMessages');
          return saved ? JSON.parse(saved) : {};
      } catch (e) { return {}; }
  });

  // Building & Penalty State
  const [buildings, setBuildings] = useState<Building[]>(() => {
      try {
          const saved = localStorage.getItem('buildings');
          if (saved) return JSON.parse(saved);
          // Add some mock buildings for demonstration
          return [
              { id: "BLD-001", name: "Greenview Apartments", address: "123 Park Street", status: 'Compliant', warnings: [], penalties: [] },
              { id: "BLD-002", name: "Sunshine Towers", address: "456 Main Avenue", status: 'UnderReview', warnings: [], penalties: [] },
          ];
      } catch (e) { return []; }
  });

  // Marketplace State
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>(() => {
    try {
        const saved = localStorage.getItem('pickupRequests');
        return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  // B2B Portal State
  const [bulkPickupRequests, setBulkPickupRequests] = useState<BulkPickupRequest[]>(() => {
      try {
          const saved = localStorage.getItem('bulkPickupRequests');
          if(saved) return JSON.parse(saved);
          // Add a mock completed request for demonstration
           return [{
              id: `bulk-${Date.now() - 2000000}`,
              businessId: userId,
              wasteType: 'E-waste',
              estimatedWeightKg: 120,
              preferredDate: new Date(Date.now() - 2000000).toISOString().split('T')[0],
              status: 'Completed',
              timestamp: new Date(Date.now() - 2000000).toISOString(),
              notes: 'Old office computers and printers'
           }];
      } catch (e) { return []; }
  });

  // Admin/Vehicle State
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
      try {
          const saved = localStorage.getItem('vehicles');
          if (saved) return JSON.parse(saved);
          // Add mock vehicles for demonstration
          return [
              { id: 'V-01', currentLocation: { latitude: 28.62, longitude: 77.21 }, status: VehicleStatus.IDLE },
              { id: 'V-02', currentLocation: { latitude: 19.07, longitude: 72.88 }, status: VehicleStatus.IDLE },
              { id: 'V-03', currentLocation: { latitude: 28.60, longitude: 77.19 }, status: VehicleStatus.IDLE },
          ];
      } catch (e) { return []; }
  });

  // Waste Worker State
  const [equipmentRequests, setEquipmentRequests] = useState<EquipmentRequest[]>(() => {
      try {
          const saved = localStorage.getItem('equipmentRequests');
          return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
  });


  // Persist state to localStorage
  useEffect(() => { localStorage.setItem('appHistory', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('communities', JSON.stringify(communities)); }, [communities]);
  useEffect(() => { localStorage.setItem('communityMembers', JSON.stringify(communityMembers)); }, [communityMembers]);
  useEffect(() => { localStorage.setItem('communityMessages', JSON.stringify(communityMessages)); }, [communityMessages]);
  useEffect(() => { localStorage.setItem('buildings', JSON.stringify(buildings)); }, [buildings]);
  useEffect(() => { localStorage.setItem('pickupRequests', JSON.stringify(pickupRequests)); }, [pickupRequests]);
  useEffect(() => { localStorage.setItem('bulkPickupRequests', JSON.stringify(bulkPickupRequests)); }, [bulkPickupRequests]);
  useEffect(() => { localStorage.setItem('vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('equipmentRequests', JSON.stringify(equipmentRequests)); }, [equipmentRequests]);


  // Real-time chat simulation
  useEffect(() => {
    const chatSimulator = setInterval(() => {
        if (communities.length > 0 && Object.keys(communityMembers).length > 0) {
            const randomCommunityIndex = Math.floor(Math.random() * communities.length);
            const community = communities[randomCommunityIndex];
            const members = communityMembers[community.id];

            if (members && members.length > 0) {
                const botMessage: CommunityMessage = {
                    id: `msg-bot-${Date.now()}`,
                    communityId: community.id,
                    senderId: 'bot-001',
                    senderName: 'Community Bot',
                    text: `Let's organize a cleanup drive this weekend for the park area! Who's in?`,
                    timestamp: new Date().toISOString()
                };

                setCommunityMessages(prev => {
                    const currentMessages = prev[community.id] || [];
                    if (currentMessages.length > 0 && currentMessages[currentMessages.length - 1].senderId === 'bot-001') {
                        return prev;
                    }
                    return {
                        ...prev,
                        [community.id]: [...currentMessages, botMessage]
                    };
                });
            }
        }
    }, 20000); // Every 20 seconds

    return () => clearInterval(chatSimulator);
  }, [communities, communityMembers]);


  const handleSetUserName = (name: string) => {
      const newName = name.trim() === '' ? 'Eco-Warrior' : name;
      setUserName(newName);
      localStorage.setItem('userName', newName);
  }

  const handleSetUserBuildingId = (id: string) => {
      setUserBuildingId(id);
      localStorage.setItem('userBuildingId', id);
  }

  const addPoints = useCallback((points: number) => { setUserPoints(prev => prev + points); }, []);

  const unlockBadge = useCallback((slug: BadgeSlug) => {
    setUnlockedBadges(prev => {
      const newBadges = new Set(prev);
      if (!newBadges.has(slug)) {
        newBadges.add(slug);
        const badge = BADGE_DEFINITIONS.find(b => b.slug === slug);
        if (badge) addPoints(badge.points);
      }
      return newBadges;
    });
  }, [addPoints]);
  
  const incrementReportCount = useCallback(() => { setReportCount(prev => prev + 1); }, []);

  const addClassificationToHistory = useCallback((result: WasteClassificationResult) => {
    const newHistoryItem: HistoryItem = { id: `class-${Date.now()}`, type: 'classification', timestamp: new Date(), data: result };
    setHistory(prev => [newHistoryItem, ...prev]);
  }, []);

  const addReportToHistory = useCallback((reportData: Omit<ReportHistoryItem['data'], 'status' | 'penaltyStatus'> & Partial<Pick<ReportHistoryItem['data'], 'analysis'>>) => {
    const newHistoryItem: HistoryItem = {
      id: `report-${Date.now()}`, type: 'report', timestamp: new Date(),
      data: { ...reportData, status: 'Pending', penaltyStatus: reportData.analysis?.isBulkGenerator ? 'Drafted' : 'None' },
    };
    setHistory(prev => [newHistoryItem, ...prev]);
  }, []);

  const updateReportStatus = useCallback((reportId: string, newStatus: ReportStatus) => {
    setHistory(prev => prev.map(item => item.id === reportId && item.type === 'report' ? { ...item, data: { ...item.data, status: newStatus } } : item));
  }, []);

  // Vehicle movement simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setVehicles(prevVehicles => {
            return prevVehicles.map(v => {
                if (v.status === VehicleStatus.EN_ROUTE && v.destination) {
                    const { latitude: destLat, longitude: destLng } = v.destination;
                    const { latitude: currLat, longitude: currLng } = v.currentLocation;

                    const latDiff = destLat - currLat;
                    const lngDiff = destLng - currLng;

                    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

                    if (distance < 0.001) {
                        // Arrived
                        return { ...v, status: VehicleStatus.COLLECTING, destination: undefined };
                    }

                    // Move 10% of the way
                    const newLat = currLat + latDiff * 0.1;
                    const newLng = currLng + lngDiff * 0.1;
                    
                    return { ...v, currentLocation: { latitude: newLat, longitude: newLng } };
                } else if (v.status === VehicleStatus.COLLECTING) {
                    // Simulate collection time, then go idle and resolve report
                    if (v.assignedReportId) {
                        updateReportStatus(v.assignedReportId, 'Resolved');
                    }
                    return { ...v, status: VehicleStatus.IDLE, assignedReportId: undefined };
                }
                return v;
            });
        });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [updateReportStatus]);

  const updateReportPenaltyStatus = useCallback((reportId: string, newStatus: PenaltyStatus) => {
    setHistory(prev => prev.map(item => item.id === reportId && item.type === 'report' ? { ...item, data: { ...item.data, penaltyStatus: newStatus } } : item));
  }, []);
  
  const assignBuildingToReport = useCallback((reportId: string, buildingId: string) => {
    setHistory(prev => prev.map(item => item.id === reportId && item.type === 'report' ? { ...item, data: { ...item.data, buildingId: buildingId } } : item));
     // When a building is assigned, its status goes under review if compliant
    setBuildings(prev => prev.map(b => (b.id === buildingId && b.status === 'Compliant') ? { ...b, status: 'UnderReview' } : b));
  }, []);

  // Building Handlers
  const addWarningToBuilding = useCallback((buildingId: string, reason: string) => {
    const newWarning: Warning = { id: `warn-${Date.now()}`, timestamp: new Date().toISOString(), reason };
    setBuildings(prev => prev.map(b => b.id === buildingId ? { ...b, warnings: [...b.warnings, newWarning], status: 'WarningIssued' } : b));
  }, []);

  const addPenaltyToBuilding = useCallback((buildingId: string, penalty: Omit<Penalty, 'id' | 'timestamp' | 'isResolved'>) => {
    const newPenalty: Penalty = { ...penalty, id: `pen-${Date.now()}`, timestamp: new Date().toISOString(), isResolved: false };
    setBuildings(prev => prev.map(b => b.id === buildingId ? { ...b, penalties: [...b.penalties, newPenalty], status: 'PenaltyActive' } : b));
  }, []);


  // Community Handlers
  const createCommunity = useCallback((name: string, description: string, areaName: string): Community => {
      const communityName = `${name.trim()} (${areaName})`;
      const newCommunity: Community = {
          id: `comm-${Date.now()}`, name: communityName, description,
          creatorId: userId, creatorName: userName, timestamp: new Date().toISOString()
      };
      setCommunities(prev => [...prev, newCommunity]);
      setCommunityMembers(prev => ({...prev, [newCommunity.id]: [{ userId, userName }] }));
      setCommunityMessages(prev => ({...prev, [newCommunity.id]: [] }));
      return newCommunity;
  }, [userId, userName]);

  const joinCommunity = useCallback((communityId: string) => {
      setCommunityMembers(prev => {
          const members = prev[communityId] || [];
          if (!members.some(m => m.userId === userId)) {
              return { ...prev, [communityId]: [...members, { userId, userName }] };
          }
          return prev;
      });
  }, [userId, userName]);

  const sendMessage = useCallback(async (communityId: string, text: string): Promise<{ success: boolean; reason?: string }> => {
      const moderationResult = await moderateChatMessage(text, language);

      if (!moderationResult.isAppropriate) {
          console.warn(`Message blocked: "${text}". Reason: ${moderationResult.reason}`);
          return { success: false, reason: moderationResult.reason || "Message is inappropriate." };
      }

      const newMessage: CommunityMessage = {
          id: `msg-${Date.now()}`, communityId, senderId: userId, senderName: userName, text, timestamp: new Date().toISOString()
      };
      setCommunityMessages(prev => ({ ...prev, [communityId]: [...(prev[communityId] || []), newMessage] }));
      return { success: true };
  }, [userId, userName, language]);

  // Marketplace Handlers
  const addPickupRequest = useCallback((requestData: Omit<PickupRequest, 'id' | 'userId' | 'timestamp' | 'status'>) => {
    const newRequest: PickupRequest = {
        ...requestData,
        id: `pickup-${Date.now()}`,
        userId: userId,
        status: 'Pending',
        timestamp: new Date().toISOString(),
    };
    setPickupRequests(prev => [newRequest, ...prev]);
  }, [userId]);

  const updatePickupStatus = useCallback((requestId: string, status: PickupStatus) => {
    setPickupRequests(prev => prev.map(req => req.id === requestId ? { ...req, status } : req));
    if (status === 'Completed') {
        const hasCompletedBefore = pickupRequests.some(p => p.status === 'Completed');
        if (!hasCompletedBefore) {
            unlockBadge('scrap-seller');
        }
    }
  }, [unlockBadge, pickupRequests]);

  // B2B Portal Handlers
  const addBulkPickupRequest = useCallback((requestData: Omit<BulkPickupRequest, 'id' | 'businessId' | 'timestamp' | 'status'>) => {
      const newRequest: BulkPickupRequest = {
          ...requestData,
          id: `bulk-${Date.now()}`,
          businessId: userId,
          status: 'Requested',
          timestamp: new Date().toISOString(),
      };
      setBulkPickupRequests(prev => [newRequest, ...prev]);
      
      const hasRequestedBefore = bulkPickupRequests.some(p => p.businessId === userId);
      if (!hasRequestedBefore) {
          unlockBadge('corporate-citizen');
      }
  }, [userId, unlockBadge, bulkPickupRequests]);

  const updateBulkPickupStatus = useCallback((requestId: string, status: BulkPickupStatus) => {
      setBulkPickupRequests(prev => prev.map(req => req.id === requestId ? { ...req, status } : req));
  }, []);

  const dispatchVehicleToReport = useCallback((vehicleId: string, reportId: string) => {
    const report = history.find(item => item.id === reportId && item.type === 'report') as ReportHistoryItem | undefined;
    if (!report || !report.data.location) return;

    setVehicles(prev => prev.map(v => 
      v.id === vehicleId 
        ? { ...v, status: VehicleStatus.EN_ROUTE, assignedReportId: reportId, destination: report.data.location }
        : v
    ));
    updateReportStatus(reportId, 'In Progress');
  }, [history, updateReportStatus]);

  // Waste Worker Handlers
  const addEquipmentRequest = useCallback((items: string[], authorityName: string) => {
      const newRequest: EquipmentRequest = {
          id: `equip-${Date.now()}`,
          workerId: userId,
          items,
          authorityName,
          status: 'Pending',
          timestamp: new Date().toISOString(),
      };
      setEquipmentRequests(prev => [newRequest, ...prev]);
  }, [userId]);



  useEffect(() => {
    if (reportCount === 1) unlockBadge('eco-reporter');
    if (reportCount === 3) unlockBadge('community-helper');
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
        return <UserProfile userName={userName} setUserName={handleSetUserName} buildingId={userBuildingId} setBuildingId={handleSetUserBuildingId} />;
      case View.ADMIN_DASHBOARD:
        return <AdminDashboard 
                    reports={reports} 
                    updateReportStatus={updateReportStatus} 
                    updateReportPenaltyStatus={updateReportPenaltyStatus} 
                    assignBuildingToReport={assignBuildingToReport} 
                    buildings={buildings} 
                    addWarningToBuilding={addWarningToBuilding} 
                    addPenaltyToBuilding={addPenaltyToBuilding}
                    vehicles={vehicles}
                    dispatchVehicleToReport={dispatchVehicleToReport}
                />;
      case View.TRANSPARENCY_DASHBOARD:
        return <TransparencyDashboard reports={reports} />;
      case View.TRAINING:
        return <TrainingHub addPoints={addPoints} unlockBadge={unlockBadge} addEquipmentRequest={addEquipmentRequest} />;
      case View.COMMUNITY:
        return <CommunityHub
                    userId={userId}
                    userName={userName}
                    communities={communities}
                    communityMembers={communityMembers}
                    communityMessages={communityMessages}
                    createCommunity={createCommunity}
                    joinCommunity={joinCommunity}
                    sendMessage={sendMessage}
                />;
      case View.BUILDING_STATUS:
        return <BuildingStatus buildingId={userBuildingId} buildings={buildings} />;
      case View.MARKETPLACE:
        return <Marketplace 
                    userId={userId}
                    pickupRequests={pickupRequests.filter(p => p.userId === userId)}
                    addPickupRequest={addPickupRequest}
                    updatePickupStatus={updatePickupStatus}
                    addPoints={addPoints}
               />;
      case View.B2B_PORTAL:
          return <B2BPortal
              businessId={userId}
              requests={bulkPickupRequests.filter(r => r.businessId === userId)}
              addRequest={addBulkPickupRequest}
              updateRequestStatus={updateBulkPickupStatus}
              addPoints={addPoints}
          />;
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