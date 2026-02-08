"use client";
import React, { useContext, useState, useEffect, useCallback } from 'react';
import useSound from 'use-sound';

const SoundContext = React.createContext({
    playClick: () => { },
    playHover: () => { },
    playSuccess: () => { },
    playError: () => { },
    playSpin: () => { },
    stopSpin: () => { },
    playReveal: () => { },
    playWinSound: () => { },
    isMuted: false,
    toggleMute: () => { },
});

export const useSoundSystem = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
    // Persist mute state
    const [isMuted, setIsMuted] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedMute = localStorage.getItem('sfx_muted');
            return savedMute !== null ? JSON.parse(savedMute) : false;
        }
        return false;
    });
    const [volume, setVolume] = useState(0.5); // Default 50%

    const toggleMute = () => {
        setIsMuted(prev => {
            const newState = !prev;
            localStorage.setItem('sfx_muted', JSON.stringify(newState));
            return newState;
        });
    };

    // Sound Hooks
    // Note: Paths are relative to /public
    // Wrap useSound in a safe way if possible, but use-sound hook is usually safe?
    // Actually, useSound might return nulls during SSR?
    // Let's keep it simple for now, just fixing the createContext error.

    const [playClick] = useSound('/sounds/click.mp3', { volume: isMuted ? 0 : volume });
    const [playHover] = useSound('/sounds/hover.mp3', { volume: isMuted ? 0 : volume * 0.2 }); // Quieter hover
    const [playSuccess] = useSound('/sounds/success.mp3', { volume: isMuted ? 0 : volume });
    const [playError] = useSound('/sounds/error.mp3', { volume: isMuted ? 0 : volume });

    // Gacha Sounds
    const [playSpin, { stop: stopSpin }] = useSound('/sounds/spin.mp3', { volume: isMuted ? 0 : volume, loop: true });
    const [playReveal] = useSound('/sounds/reveal.mp3', { volume: isMuted ? 0 : volume });

    // Win Sounds
    const [playWinCommon] = useSound('/sounds/win.mp3', { volume: isMuted ? 0 : volume });
    const [playWinRare] = useSound('/sounds/win.mp3', { volume: isMuted ? 0 : volume });
    const [playWinGodly] = useSound('/sounds/win.mp3', { volume: isMuted ? 0 : volume });
    const [playWinSecret] = useSound('/sounds/win.mp3', { volume: isMuted ? 0 : volume });

    const playWinSound = useCallback((rarity) => {
        switch (rarity) {
            case 'Common': case 'Uncommon': playWinCommon(); break;
            case 'Rare': case 'Epic': playWinRare(); break;
            case 'Legendary': case 'HyperChrome': case 'Godly': playWinGodly(); break;
            case 'Secret': playWinSecret(); break;
            default: playWinCommon();
        }
    }, [playWinCommon, playWinRare, playWinGodly, playWinSecret]);

    const value = {
        isMuted,
        toggleMute,
        volume,
        setVolume,
        playClick,
        playHover,
        playSuccess,
        playError,
        playSpin,
        stopSpin,
        playReveal,
        playWinSound
    };

    return (
        <SoundContext.Provider value={value}>
            {children}
        </SoundContext.Provider>
    );
};
