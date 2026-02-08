
'use client';
import { useSoundSystem } from '../context/SoundContext';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Adjust import based on your UI lib

export default function SoundToggle() {
    const { isMuted, toggleMute } = useSoundSystem();

    return (
        <button
            onClick={toggleMute}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
        >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
    );
}
