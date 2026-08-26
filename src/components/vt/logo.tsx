export function VtLogo({ label = true }: { label?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative grid size-8 place-items-center rounded-full bg-primary">
        <span className="absolute inset-0 animate-vt-pulse rounded-full bg-primary" />
        <span className="relative block size-3 rounded-full bg-primary-foreground" />
      </span>
      {label ? (
        <span className="text-[17px] font-bold tracking-tight text-foreground">Voztrace</span>
      ) : null}
    </span>
  );
}
