"use client";

import type { ElementType, ReactNode } from "react";
import { AlertCircle, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
  Componente original "boxly-pricing-1". Sem props, renderiza exatamente o original.
  Extensões opcionais usadas no site da BR Team:
  - `tiers`: planos próprios; `href` em um plano faz o botão virar link (WhatsApp);
    `period` troca o "/month" (null esconde);
  - `eyebrow`, `title`, `aside`, `includedLabel`: textos do topo e da lista;
  - `featuredIcon`: ícone da lista do plano em destaque (o original usa AlertCircle);
  - `className`: classes do contêiner externo (o original ocupa a tela toda).
*/

export type PricingTier = {
  cta: string;
  description: string;
  featured: boolean;
  features: string[];
  name: string;
  price: string;
  period?: string | null;
  href?: string;
  note?: string;
};

const pricingTiers: PricingTier[] = [
  {
    cta: "GET STARTED FREE",
    description: "Perfect for individuals getting started",
    featured: false,
    features: [
      "Access to 50+ Templates",
      "Basic AI Writer",
      "Limited Word Count",
      "Email Support",
      "Brand Voice Customization",
      "SEO Optimization Tools",
    ],
    name: "FREE",
    price: "$0",
  },
  {
    cta: "START 7-DAY FREE TRIAL",
    description: "Best for solo creators and marketers",
    featured: true,
    features: [
      "Everything in Free",
      "Unlimited Words",
      "Export to WordPress & Notion",
      "Long-Form Assistant",
      "Brand Voice Customization",
      "SEO Optimization Tools",
    ],
    name: "PRO",
    price: "$299",
  },
  {
    cta: "CONTACT SALES",
    description: "For the growing teams and businesses",
    featured: false,
    features: [
      "Everything in Pro",
      "5 User Seats",
      "Shared Workspaces",
      "Team Performance Analytics",
      "Priority Support",
      "SEO Optimization Tools",
    ],
    name: "ENTERPRISE",
    price: "Contact us",
  },
];

export default function PricingSection({
  tiers = pricingTiers,
  eyebrow = "SIMPLE, SCALABLE PRICING",
  title = (
    <>
      Plans that fit your <span className="text-gray-500">writing needs</span>
    </>
  ),
  aside = (
    <>
      <span className="text-white">Simple pricing</span> with powerful tools to help you write faster
    </>
  ),
  includedLabel = "WHAT'S INCLUDED:",
  titleClassName = "font-normal text-3xl tracking-tight md:text-5xl",
  featuredIcon: FeaturedIcon = AlertCircle,
  className,
  id,
}: {
  tiers?: PricingTier[];
  eyebrow?: ReactNode;
  title?: ReactNode;
  aside?: ReactNode;
  includedLabel?: string;
  titleClassName?: string;
  featuredIcon?: ElementType;
  className?: string;
  id?: string;
}) {
  return (
    <div id={id} className={cn("min-h-screen bg-black px-4 text-white", className)}>
      <div className="mx-auto max-w-5xl border-neutral-700 border-x py-20">
        <div className="mb-10 grid grid-cols-1 items-center gap-6 px-4 md:grid-cols-12 md:px-10">
          <div className="md:col-span-8">
            {eyebrow && (
              <p className="mb-4 w-fit rounded-full border border-neutral-700 px-2 py-0.5 text-red-400 text-xs tracking-wide">
                {eyebrow}
              </p>
            )}
            <h2 className={titleClassName}>{title}</h2>
          </div>
          <div className="md:col-span-4 md:mt-auto">
            <p className="text-gray-400">{aside}</p>
          </div>
        </div>

        <div className="mb-8 grid md:grid-cols-3">
          {tiers.map((tier) => {
            const period = tier.period !== undefined ? tier.period : tier.price !== "Contact us" ? "/month" : null;
            return (
              <div className="relative flex h-full flex-col transition-transform duration-300 ease-out md:hover:z-20 md:hover:-translate-y-1.5" key={tier.name}>
                <div
                  className={`relative flex h-full flex-col ${
                    tier.featured
                      ? "border-2 border-red-500 bg-neutral-900"
                      : "border border-neutral-700 bg-black md:border-x-0 md:border-y"
                  }`}
                >
                  <div className="relative mb-6 border-neutral-700 border-b p-6">
                    <h3
                      className={`mb-2 font-medium text-xl ${
                        tier.featured ? "text-red-500" : "text-white"
                      }`}
                    >
                      {tier.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{tier.description}</p>
                    {!tier.featured && (
                      <div aria-hidden="true" className="absolute inset-0 z-10 flex flex-col justify-between">
                        <div className="absolute -top-0.5 -left-0.5">
                          <div className="size-1.5 border-neutral-400 border-t-2 border-l-2" />
                        </div>
                        <div className="absolute -top-0.5 -right-0.5">
                          <div className="size-1.5 border-neutral-400 border-t-2 border-r-2" />
                        </div>
                        <div className="absolute -right-0.5 -bottom-0.5">
                          <div className="size-1.5 border-neutral-400 border-r-2 border-b-2" />
                        </div>
                        <div className="absolute -bottom-0.5 -left-0.5">
                          <div className="size-1.5 border-neutral-400 border-b-2 border-l-2" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-6 px-6">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-4xl text-white">{tier.price}</span>
                      {period && <span className="text-gray-400">{period}</span>}
                    </div>
                    {tier.note && <p className="mt-2 text-gray-400 text-sm">{tier.note}</p>}
                  </div>

                  <div className="mb-8 flex flex-1 flex-col px-6">
                    <p className="mb-4 font-bold text-gray-300 text-xs tracking-wide">{includedLabel}</p>
                    <ul className="mb-6 flex-1 space-y-3">
                      {tier.features.map((feature, idx) => (
                        <li className="flex items-start gap-3" key={idx}>
                          {tier.featured ? (
                            <FeaturedIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                          ) : (
                            <Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
                          )}
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {tier.href ? (
                      <Button
                        asChild
                        className={`relative z-20 w-full gap-2 rounded-sm py-2 ${
                          tier.featured
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-white text-black hover:bg-gray-100"
                        }`}
                      >
                        <a href={tier.href} target="_blank" rel="noopener noreferrer">
                          {tier.cta}
                          <ArrowRight aria-hidden="true" className="h-4 w-4" />
                        </a>
                      </Button>
                    ) : (
                      <Button
                        className={`w-full gap-2 rounded-sm py-2 ${
                          tier.featured
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-white text-black hover:bg-gray-100"
                        }`}
                      >
                        {tier.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {!tier.featured && (
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between">
                      <div className="absolute -right-0.5 -bottom-0.5">
                        <div className="size-1.5 border-neutral-400 border-r-2 border-b-2" />
                      </div>
                      <div className="absolute -bottom-0.5 -left-0.5">
                        <div className="size-1.5 border-neutral-400 border-b-2 border-l-2" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
