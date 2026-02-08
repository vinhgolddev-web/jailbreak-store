"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useSound from 'use-sound';

const SoundContext = createContext();

export const useSoundSystem = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
    // Persist mute state
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5); // Default 50%

    useEffect(() => {
        const savedMute = localStorage.getItem('sfx_muted');
        if (savedMute !== null) {
            setIsMuted(JSON.parse(savedMute));
        }
    }, []);

    const toggleMute = () => {
        setIsMuted(prev => {
            const newState = !prev;
            localStorage.setItem('sfx_muted', JSON.stringify(newState));
            return newState;
        });
    };

    // Sound Hooks
    // Note: Paths are relative to /public
    const [playClick] = useSound('/sounds/click.mp3', { volume: isMuted ? 0 : volume });
    const [playHover] = useSound('/sounds/hover.mp3', { volume: isMuted ? 0 : volume * 0.2 }); // Quieter hover
    const [playSuccess] = useSound('/sounds/success.mp3', { volume: isMuted ? 0 : volume });
    const [playError] = useSound('/sounds/error.mp3', { volume: isMuted ? 0 : volume });

    // Gacha Sounds
    const [playSpin, { stop: stopSpin }] = useSound('/sounds/spin.mp3', { volume: isMuted ? 0 : volume, loop: true });
    const [playReveal] = useSound('/sounds/reveal.mp3', { volume: isMuted ? 0 : volume });

    // Win Sounds
    const [playWinCommon] = useSound('/sounds/win-common.mp3', { volume: isMuted ? 0 : volume });
    const [playWinRare] = useSound('/sounds/win-rare.mp3', { volume: isMuted ? 0 : volume });
    const [playWinGodly] = useSound('/sounds/win-godly.mp3', { volume: isMuted ? 0 : volume });
    const [playWinSecret] = useSound('/sounds/win-secret.mp3', { volume: isMuted ? 0 : volume });

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
