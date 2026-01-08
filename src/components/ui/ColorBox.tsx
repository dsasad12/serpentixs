import { useRef, useEffect } from 'react';

interface ColorBoxProps {
  color: string;
  className?: string;
}

/**
 * Componente que muestra un color de fondo dinámico sin usar inline styles en JSX
 */
const ColorBox = ({ color, className = '' }: ColorBoxProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.backgroundColor = color;
    }
  }, [color]);

  return <div ref={ref} className={className} />;
};

export default ColorBox;
