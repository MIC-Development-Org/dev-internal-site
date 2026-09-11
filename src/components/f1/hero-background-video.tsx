/**
 * Race footage backdrop for the landing/login screens: muted, looping,
 * hidden below md (mobile data) and under prefers-reduced-motion, and
 * always sat behind a carbon-black scrim so foreground text stays legible.
 */
export function HeroBackgroundVideo() {
  return (
    <div className="absolute inset-0 overflow-hidden motion-reduce:hidden">
      <video
        className="hidden h-full w-full object-cover opacity-40 md:block"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/videos/hero-racing.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />
      <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
    </div>
  );
}
