export default function Loading() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[#D8B45A] text-xl animate-pulse">✦</span>
          <span className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#0f1f3d]">
            Pearlora
          </span>
        </div>
        <div className="flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0f1f3d]/30 animate-bounce [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#0f1f3d]/30 animate-bounce [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#0f1f3d]/30 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
