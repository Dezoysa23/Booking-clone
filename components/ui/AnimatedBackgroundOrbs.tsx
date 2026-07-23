/**
 * Soft decorative gradient orbs for auth / form page backgrounds.
 * Absolutely positioned — parent must have `position: relative; overflow: hidden`.
 * Animations are defined in globals.css and respect prefers-reduced-motion globally.
 */
export default function AnimatedBackgroundOrbs() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="auth-orb-1 absolute -top-24 -left-20 h-80 w-80 rounded-full bg-[#14213D]/7 blur-3xl" />
      <div className="auth-orb-2 absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#D9A94D]/7 blur-3xl" />
      <div className="auth-orb-3 absolute top-1/2 left-1/3 -translate-y-1/2 h-56 w-56 rounded-full bg-[#16233F]/5 blur-3xl" />
    </div>
  );
}
