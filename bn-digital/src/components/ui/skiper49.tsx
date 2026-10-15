"use client";

import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React from "react";
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css";
import "swiper/css/effect-cards";

import { cn } from "@/lib/utils";

/** Imagem do carrossel. `title` e `subtitle` (opcionais) aparecem como legenda no slide. */
export type CarouselImage = {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  /** Conteúdo próprio (ex.: slide animado) no lugar da imagem. */
  content?: React.ReactNode;
};

const Skiper49 = () => {
  const images = [
    {
      src: "https://cdn.21st.dev/assets/localized/4a5d625e1432b674a463e803e9fe672f362ad7b1b267b16c8bb0793a5c81747d.jpg",
      alt: "Illustrations by my fav AarzooAly",
    },
    {
      src: "https://cdn.21st.dev/assets/localized/75561b1340c3d6965831289a69c3b61286af703f407eda10f5c21201f54586a7.jpg",
      alt: "Illustrations by my fav AarzooAly",
    },
    {
      src: "https://cdn.21st.dev/assets/localized/89112484e2896a033a8e70574c9187cd06bb596347e408d57f7a6f7cbf8513f7.jpg",
      alt: "Illustrations by my fav AarzooAly",
    },
    {
      src: "https://cdn.21st.dev/assets/localized/0a5524b3d86b18bb2252a030e513f1836e329cd1ea2af1cdeebc4c4ceee25776.jpg",
      alt: "Illustrations by my fav AarzooAly",
    },
    {
      src: "https://cdn.21st.dev/assets/localized/609299a751113424116d1812f636c090f49259456793d3947c96955f6bd8b152.jpg",
      alt: "Illustrations by my fav AarzooAly",
    },
    {
      src: "https://cdn.21st.dev/assets/localized/cc419b75c885493bf18607f38d1d704171fe78924a4eb535703cf70c038f3ef8.jpg",
      alt: "Illustrations by my fav AarzooAly",
    },
    {
      src: "https://cdn.21st.dev/assets/localized/a12bfa21097bab0e1c2498a16749eec73b490305c50cfe2b438512db3cac3176.jpg",
      alt: "Illustrations by my fav AarzooAly",
    },
    {
      src: "https://cdn.21st.dev/assets/localized/d65364ceb9e4fbec5c7d5c39ff4db4d8c6391e552826259b2516d940dbc35abe.jpg",
      alt: "Illustrations by my fav AarzooAly",
    },
    {
      src: "https://cdn.21st.dev/assets/localized/5f1cbd88e71e52a781ca8fbcc5202f7f01789e178ff21ed297542969f3db46c5.jpg",
      alt: "Illustrations by my fav AarzooAly",
    },
    {
      src: "https://cdn.21st.dev/assets/localized/281e6f2f9ccac0cbea9b7e88ed643681bbbc80b377f56b561f2641e48063b4ab.jpg",
      alt: "Illustrations by my fav AarzooAly",
    },
    {
      src: "https://cdn.21st.dev/assets/localized/10d12a79d39f872640b5a0409b6a334f1a85720cce83d7c25d18808db608e189.jpg",
      alt: "Illustrations by my fav AarzooAly",
    },
  ];

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#f5f4f3]">
      <Carousel_003 className="" images={images} showPagination loop />
    </div>
  );
};

export { Skiper49 };

const Carousel_003 = ({
  images,
  className,
  showPagination = false,
  showNavigation = false,
  loop = true,
  autoplay = false,
  spaceBetween = 0,
}: {
  images: CarouselImage[];
  className?: string;
  showPagination?: boolean;
  showNavigation?: boolean;
  loop?: boolean;
  /** true = troca a cada 1,5 s; um número define o intervalo em ms. */
  autoplay?: boolean | number;
  spaceBetween?: number;
}) => {
  const css = `
  .Carousal_003 {
    width: 100%;
    height: 350px;
    padding-bottom: 50px !important;
  }

  .Carousal_003 .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 300px;
  }

  .swiper-pagination-bullet {
    background-color: #000 !important;
  }

`;
  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        duration: 0.3,
        delay: 0.5,
      }}
      className={cn("relative w-full max-w-4xl px-5", className)}
    >
      <style>{css}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Swiper
          spaceBetween={spaceBetween}
          autoplay={
            autoplay
              ? {
                  delay: typeof autoplay === "number" ? autoplay : 1500,
                  disableOnInteraction: typeof autoplay !== "number",
                  pauseOnMouseEnter: true,
                }
              : false
          }
          effect="coverflow"
          grabCursor={true}
          slidesPerView="auto"
          centeredSlides={true}
          loop={loop}
          coverflowEffect={{
            rotate: 40,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={
            showPagination
              ? {
                  clickable: true,
                }
              : false
          }
          navigation={
            showNavigation
              ? {
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                }
              : false
          }
          className="Carousal_003"
          modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index} className="">
              {image.content ?? (
                <img
                  className="h-full w-full object-cover"
                  src={image.src}
                  alt={image.alt}
                />
              )}
              {image.title && (
                <div className="carousel-caption pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-12 text-left">
                  <p className="text-[15px] font-semibold text-white">
                    {image.title}
                  </p>
                  {image.subtitle && (
                    <p className="text-[13px] text-white/75">
                      {image.subtitle}
                    </p>
                  )}
                </div>
              )}
            </SwiperSlide>
          ))}
          {showNavigation && (
            <div>
              <div className="swiper-button-next after:hidden">
                <ChevronRightIcon className="h-6 w-6 text-white" />
              </div>
              <div className="swiper-button-prev after:hidden">
                <ChevronLeftIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
        </Swiper>
      </motion.div>
    </motion.div>
  );
};

export { Carousel_003 };
export default Skiper49;

/**
 * Skiper 49 Carousel_003 — React + Swiper
 * Built with Swiper.js - Read docs to learn more https://swiperjs.com/
 * Illustrations by AarzooAly - https://x.com/AarzooAly
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Feedback and contributions are welcome.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.me
 * Twitter: https://x.com/Gur__vi
 */
