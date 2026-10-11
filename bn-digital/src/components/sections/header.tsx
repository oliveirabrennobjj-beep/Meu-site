import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand-icons";
import { Button } from "@/components/ui/button";
import { linkWhatsApp, mensagens } from "@/data/site";

const links = [
  { href: "#trabalhos", label: "Trabalhos" },
  { href: "#sites", label: "Sites" },
  { href: "#nfc", label: "Placas NFC" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#duvidas", label: "Dúvidas" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-black/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <a href="#inicio" aria-label="BN Digital, voltar ao início" className="rounded-md">
          <Logo />
        </a>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-[13px] text-white/75 transition-colors hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={linkWhatsApp(mensagens.geral)} target="_blank" rel="noopener noreferrer">
              Pedir orçamento
            </a>
          </Button>
          <button
            type="button"
            className="grid size-11 cursor-pointer place-items-center rounded-full text-white md:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="menu-mobile" className="fixed inset-x-0 top-14 z-40 h-[calc(100dvh-3.5rem)] bg-black/95 backdrop-blur-xl md:hidden">
          <nav aria-label="Menu" className="container-page pt-6">
            <ul>
              {links.map((l) => (
                <li key={l.href} className="border-b border-white/10">
                  <a href={l.href} onClick={() => setOpen(false)} className="block py-4 text-[26px] font-semibold tracking-tight text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-8 w-full">
              <a href={linkWhatsApp(mensagens.geral)} target="_blank" rel="noopener noreferrer">
                Pedir orçamento no WhatsApp
              </a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
