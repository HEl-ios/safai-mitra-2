
import React from 'react';
import { View, Badge, HistoryItem, ReportHistoryItem } from '../types.ts';
import Card from './common/Card.tsx';
import { ScanLineIcon, MapPinIcon, BrainCircuitIcon, AlertTriangleIcon, MessageSquareIcon } from './common/Icons.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';
import HistoryList from './HistoryList.tsx';
import ReportMap from './ReportMap.tsx';
import NotificationManager from './NotificationManager.tsx';

interface DashboardProps {
  setView: (view: View) => void;
  userPoints: number;
  unlockedBadges: Badge[];
  history: HistoryItem[];
}

// Fix: Specified a more specific type for the 'icon' prop to allow cloning with a className.
const FeatureCard: React.FC<{ icon: React.ReactElement<{ className?: string }>; title: string; description: string; onClick: () => void; }> = ({ icon, title, description, onClick }) => (
  <Card onClick={onClick} className="flex flex-col items-center text-center p-6 bg-white/50">
    <div className="mb-4 text-green-600 bg-green-100 p-3 rounded-full">{React.cloneElement(icon, { className: "w-8 h-8" })}</div>
    <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </Card>
);

const BadgeDisplay: React.FC<{ badge: Badge }> = ({ badge }) => (
    <div className="relative group" role="button" tabIndex={0} aria-describedby={`badge-desc-${badge.slug}`}>
        <div className="flex flex-col items-center text-center p-2">
            <div className="p-3 bg-gray-200 rounded-full mb-2 transition-transform duration-300 group-hover:scale-110 group-focus:scale-110 group-focus:ring-2 group-focus:ring-green-500 group-focus:outline-none">
                {React.cloneElement(badge.icon, { className: "w-10 h-10" })}
            </div>
            <span className="text-xs font-semibold">{badge.name}</span>
        </div>
        <div
            id={`badge-desc-${badge.slug}`}
            role="tooltip"
            className="absolute bottom-full z-10 mb-2 w-48 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 text-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none"
        >
            {badge.description}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ setView, unlockedBadges, history }) => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <ScanLineIcon />,
      title: t('featureClassifierTitle'),
      description: t('featureClassifierDescription'),
      view: View.CLASSIFIER,
    },
    {
      icon: <MapPinIcon />,
      title: t('featureLocatorTitle'),
      description: t('featureLocatorDescription'),
      view: View.LOCATOR,
    },
    {
      icon: <BrainCircuitIcon />,
      title: t('featureQuizTitle'),
      description: t('featureQuizDescription'),
      view: View.QUIZ,
    },
    {
      icon: <AlertTriangleIcon />,
      title: t('featureReportTitle'),
      description: t('featureReportDescription'),
      view: View.REPORT,
    },
     {
      icon: <MessageSquareIcon />,
      title: t('featureChatbotTitle'),
      description: t('featureChatbotDescription'),
      view: View.CHATBOT,
    },
  ];
  
  const reportHistory = history.filter(item => item.type === 'report') as ReportHistoryItem[];

  return (
    <div className="space-y-8">
      <div className="p-8 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl text-center">
        <h2 className="text-4xl font-bold mb-2">{t('dashboardTitle')}</h2>
        <p className="max-w-2xl mx-auto">{t('dashboardSubtitle')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            onClick={() => setView(feature.view)}
          />
        ))}
      </div>
      
      <div>
        <NotificationManager />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('mapTitle')}</h3>
        <Card className="p-4 sm:p-6">
          <ReportMap reports={reportHistory} />
        </Card>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('yourBadges')}</h3>
        <Card className="p-6">
          {unlockedBadges.length > 0 ? (
             <div className="flex flex-wrap gap-x-4 gap-y-6 justify-center">
                {unlockedBadges.map(badge => (
                    <BadgeDisplay key={badge.slug} badge={badge} />
                ))}
             </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('noBadges')}</p>
            </div>
          )}
        </Card>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('historyTitle')}</h3>
        <Card className="p-4 sm:p-6">
          <HistoryList history={history} />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;