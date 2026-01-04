import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  altText: string;
}

export const ImageGallery = ({ images, altText }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-muted flex items-center justify-center">
        <span className="text-6xl">🧸</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-square md:aspect-video overflow-hidden">
        <img
          src={images[selectedIndex]}
          alt={`${altText} - תמונה ${selectedIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        
        {/* Navigation Arrows - only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToNext}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm shadow-card flex items-center justify-center transition-all hover:bg-background hover:scale-110"
              aria-label="תמונה הבאה"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={goToPrevious}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm shadow-card flex items-center justify-center transition-all hover:bg-background hover:scale-110"
              aria-label="תמונה קודמת"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
            
            {/* Image Counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-foreground shadow-card">
              {selectedIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails - only show if multiple images */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 px-1">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200",
                selectedIndex === index
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-105"
                  : "opacity-60 hover:opacity-100"
              )}
              aria-label={`תמונה ${index + 1}`}
            >
              <img
                src={image}
                alt={`${altText} - תמונה ממוזערת ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
