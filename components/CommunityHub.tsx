import React, { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation.ts';
import { Community, CommunityMember, CommunityMessage } from '../types.ts';
import { UsersIcon, PlusCircleIcon, ArrowLeftIcon } from './common/Icons.tsx';
import Card from './common/Card.tsx';
import CommunityChat from './CommunityChat.tsx';

interface CommunityHubProps {
    userId: string;
    userName: string;
    communities: Community[];
    communityMembers: Record<string, CommunityMember[]>;
    communityMessages: Record<string, CommunityMessage[]>;
    createCommunity: (name: string, description: string) => Community;
    joinCommunity: (communityId: string) => void;
    sendMessage: (communityId: string, text: string) => void;
}

const CreateCommunity: React.FC<{ onCreate: (name: string, description: string) => void }> = ({ onCreate }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && description.trim()) {
            onCreate(name.trim(), description.trim());
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">{t('createCommunityTitle')}</h3>
            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="comm-name" className="block text-sm font-medium text-gray-700">{t('communityName')}</label>
                        <input type="text" id="comm-name" value={name} onChange={e => setName(e.target.value)} placeholder={t('communityNamePlaceholder')} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" required />
                    </div>
                    <div>
                        <label htmlFor="comm-desc" className="block text-sm font-medium text-gray-700">{t('communityDescription')}</label>
                        <textarea id="comm-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('communityDescriptionPlaceholder')} rows={3} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" required />
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400" disabled={!name.trim() || !description.trim()}>{t('createButton')}</button>
                </form>
            </Card>
        </div>
    );
};

const JoinCommunity: React.FC<{ allCommunities: Community[], myCommunities: Community[], onJoin: (id: string) => void, onOpen: (c: Community) => void, userId: string }> = ({ allCommunities, myCommunities, onJoin, onOpen }) => {
    const { t } = useTranslation();
    const myCommunityIds = new Set(myCommunities.map(c => c.id));

    return (
        <div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">{t('joinCommunityTitle')}</h3>
            <Card className="p-4">
                <h4 className="font-semibold mb-2 px-2">{t('allCommunities')}</h4>
                <div className="space-y-2">
                    {allCommunities.length === 0 && <p className="text-center text-gray-500 py-4">{t('noCommunitiesExist')}</p>}
                    {allCommunities.map(comm => {
                        const isMember = myCommunityIds.has(comm.id);
                        return (
                            <div key={comm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold">{comm.name}</p>
                                    <p className="text-sm text-gray-600">{comm.description}</p>
                                </div>
                                <button
                                    onClick={() => isMember ? onOpen(comm) : onJoin(comm.id)}
                                    disabled={isMember}
                                    className="bg-green-600 text-white font-bold py-1 px-3 rounded-lg text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-700"
                                >
                                    {isMember ? t('joinedButton') : t('joinButton')}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

const CommunityHub: React.FC<CommunityHubProps> = (props) => {
    const { t } = useTranslation();
    const [view, setView] = useState<'main' | 'create' | 'join' | 'chat'>('main');
    const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);

    const myCommunities = props.communities.filter(c => 
        props.communityMembers[c.id]?.some(m => m.userId === props.userId)
    );
    
    const handleCreateCommunity = (name: string, description: string) => {
        const newCommunity = props.createCommunity(name, description);
        setActiveCommunity(newCommunity);
        setView('chat');
    }

    const handleJoinCommunity = (communityId: string) => {
        props.joinCommunity(communityId);
    }

    const openChat = (community: Community) => {
        setActiveCommunity(community);
        setView('chat');
    }
    
    const renderContent = () => {
        switch (view) {
            case 'create':
                return <CreateCommunity onCreate={handleCreateCommunity} />;
            case 'join':
                return <JoinCommunity allCommunities={props.communities} myCommunities={myCommunities} onJoin={handleJoinCommunity} onOpen={openChat} userId={props.userId} />;
            case 'chat':
                if (activeCommunity) {
                    return <CommunityChat
                        community={activeCommunity}
                        messages={props.communityMessages[activeCommunity.id] || []}
                        currentUser={{ userId: props.userId, userName: props.userName }}
                        onSendMessage={props.sendMessage}
                    />;
                }
                setView('main'); // Fallback
                return null;
            case 'main':
            default:
                return (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card onClick={() => setView('create')} className="p-6 text-center">
                                <PlusCircleIcon className="w-12 h-12 mx-auto text-green-600 mb-2" />
                                <h3 className="text-xl font-semibold">{t('startCommunity')}</h3>
                            </Card>
                            <Card onClick={() => setView('join')} className="p-6 text-center">
                                <UsersIcon className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                                <h3 className="text-xl font-semibold">{t('joinCommunity')}</h3>
                            </Card>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('yourCommunities')}</h3>
                            <Card className="p-4">
                                <div className="space-y-2">
                                    {myCommunities.length === 0 && <p className="text-center text-gray-500 py-4">{t('noCommunitiesJoined')}</p>}
                                    {myCommunities.map(comm => (
                                        <div key={comm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-semibold">{comm.name}</p>
                                                <p className="text-xs text-gray-500">{t('members', { count: props.communityMembers[comm.id]?.length || 0 })}</p>
                                            </div>
                                            <button onClick={() => openChat(comm)} className="bg-green-600 text-white font-bold py-1 px-3 rounded-lg text-sm hover:bg-green-700">{t('openChat')}</button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {view === 'main' && (
                <>
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('communityHubTitle')}</h2>
                    <p className="text-center text-gray-500 mb-6">{t('communityHubDescription')}</p>
                </>
            )}
            {view !== 'main' && (
                <button onClick={() => setView('main')} className="flex items-center gap-2 font-semibold text-green-700 hover:text-green-800 mb-4">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>{t('communityHubTitle')}</span>
                </button>
            )}
            {renderContent()}
        </div>
    );
};

export default CommunityHub;
