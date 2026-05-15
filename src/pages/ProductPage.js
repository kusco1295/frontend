import React from "react";
import Product from "../components/Product";

const ProductPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main>
        <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">
              Product catalog
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              Explore the full Kusco product range.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              This page shows every product card in the catalog. When you send the final pictures later, each placeholder can be swapped for the real product image without changing the layout.
            </p>
          </div>
        </section>

        <Product
          showSectionHeader={false}
          showViewAllButton={false}
          containerClassName="bg-[#f4f4f1] px-4 py-20 sm:px-6 lg:px-8"
          gridClassName="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        />
      </main>
    </div>
  );
};

export default ProductPage;
