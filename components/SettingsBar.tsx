import React from 'react';
import { ShieldCheckIcon } from './IconComponents';

interface SettingsBarProps {
    onRemoveAdsClick: () => void;
}

export const SettingsBar: React.FC<SettingsBarProps> = ({ onRemoveAdsClick }) => {
    return (
        <div className="mb-6">
            <button 
                onClick={onRemoveAdsClick}
                className="w-full flex items-center justify-center bg-green-100 text-green-800 px-4 py-2.5 rounded-lg text-base font-semibold hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                aria-label="Remove advertisements"
            >
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Remove Ads
            </button>
        </div>
    );
};