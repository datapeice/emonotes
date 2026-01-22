import { twMerge } from 'tailwind-merge';

export const Button = ({ children, variant = 'primary', className, ...props }) => {
    const baseStyles = "relative overflow-hidden font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    const variants = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        tonal: "btn-tonal",
        text: "btn-text",
        danger: "bg-red-100 text-red-900 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50 rounded-full px-6 py-2.5",
        icon: "p-2 rounded-full hover:bg-surface-variant/50 text-on-surface-variant flex items-center justify-center"
    };

    return (
        <button className={twMerge(baseStyles, variants[variant], className)} {...props}>
            {children}
        </button>
    );
};
