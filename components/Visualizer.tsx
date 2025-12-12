import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  volume: number; // 0 to 1
  isActive: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ volume, isActive }) => {
  const bars = 5;
  
  return (
    <div className="flex items-center justify-center gap-1.5 h-12">
      {Array.from({ length: bars }).map((_, i) => {
        // Simple animation logic based on volume and index
        const height = isActive 
            ? Math.max(8, Math.min(48, volume * 100 * (1 + Math.random()))) 
            : 4;
            
        return (
          <div
            key={i}
            className="w-2 bg-luminary-600 rounded-full transition-all duration-75 ease-in-out"
            style={{ 
                height: `${height}px`,
                opacity: isActive ? 1 : 0.3
            }}
          />
        );
      })}
    </div>
  );
};

export default Visualizer;