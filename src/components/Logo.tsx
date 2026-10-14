/* Official logo files, used as-is: no glow, shadow, rotation or recolouring (HANDOFF §3). */

export function Logo({ className }: { className?: string }) {
  return <img src="/assets/logo.svg" alt="vpn.free" className={className} />;
}

export function LogoSymbol({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <img src="/assets/logo-symbol.svg" alt="" aria-hidden="true" width={size} height={size} className={className} />
  );
}
