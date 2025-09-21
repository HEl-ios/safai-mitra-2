import React, { useState } from 'react';
import Card from '../common/Card.tsx';
import { useTranslation } from '../../i18n/useTranslation.ts';

interface Contact {
  nameKey: string;
  descKey: string;
  website: string;
  phone: string;
}

const centralBodies: Contact[] = [
  { nameKey: 'moefccName', descKey: 'moefccDesc', website: 'https://moefcc.gov.in/', phone: 'tel:+91-11-24695262' },
  { nameKey: 'cpcbName', descKey: 'cpcbDesc', website: 'https://cpcb.nic.in/', phone: 'tel:+91-11-43102030' },
];

const stateData: { [key: string]: Contact[] } = {
  delhi: [
    { nameKey: 'dpccName', descKey: 'dpccDesc', website: 'http://www.dpcc.delhigovt.nic.in/', phone: 'tel:+91-11-23869299' },
    { nameKey: 'chintanName', descKey: 'chintanDesc', website: 'https://www.chintan-india.org/', phone: 'tel:+91-11-46574172' },
  ],
  maharashtra: [
    { nameKey: 'mpcbName', descKey: 'mpcbDesc', website: 'https://mpcb.gov.in/', phone: 'tel:+91-22-24020781' },
  ],
  karnataka: [
    { nameKey: 'swmCellName', descKey: 'swmCellDesc', website: 'https://swm.ulbdict.gov.in/', phone: 'tel:+91-80-2222-2222' }, // Example number
  ],
};

const ContactCard: React.FC<{ contact: Contact }> = ({ contact }) => {
    const { t } = useTranslation();
    return (
        <div className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <h4 className="font-bold text-gray-800">{t(contact.nameKey as any)}</h4>
            <p className="text-sm text-gray-600 mt-1">{t(contact.descKey as any)}</p>
            <div className="flex flex-wrap gap-4 mt-3">
                <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">
                    {t('website')}
                </a>
                <a href={contact.phone} className="text-sm font-semibold text-green-600 hover:underline">
                    {t('contact')}
                </a>
            </div>
        </div>
    );
};


const AuthoritiesNGOs: React.FC = () => {
  const { t } = useTranslation();
  const [selectedState, setSelectedState] = useState('');

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('authoritiesTitle')}</h2>
      <p className="text-center text-gray-500 mb-6">{t('authoritiesDescription')}</p>
      
      <div className="space-y-6">
        {/* Central Bodies */}
        <Card className="p-6 bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('centralBodiesTitle')}</h3>
          <div className="space-y-4">
            {centralBodies.map(body => <ContactCard key={body.nameKey} contact={body} />)}
          </div>
        </Card>

        {/* State-level Bodies */}
        <Card className="p-6 bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('stateContactsTitle')}</h3>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-base focus:border-green-500 focus:ring-2 focus:ring-green-200 mb-4"
          >
            <option value="">{t('selectState')}</option>
            <option value="delhi">Delhi</option>
            <option value="maharashtra">Maharashtra</option>
            <option value="karnataka">Karnataka</option>
          </select>

          {selectedState && stateData[selectedState] && (
            <div className="space-y-4">
              {stateData[selectedState].map(contact => <ContactCard key={contact.nameKey} contact={contact} />)}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AuthoritiesNGOs;