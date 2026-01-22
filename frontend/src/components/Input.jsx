import { twMerge } from 'tailwind-merge';

export const Input = ({ label, className, error, ...props }) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium mb-1 text-on-surface-variant ml-1">{label}</label>}
            <input
                className={twMerge("input-field", error && "border-red-500 focus:border-red-500 ring-red-500/20", className)}
                {...props}
            />
            {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
        </div>
    );
};
