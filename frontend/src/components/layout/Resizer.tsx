import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

interface ResizerProps {
    orientation: 'vertical' | 'horizontal';
    onResize: (delta: number) => void;
    className?: string; // Additional classes
}

export function Resizer({ orientation, onResize, className }: ResizerProps) {
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            // Check orientation to pass correct delta
            if (orientation === 'vertical') {
                onResize(e.movementX);
            } else {
                onResize(e.movementY);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
        };
    }, [isDragging, orientation, onResize]);

    const handleMouseDown = () => {
        setIsDragging(true);
        document.body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize';
    };

    return (
        <div
            className={cn(
                "absolute bg-transparent hover:bg-blue-400/50 transition-colors z-50",
                orientation === 'vertical' ? "w-1 h-full cursor-col-resize top-0" : "h-1 w-full cursor-row-resize left-0",
                className
            )}
            onMouseDown={handleMouseDown}
        />
    );
}
