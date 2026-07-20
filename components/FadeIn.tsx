'use client';
import { useEffect, useRef, useState, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
  style?: React.CSSProperties;
}

export default function FadeIn({ children, delay = 0, direction = 'up', style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const initial = {
    up: 'translateY(28px)',
    left: 'translateX(28px)',
    right: 'translateX(-28px)',
    none: 'none',
  }[direction]; 

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : initial,
      transition: `opacity 0.75s ease ${delay}s, transform 0.75s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}
