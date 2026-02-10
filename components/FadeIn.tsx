import React, { useRef, useEffect, useState } from 'react';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  fullWidth?: boolean;
  onClick?: () => void;
}

export const FadeIn = ({ children, delay = 0, className = "", direction = 'up', fullWidth = false, onClick }: FadeInProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (domRef.current) observer.unobserve(domRef.current);
        }
      });
    }, { threshold: 0.1 });

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  const getTransform = () => {
      if (direction === 'up') return 'translate-y-8';
      if (direction === 'down') return '-translate-y-8';
      if (direction === 'left') return '-translate-x-8'; // Starts left, moves to center
      if (direction === 'right') return 'translate-x-8'; // Starts right, moves to center
      return '';
  };

  return (
    <div
      ref={domRef}
      onClick={onClick}
      className={`transition-all duration-700 ease-out transform ${fullWidth ? 'w-full' : ''} ${className} ${
        isVisible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${getTransform()}`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};