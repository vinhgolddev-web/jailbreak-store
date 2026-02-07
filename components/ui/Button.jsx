import { twMerge } from 'tailwind-merge';

export default function Button({
    children,
    variant = 'primary',
    className,
    ...props
}) {
    const baseStyles = "px-5 py-2.5 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gradient-to-r from-primary to-primaryHover text-black hover:shadow-[0_0_20px_rgba(255,159,10,0.4)] hover:scale-[1.02] border-none font-bold",
        secondary: "bg-surfaceHighlight text-white border border-white/5 hover:bg-white/10 hover:border-white/20",
        outline: "bg-transparent border border-white/20 text-gray-400 hover:text-white hover:border-white hover:bg-white/5",
        ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
    };

    return (
        <button
            type="button"
            aria-pressed={props["aria-pressed"]}
            className={twMerge(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
}
