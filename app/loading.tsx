export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4">
      <div className="flex items-center gap-2.5">
        <span
          className="material-symbols-outlined animate-pulse text-2xl text-[#d9a94d]"
          aria-hidden="true"
        >
          hotel
        </span>
        <span className="font-(family-name:--font-playfair-display) text-2xl font-semibold text-[#14213d]">
          Pearlora
        </span>
      </div>
      <div className="flex gap-1.5" aria-label="Loading">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#14213d] [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#14213d] [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#d9a94d]" />
      </div>
    </div>
  );
}
