'use client';

import { useState } from 'react';
import { StarIcon } from '@heroicons/react/20/solid';

/**
 * Componente para mostrar y permitir calificar un producto
 * @param {Object} props
 * @param {number} props.rating - La valoración actual (de 0 a 5)
 * @param {number} props.reviewCount - El número de reseñas
 * @param {boolean} props.readOnly - Si es solo lectura o permite interacción
 * @param {function} props.onChange - Función a llamar cuando se cambia la calificación
 */
export default function ProductRating({ rating = 0, reviewCount = 0, readOnly = true, onChange }) {
  const [hoveredRating, setHoveredRating] = useState(0);
  
  // Convertir rating a un valor entre 0 y 5
  const normalizedRating = Math.max(0, Math.min(5, rating));
  
  // Crear un array de 5 estrellas
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  
  // Manejar click en una estrella
  const handleRatingClick = (value) => {
    if (readOnly) return;
    if (onChange) onChange(value);
  };
  
  return (
    <div className="flex items-center">
      <div className="flex items-center">
        {stars.map((star) => (
          <StarIcon
            key={star}
            className={`h-5 w-5 flex-shrink-0 cursor-${readOnly ? 'default' : 'pointer'} ${
              (hoveredRating || normalizedRating) >= star
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
            aria-hidden="true"
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => !readOnly && setHoveredRating(star)}
            onMouseLeave={() => !readOnly && setHoveredRating(0)}
          />
        ))}
      </div>
      
      {reviewCount > 0 && (
        <p className="ml-2 text-sm text-gray-600">
          {reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'}
        </p>
      )}
    </div>
  );
}
