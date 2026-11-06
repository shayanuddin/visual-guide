import { useEffect, useRef, type Ref } from "react";

// Brand mode's full-screen backdrop (Figma "intel effect"). The dark gradient
// is the scrim itself (--gf-scrim); above it sit the globe video, a grey dim
// and a brand-gradient colour wash. How the globe shows — sharp, blurred or
// hidden — follows the root's data-gf-scene, in guided-flow.css.

const ORB_SRC = `${import.meta.env.BASE_URL}assets/brand/orb.mp4`;

export default function BrandBackdrop({ reducedMotion, ref }: { reducedMotion: boolean; ref?: Ref<HTMLDivElement> }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reduced motion: hold the first frame instead of looping
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reducedMotion) { v.pause(); v.currentTime = 0; }
    else v.play().catch(() => { /* autoplay blocked: the poster frame stays */ });
  }, [reducedMotion]);

  return (
    <div ref={ref} aria-hidden="true" className="absolute inset-0 pointer-events-none">
      <div className="gf-brand-orb">
        <video ref={videoRef} src={ORB_SRC} muted loop playsInline autoPlay={!reducedMotion} preload="auto" />
      </div>
      <div className="gf-brand-dim" />
      <div className="gf-brand-color" />
    </div>
  );
}
