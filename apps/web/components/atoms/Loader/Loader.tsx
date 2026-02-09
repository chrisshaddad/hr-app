'use client';

const Loader = () => {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span
        className="relative inline-block w-12 h-12 rounded-full border-t-4 border-r-4 border-t-white border-r-transparent pointer-events-none"
        style={{
          animation: 'rotation 1s linear infinite',
        }}
      >
        <span
          className="absolute left-0 top-0 w-12 h-12 rounded-full border-l-4 border-b-4 border-b-transparent"
          style={{
            animation: 'rotation 0.5s linear infinite reverse',
            borderLeftColor: 'var(--color-Alerts-Success-Base)',
          }}
        />
      </span>
    </div>
  );
};

export { Loader };
