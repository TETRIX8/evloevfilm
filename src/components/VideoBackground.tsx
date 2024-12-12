import React from 'react';

export function VideoBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <iframe
        src="https://www.youtube.com/embed/C5WTGOdOek0?autoplay=1&controls=0&showinfo=0&mute=0&loop=1&playlist=C5WTGOdOek0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className="absolute w-[300%] h-[300%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{ pointerEvents: 'none' }}
      />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
    </div>
  );
}