'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const images = [
  { src: '/images/carousel/daily-communication.svg', alt: 'Daily Communication' },
  { src: '/images/carousel/real-time-tracking.svg', alt: 'Real-Time Tracking' },
  { src: '/images/carousel/routine-control.svg', alt: 'Routine Control' },
  { src: '/images/carousel/direct-contact.svg', alt: 'Direct Contact' },
];

export default function LoginCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden mt-8">
      {/* Images container */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            priority={index === 0}
            unoptimized
          />
        </div>
      ))}

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white w-6'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
