
import React, { useState } from 'react';
import Card from './common/Card.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';

interface UserProfileProps {
    userName: string;
    setUserName: (name: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userName, setUserName }) => {
    const { t, language, setLanguage } = useTranslation();
    const [currentName, setCurrentName] = useState(userName);
    const [saved, setSaved] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setUserName(currentName);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000); // Hide message after 2 seconds
    };

    return (
        <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('profileTitle')}</h2>
            <p className="text-center text-gray-500 mb-6">{t('profileDescription')}</p>
            <Card className="p-6">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            {t('profileNameLabel')}
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={currentName === 'Eco-Warrior' ? '' : currentName}
                            onChange={(e) => setCurrentName(e.target.value)}
                            placeholder={t('profileNamePlaceholder')}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-base text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                            {t('profileLanguageLabel')}
                        </label>
                        <select
                            id="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-base text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-200"
                        >
                            <option value="en">{t('english')}</option>
                            <option value="hi">{t('hindi')}</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors w-full"
                        >
                            {t('profileSaveButton')}
                        </button>
                    </div>
                    {saved && (
                        <p className="text-sm text-center text-green-600 animate-pulse">
                            {t('profileSavedMessage')}
                        </p>
                    )}
                </form>
            </Card>
        </div>
    );
};

export default UserProfile;
