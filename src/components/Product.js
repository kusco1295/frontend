import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { ROUTES } from "../constants/endpoints";

const products = [
  {
    title: "Type 28AT",
    subtitle: "Non-contacting Gas Seal for Turbo Compressors",
    copy:
      "Type 28AT is an original gas seal design with a long pedigree and proven performance in demanding compressor service.",
    image: "/images/ProductImage/1.webp",
  },
  {
    title: "Aura 120NS",
    subtitle: "Narrow section dry gas seal",
    copy:
      "Aura 120NS eliminates oil lubrication and helps address methane leakage with a compact, modern sealing layout.",
    image: "/images/ProductImage/2.webp",
  },
  {
    title: "Type 28XP",
    subtitle: "Non-contacting Gas Seal for Turbo Compressors",
    copy:
      "Type 28XP builds on the 28AT design and brings robust, proven performance for compressor applications.",
    image: "/images/ProductImage/3.webp",
  },
  {
    title: "Aura 220",
    subtitle: "Dry gas seal",
    copy:
      "Aura 220 reduces operational and transactional costs using a patented polymeric sealing device.",
    image: "/images/ProductImage/4.webp",
  },
  {
    title: "Type 28EXP",
    subtitle: "Non-contacting Gas Seal for Turbo Compressors",
    copy:
      "Type 28EXP is designed for challenging and hostile environments with proven performance for high-pressure duty.",
    image: "/images/ProductImage/5.webp",
  },
  {
    title: "Type 28ST",
    subtitle: "Non-contacting Gas Seal for Steam Turbines",
    copy:
      "Type 28ST combines rotating groove technology and high-temperature secondary seals to reduce steam leakage.",
    image: "/images/ProductImage/6.webp",
  },
  {
    title: "Type 28VL",
    subtitle: "Non-contacting Gas Seal for Vaporizing Liquids",
    copy:
      "Type 28VL uses spiral groove technology to harness shaft energy and vaporize process fluid at a controlled rate.",
    image: "/images/ProductImage/7.webp",
  },
  {
    title: "Type 93AX Coaxial Separation Seal",
    subtitle: "Coaxial Separation Seal",
    copy:
      "Type 93AX is a next-generation coaxial separation seal engineered for exceptional reliability and efficiency.",
    image: "/images/ProductImage/8.webp",
  },
  {
    title: "Type 83",
    subtitle: "Separation Seal (Contacting Technology)",
    copy:
      "Type 83 is a dual-segmented carbon bushing assembly designed to prevent oil migration to the dry gas seal.",
    image: "/images/ProductImage/9.webp",
  },
  {
    title: "Type 93FR",
    subtitle: "Separation Seal (Non-contacting Technology)",
    copy:
      "Type 93FR is a non-contacting carbon bushing designed to protect dry gas seals from bearing oil ingress.",
    image: "/images/ProductImage/10.webp",
  },
  {
    title: "Type 93LR",
    subtitle: "Segmented Lift-off Carbon Bushing",
    copy:
      "Type 93LR is a non-contacting segmented bushing seal with a balanced lift-off carbon design for low gas consumption.",
    image: "/images/ProductImage/11.webp",
  },
  {
    title: "Type 1/1A",
    subtitle: "Full Convolution Industrial-duty Elastomer Bellows Shaft Seal",
    copy:
      "Type 1/1A is a proven industrial seal with exceptional performance for a broad range of general service applications.",
    image: "/images/ProductImage/12.webp",
  },
  {
    title: "Type 2",
    subtitle: "Multi-purpose Non-pusher Elastomer Bellows Seal",
    copy:
      "Type 2 is available in single, double, and balanced arrangements and provides a compact working height.",
    image: "/images/ProductImage/13.webp",
  },
  {
    title: "Type 21",
    subtitle: "General-duty Elastomer Bellows Shaft Seal",
    copy:
      "Type 21 is a general-purpose mechanical seal with automatic adjustment for shaft-end play and runout.",
    image: "/images/ProductImage/14.webp",
  },
  {
    title: "Type 2100 Elastomer Bellow Shaft Seal",
    subtitle: "Fully Unitized, Heavy-duty Elastomer Bellows Shaft Seal",
    copy:
      "Type 2100 is a compact, unitized, single-spring elastomer bellows seal built for demanding applications.",
    image: "/images/ProductImage/15.webp",
  },
  {
    title: "Type 2106",
    subtitle: "Fully Unitized Elastomer Bellows Shaft Seal",
    copy:
      "Type 2106 is a compact, unitized seal that offers durability and performance for general service conditions.",
    image: "/images/ProductImage/16.webp",
  },
  {
    title: "Type 4111",
    subtitle: "Single-use Elastomer Bellows Cartridge Seal",
    copy:
      "Type 4111 is suited for DIN and ANSI pumps using aqueous solutions and is engineered to simplify installation.",
    image: "/images/ProductImage/17.webp",
  },
  {
    title: "Type 502",
    subtitle: "Unitized Elastomer Bellows Seal",
    copy:
      "Type 502 is a strong general-service seal option with reliable performance for everyday industrial use.",
    image: "/images/ProductImage/18.webp",
  },
];

const Product = ({
  maxItems = products.length,
  showSectionHeader = true,
  showViewAllButton = true,
  containerClassName = "bg-[#f4f4f1] px-4 py-20 sm:px-6 lg:px-8",
  titleClassName = "text-3xl font-light tracking-tight text-slate-700 sm:text-4xl",
  gridClassName = "grid gap-6 md:grid-cols-2 xl:grid-cols-3",
}) => {
  const visibleProducts = products.slice(0, maxItems);

  return (
    <section id="products" className={containerClassName}>
      <div className="mx-auto max-w-7xl">
        {showSectionHeader && (
          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className={`max-w-3xl ${titleClassName}`}>
                Products built for reliability and performance.
              </h2>
            </div>

            {showViewAllButton && (
              <Link
                to={ROUTES.PRODUCTS}
                className="inline-flex items-center gap-2 self-start pt-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950"
              >
                View all products
                <FiArrowRight className="text-blue-600" />
              </Link>
            )}
          </div>
        )}

        <div className={gridClassName}>
          {visibleProducts.map((product, index) => (
            <article
              key={`${product.title}-${index}`}
              className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="flex min-h-[260px] items-center justify-center border-b border-slate-100 bg-white p-8">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-48 w-full rounded-[1.5rem] object-contain"
                  />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white text-center">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                        Image placeholder
                      </p>
                      <p className="mt-3 max-w-[14rem] text-sm leading-6 text-slate-500">
                        Add the product image here later.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-8">
                <h3 className="text-3xl font-light tracking-tight text-blue-700 transition-colors group-hover:text-blue-800">
                  {product.title}
                </h3>
                <p className="mt-5 text-[15px] italic leading-7 text-slate-500">
                  {product.subtitle}
                </p>
                <p className="mt-4 text-[15px] leading-8 text-slate-600">
                  {product.copy}
                </p>

                <div className="mt-10 inline-flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <span>Learn more</span>
                  <FiArrowRight className="text-blue-600" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Product;
