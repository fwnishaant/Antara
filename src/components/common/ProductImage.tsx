'use client';

import React, { useState } from 'react';
import { Package, ImageOff } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  category?: string;
}

const FALLBACK_IMAGES: Record<string, string> = {
  Electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  Fashion: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
  Fitness: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  Accessories: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
  Home: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
};

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
  category = 'Electronics',
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      const fallback = FALLBACK_IMAGES[category] || FALLBACK_IMAGES['Electronics'];
      setImgSrc(fallback);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
      loading="lazy"
    />
  );
};
