import { memo, useRef, useEffect } from 'react';
import Image from 'next/image';

const getRarityColor = (rarity) => {
    switch (rarity) {
        case 'Common': return 'text-gray-400';
        case 'Uncommon': return 'text-green-400';
        case 'Rare': return 'text-blue-400';
        case 'Epic': return 'text-purple-400';
        case 'Legendary': return 'text-orange-400';
        case 'HyperChrome': return 'text-pink-500 animate-pulse';
        case 'Godly': return 'text-red-500 animate-pulse font-bold';
        case 'Secret': return 'text-yellow-400 animate-pulse font-black';
        default: return 'text-gray-400';
    }
};

const getRarityBorderColor = (rarity) => {
    switch (rarity) {
        case 'Common': return 'border-gray-500';
        case 'Godly': return 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]';
        case 'Secret': return 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.8)]';
        default: return 'border-gray-700';
    }
};

const GachaSpinner = memo(({ rollItems, activeCase }) => {
    const spinnerRef = useRef(null);

    useEffect(() => {
        if (rollItems.length > 0) {
            setTimeout(() => {
                if (spinnerRef.current) {
                    const cardWidth = 112;
                    const gap = 8;
                    const totalWidth = cardWidth + gap;
                    const winnerOffset = 45 * totalWidth;
                    const randomOffset = Math.floor(Math.random() * 80) - 40;

                    spinnerRef.current.style.transition = 'transform 6s cubic-bezier(0.15, 0, 0.15, 1)';
                    spinnerRef.current.style.transform = `translate3d(-${winnerOffset + randomOffset}px, -50%, 0)`;
                }
            }, 100);
        }
    }, [rollItems]);

    return (
        <div className="relative h-48 bg-[#0a0a0a] rounded-xl border border-primary/30 overflow-hidden mb-8 shadow-[0_0_50px_rgba(255,159,10,0.1)] max-w-[100vw]">
            <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-primary z-20 shadow-[0_0_15px_rgba(255,159,10,1)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rotate-45 z-20" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-primary rotate-45 z-20" />

            <div className="absolute top-1/2 left-1/2 flex items-center gap-2 will-change-transform" ref={spinnerRef} style={{ transform: 'translate3d(0, -50%, 0)' }}>
                {rollItems.length > 0 ? rollItems.map((item) => (
                    <div
                        key={item.id}
                        className={`relative w-28 h-36 flex-shrink-0 bg-[#181A20] border-b-4 ${getRarityBorderColor(item.rarity)} flex flex-col items-center justify-center p-2 rounded-lg`}
                    >
                        <div className="relative w-20 h-20 mb-2">
                            <Image
                                src={item.rarity === 'Secret' ? '/cs2_mystery_icon.png' : item.image}
                                alt={item.name}
                                fill
                                className={`object-contain ${item.rarity === 'Secret' ? 'scale-110 drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]' : ''}`}
                            />
                        </div>
                        <span className={`text-[10px] font-bold truncate w-full text-center ${getRarityColor(item.rarity)}`}>
                            {item.name}
                        </span>
                    </div>
                )) : (
                    activeCase.items.slice(0, 10).map((item, i) => (
                        <div key={i} className="w-28 h-36 flex-shrink-0 bg-[#181A20] border-b-4 border-gray-700 flex flex-col items-center justify-center p-2 rounded-lg opacity-50">
                            <div className="w-16 h-16 bg-white/5 rounded-full" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});

GachaSpinner.displayName = 'GachaSpinner';
export default GachaSpinner;
