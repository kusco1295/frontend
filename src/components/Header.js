import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { ROUTES } from "../constants/endpoints";

const navItems = [
  { name: "Products", id: "products" },
  { name: "Services", id: "services" },
  { name: "Industries", id: "industries" },
  { name: "About Us", id: "about-us" },
  { name: "Contact", id: "contact" },
];

const Header = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [sidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToSection = (id) => {
    setSidebarOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-[0_6px_30px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => scrollToSection("home")}
          className="text-left"
        >
          <div className="text-xl font-black tracking-[0.18em] text-slate-900 uppercase">
            Kusco
          </div>
          <div className="text-[11px] font-medium uppercase tracking-[0.26em] text-slate-500">
            Mechanical seals and services
          </div>
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
            >
              {item.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigate(ROUTES.INQUIRY)}
            className="inline-flex items-center rounded-full border border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Request Quote
          </button>
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-900 shadow-sm md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <FiMenu size={24} />
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/40 md:hidden">
          <div
            ref={sidebarRef}
            className="ml-auto flex h-full w-[86%] max-w-sm flex-col bg-white px-5 py-6 shadow-2xl"
          >
            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="text-lg font-black uppercase tracking-[0.18em] text-slate-900">
                  Kusco
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                  Industrial sealing solutions
                </p>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setSidebarOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-700"
              >
                <FiX size={22} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="rounded-2xl px-4 py-3 text-left text-base font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="mt-auto space-y-3 pt-8">
              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  navigate(ROUTES.INQUIRY);
                }}
                className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Request Quote
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("contact")}
                className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
