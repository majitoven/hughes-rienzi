interface Props {
  message: string;
  ok?: boolean;
}

export default function Toast({ message, ok = true }: Props) {
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: ok ? 'var(--black)' : '#C8102E', color: '#fff',
      padding: '14px 28px', borderRadius: 999, fontSize: 14,
      fontFamily: 'var(--font)', fontWeight: 400,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 999,
      animation: 'toastIn 0.3s ease',
    }}>
      {message}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}
