import { cn } from "@/lib/utils";

/** Moldura de celular para exibir um print de site. */
export function PhoneFrame({ src, alt, className, eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  return (
    <div
      className={cn(
        "relative aspect-[9/16.6] w-full rounded-[44px] bg-[#1c1c1e] p-[10px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(255,255,255,0.06)]",
        className,
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[34px] bg-black">
        <img
          src={src}
          alt={alt}
          width={640}
          height={1350}
          loading={eager ? "eager" : "lazy"}
          className="h-full w-full object-cover object-top"
        />
        <span aria-hidden="true" className="absolute left-1/2 top-2.5 h-[22px] w-[30%] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}
