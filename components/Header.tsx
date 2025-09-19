
import React from 'react';
import { View } from '../types.ts';
import { GemIcon, LogoIcon, ArrowLeftIcon } from './common/Icons.tsx';
import LanguageSwitcher from './LanguageSwitcher.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';


interface HeaderProps {
  setView: (view: View) => void;
  userPoints: number;
  currentView: View;
}

const Header: React.FC<HeaderProps> = ({ setView, userPoints, currentView }) => {
  const { t } = useTranslation();
  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {currentView !== View.DASHBOARD && (
              <button
                onClick={() => setView(View.DASHBOARD)}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors mr-2"
                aria-label="Go back to dashboard"
              >
                <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
              </button>
            )}
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => setView(View.DASHBOARD)}
              aria-label="Go to dashboard"
            >
              <LogoIcon className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-green-700">{t('appName')}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-100 text-green-800 font-semibold px-4 py-2 rounded-full">
                <GemIcon className="h-5 w-5"/>
                <span>{userPoints}</span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;