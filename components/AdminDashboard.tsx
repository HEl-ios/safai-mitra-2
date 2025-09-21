import React, { useState, useMemo } from 'react';
import { ReportHistoryItem, ReportStatus, PenaltyStatus, Building, PenaltyType, Penalty } from '../types.ts';
import Card from './common/Card.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';
import { AlertTriangleIcon, ClockIcon, ChevronDownIcon, MapPinIcon, DollarSignIcon } from './common/Icons.tsx';

interface AdminDashboardProps {
  reports: ReportHistoryItem[];
  updateReportStatus: (reportId: string, newStatus: ReportStatus) => void;
  updateReportPenaltyStatus: (reportId: string, newStatus: PenaltyStatus) => void;
  assignBuildingToReport: (reportId: string, buildingId: string) => void;
  buildings: Building[];
  addWarningToBuilding: (buildingId: string, reason: string) => void;
  addPenaltyToBuilding: (buildingId: string, penalty: Omit<Penalty, 'id' | 'timestamp' | 'isResolved'>) => void;
}

const getStatusClasses = (status: ReportStatus | PenaltyStatus): string => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-400';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-400';
      case 'Drafted':
        return 'bg-orange-100 text-orange-800 border-orange-400';
      case 'Issued':
        return 'bg-red-100 text-red-800 border-red-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400';
    }
};

const StatusBadge: React.FC<{ status: ReportStatus | PenaltyStatus; isLarge?: boolean; type: 'report' | 'penalty' }> = ({ status, isLarge, type }) => {
    const { t } = useTranslation();
    const key = type === 'report' 
      ? `reportStatus${status.replace(' ', '')}` as any 
      : `penaltyStatus${status}` as any;
    const sizeClass = isLarge ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
    
    return (
        <span className={`font-semibold rounded-full border ${sizeClass} ${getStatusClasses(status)}`}>
            {t(key)}
        </span>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ reports, updateReportStatus, updateReportPenaltyStatus, assignBuildingToReport, buildings, addWarningToBuilding, addPenaltyToBuilding }) => {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [showPenaltyModal, setShowPenaltyModal] = useState<string | null>(null); // Holds buildingId

  const stats = useMemo(() => {
    return reports.reduce(
      (acc, report) => {
        if (report.data.status === 'Pending') acc.pending++;
        if (report.data.status === 'Resolved') acc.resolved++;
        acc.total++;
        return acc;
      },
      { total: 0, pending: 0, resolved: 0 }
    );
  }, [reports]);

  const toggleExpand = (id: string) => {
    setExpandedId(prevId => (prevId === id ? null : id));
    setSelectedBuilding(''); // Reset building selection on collapse/expand
  };

  const handleAssignBuilding = (reportId: string) => {
    if (selectedBuilding) {
        assignBuildingToReport(reportId, selectedBuilding);
    }
  };
  
  const handleApplyPenalty = (buildingId: string, type: PenaltyType) => {
      const details = type === 'Fine' ? 'Fine of ₹5000 for repeated non-compliance' : 'Waste collection suspended for 3 days';
      addPenaltyToBuilding(buildingId, { type, details });
      setShowPenaltyModal(null);
  };
  
  // Sort reports to show Pending first, then In Progress, then newest first
  const sortedReports = [...reports].sort((a, b) => {
    const statusOrder = { 'Pending': 1, 'In Progress': 2, 'Resolved': 3 };
    if (statusOrder[a.data.status] < statusOrder[b.data.status]) return -1;
    if (statusOrder[a.data.status] > statusOrder[b.data.status]) return 1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });


  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">{t('adminDashboardTitle')}</h2>
        <p className="text-gray-500 mt-1">{t('adminDashboardDescription')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-500">{t('totalReports')}</h3>
          <p className="text-4xl font-bold text-gray-800">{stats.total}</p>
        </Card>
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold text-yellow-600">{t('pendingReports')}</h3>
          <p className="text-4xl font-bold text-yellow-700">{stats.pending}</p>
        </Card>
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold text-green-600">{t('resolvedReports')}</h3>
          <p className="text-4xl font-bold text-green-700">{stats.resolved}</p>
        </Card>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('allReports')}</h3>
        <Card className="p-4 sm:p-6">
          {reports.length > 0 ? (
            <div className="space-y-3">
              {sortedReports.map((report) => {
                const isExpanded = expandedId === report.id;
                const buildingOfReport = buildings.find(b => b.id === report.data.buildingId);
                const reportsForBuilding = buildingOfReport ? reports.filter(r => r.data.buildingId === buildingOfReport.id) : [];

                return (
                  <div key={report.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <button 
                        onClick={() => toggleExpand(report.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                        aria-expanded={isExpanded}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-100 rounded-full flex items-center justify-center relative">
                                <AlertTriangleIcon className="w-6 h-6 text-red-500" />
                                {report.data.penaltyStatus === 'Drafted' && (
                                  <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-0.5">
                                    <DollarSignIcon className="w-3 h-3 text-white" />
                                  </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800 truncate max-w-xs">{report.data.description}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <ClockIcon className="w-3 h-3"/>
                                    <span>{report.timestamp.toLocaleString()}</span>
                                    {buildingOfReport && <span className="font-semibold text-blue-600">({buildingOfReport.name})</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <StatusBadge status={report.data.status} type="report" />
                            <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                    </button>
                    {isExpanded && (
                      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
                        <div>
                          <img src={report.data.image} alt="Reported waste" className="max-h-80 w-full object-contain rounded-md mb-2 bg-gray-100 p-1" />
                          <p className="text-gray-700 whitespace-pre-wrap">{report.data.description}</p>
                          {report.data.location && (
                             <a 
                                href={`https://www.google.com/maps?q=${report.data.location.latitude},${report.data.location.longitude}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                              >
                               <MapPinIcon className="w-4 h-4" />
                               View Location on Map
                             </a>
                          )}
                        </div>
                        {report.data.analysis && (
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-sm mb-2">{t('aiAnalysisSectionTitle')}</h4>
                                {report.data.analysis.isBulkGenerator && (
                                    <div className="mb-2 p-2 text-center bg-orange-100 text-orange-800 text-sm font-bold rounded-md">
                                        {t('bulkGeneratorDetected')}
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="font-medium text-gray-500">{t('estimatedVolume')}:</div>
                                    <div className="font-semibold text-gray-800">{report.data.analysis.estimatedVolume}</div>
                                    <div className="font-medium text-gray-500">{t('wasteCategory')}:</div>
                                    <div className="font-semibold text-gray-800">{report.data.analysis.wasteTypeCategory}</div>
                                    <div className="font-medium text-gray-500 col-span-2">{t('aiSummary')}:</div>
                                    <div className="text-gray-800 col-span-2 italic">"{report.data.analysis.analysisSummary}"</div>
                                </div>
                            </div>
                        )}
                        <div className="border-t pt-4 space-y-3">
                            {!report.data.buildingId && (
                                <div>
                                    <label htmlFor={`building-select-${report.id}`} className="font-semibold text-sm mb-1 block">{t('assignBuilding')}</label>
                                    <div className="flex gap-2">
                                        <select id={`building-select-${report.id}`} value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)} className="flex-grow rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
                                            <option value="">Select a building...</option>
                                            {buildings.map(b => <option key={b.id} value={b.id}>{b.name} - {b.address}</option>)}
                                        </select>
                                        <button onClick={() => handleAssignBuilding(report.id)} disabled={!selectedBuilding} className="bg-blue-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-blue-700 text-sm disabled:bg-gray-400">{t('confirm')}</button>
                                    </div>
                                </div>
                            )}

                             {buildingOfReport && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">{t('enforcementActions')} for {buildingOfReport.name}</h4>
                                    <p className="text-xs text-gray-500 mb-2">This building has {reportsForBuilding.length} report(s) associated with it.</p>
                                    <div className="flex flex-wrap gap-2 relative">
                                        <button onClick={() => addWarningToBuilding(buildingOfReport.id, `Warning issued based on report #${report.id.slice(-4)} and other similar reports.`)} className="bg-yellow-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-yellow-600 text-sm">{t('issueWarning')}</button>
                                        <button onClick={() => setShowPenaltyModal(buildingOfReport.id)} className="bg-red-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-700 text-sm">{t('applyPenalty')}</button>
                                        
                                        {showPenaltyModal === buildingOfReport.id && (
                                            <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-xl z-10 p-2 space-y-2">
                                                <button onClick={() => handleApplyPenalty(buildingOfReport.id, 'Fine')} className="w-full text-left text-sm p-2 hover:bg-gray-100 rounded">{t('penaltyTypeFine')}</button>
                                                <button onClick={() => handleApplyPenalty(buildingOfReport.id, 'CollectionSuspended')} className="w-full text-left text-sm p-2 hover:bg-gray-100 rounded">{t('penaltyTypeSuspend')}</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('noReportsFound')}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;