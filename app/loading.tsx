export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F8F2E9] flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[#D9A94D] text-xl animate-pulse">✦</span>
          <span className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D]">
            Pearlora
          </span>
        </div>
        <div className="flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#14213D]/30 animate-bounce [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#14213D]/30 animate-bounce [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#14213D]/30 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
