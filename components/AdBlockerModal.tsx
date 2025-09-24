import React from 'react';
import { CloseIcon, ShieldCheckIcon } from './IconComponents';
import type { AdBlockerStatus } from '../types';

interface AdBlockerModalProps {
    onClose: () => void;
    onPurchase: (status: AdBlockerStatus) => void;
}

export const AdBlockerModal: React.FC<AdBlockerModalProps> = ({ onClose, onPurchase }) => {

    const handleYearlyPurchase = () => {
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        onPurchase({ status: 'yearly', expiry: expiryDate.toISOString() });
    }
    
    const handleLifetimePurchase = () => {
        onPurchase({ status: 'lifetime' });
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
                <header className="relative p-5 text-center border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Remove Ads</h2>
                    <p className="text-gray-600 mt-1">Enjoy an ad-free experience!</p>
                    <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:bg-gray-100 rounded-full p-2">
                        <CloseIcon />
                    </button>
                </header>

                <div className="p-6 space-y-4">
                    <PurchaseOption
                        price="$0.99"
                        period="per year"
                        description="Billed once a year."
                        onClick={handleYearlyPurchase}
                    />
                    <PurchaseOption
                        price="$8.88"
                        period="for a lifetime"
                        description="One-time payment, forever ad-free."
                        isBestValue={true}
                        onClick={handleLifetimePurchase}
                    />
                </div>

                 <footer className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-b-2xl">
                    <p>This is a simulated purchase for demonstration purposes. No real payment will be processed. Your ad-free status will be saved on this device.</p>
                </footer>
            </div>
        </div>
    );
};

interface PurchaseOptionProps {
    price: string;
    period: string;
    description: string;
    isBestValue?: boolean;
    onClick: () => void;
}

const PurchaseOption: React.FC<PurchaseOptionProps> = ({ price, period, description, isBestValue, onClick }) => (
    <button 
        onClick={onClick}
        className={`relative w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ease-in-out ${isBestValue ? 'border-green-500 bg-green-50 hover:bg-green-100' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
    >
        {isBestValue && (
            <div className="absolute -top-3 right-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                BEST VALUE
            </div>
        )}
        <div className="flex items-center">
            <ShieldCheckIcon className={`w-8 h-8 mr-4 ${isBestValue ? 'text-green-600' : 'text-gray-500'}`} />
            <div>
                <p className="text-xl font-bold text-gray-900">
                    {price} <span className="text-base font-normal text-gray-600">{period}</span>
                </p>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
    </button>
);
