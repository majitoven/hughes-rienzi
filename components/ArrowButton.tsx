import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';

interface Props {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: 'dark' | 'light' | 'white';
  type?: 'button' | 'submit';
  noArrow?: boolean;
  fontSize?: number;
  split?: boolean;
  external?: boolean;
  compact?: boolean;
}

export default function ArrowButton({ href, onClick, children, variant = 'dark', type = 'button', noArrow = false, fontSize, split = false, external = false, compact = false }: Props) {
  if (split) {
    const className = `hr-abtn hr-abtn--${variant}${compact ? ' hr-abtn--compact' : ''}`;
    const content = (
      <>
        <span className="hr-abtn-label" style={{ fontSize: fontSize ?? (compact ? 13 : 14) }}>{children}</span>
        <span className="hr-abtn-circle">
          <Image src="/images/home/arrowblack.png" alt="" width={compact ? 10 : 12} height={compact ? 10 : 12} />
        </span>
      </>
    );
    if (href && external) return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>;
    if (href) return <Link href={href} className={className}>{content}</Link>;
    return <button type={type} onClick={onClick} className={className}>{content}</button>;
  }

  const arrowIcon = variant === 'light' ? '/images/home/arrowwhite.png' : '/images/home/arrowblack.png';
  const className = `hr-abtn-plain hr-abtn-plain--${variant}`;
  const content = (
    <>
      {children}
      {!noArrow && (
        <span className="hr-abtn-plain-circle">
          <Image src={arrowIcon} alt="" width={10} height={10} />
        </span>
      )}
    </>
  );

  if (href) return (
    <Link href={href} className={className} style={{ fontSize: fontSize ?? 14 }}>{content}</Link>
  );
  return (
    <button type={type} onClick={onClick} className={className} style={{ fontSize: fontSize ?? 14 }}>{content}</button>
  );
}
