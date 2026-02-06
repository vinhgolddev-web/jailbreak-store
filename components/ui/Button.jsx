import { twMerge } from 'tailwind-merge';

export default function Button({
    children,
    variant = 'primary',
    className,
    ...props
}) {
    const baseStyles = "px-5 py-2.5 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-white text-black hover:bg-gray-200 border border-transparent shadow-sm",
        secondary: "bg-black text-white border border-zinc-800 hover:bg-zinc-900 hover:text-white",
        outline: "bg-transparent border border-zinc-700 text-zinc-400 hover:text-white hover:border-white",
        danger: "bg-red-500 text-white hover:bg-red-600 border border-red-600"
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
