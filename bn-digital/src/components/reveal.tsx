import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Entrada suave ao rolar (desligada automaticamente com "reduzir movimento"). */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
}) {
  const Comp = as === "li" ? motion.li : motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.28, 0.11, 0.32, 1] }}
    >
      {children}
    </Comp>
  );
}
