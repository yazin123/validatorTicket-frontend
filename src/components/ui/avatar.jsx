// components/ui/avatar.jsx
import React from 'react';


const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
};

export default function Avatar({
    src,
    alt = '',
    size = 'md',
    className = '',
    children,
    ...props
}) {
    const sizeClass = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium overflow-hidden ${sizeClass} ${className}`} {...props}>
            {
                src?(
                <img src = { src } alt = { alt } className = "object-cover w-full h-full" />
            ): (
                        children || '?'
            )}
        </div >
    );
}
