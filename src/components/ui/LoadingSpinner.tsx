export default function LoadingSpinner({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height: size * 2 }}>
      <div
        className="rounded-full border-4 border-white/10 border-t-violet-500 animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
