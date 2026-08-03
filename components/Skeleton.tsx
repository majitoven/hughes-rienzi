interface Props {
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export default function Skeleton({ width = '100%', height, aspectRatio, borderRadius = 12, style }: Props) {
  return (
    <div className="hr-skeleton" style={{ width, height, aspectRatio, borderRadius, ...style }} />
  );
}
