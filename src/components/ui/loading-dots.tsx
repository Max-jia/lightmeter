export function LoadingDots() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-[var(--color-gold)]"
            style={{
              animation: `dotPulse 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes dotPulse {
          0%, 60%, 100% { opacity: 0.2; transform: scale(0.75); }
          30% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
