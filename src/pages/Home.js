import React from 'react';
import { FiMail, FiMapPin, FiPhone, FiGlobe, FiClock } from 'react-icons/fi';
import Header from '../components/Header';
import HeroSlider from '../components/Slider';
import Product from '../components/Product';
import { ROUTES } from '../constants/endpoints';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <HeroSlider />
      <Product maxItems={3} />

      <footer className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <h2 className="text-2xl font-black tracking-[0.18em] uppercase">
              Kusco
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              Mechanical seal manufacturing, maintenance, and services for industrial plants that need reliable sealing performance, faster response, and long-term equipment protection.
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <FiMapPin className="mt-1 shrink-0 text-amber-300" />
                <span>92 Nambardaar state, New Friend's Colony, New Delhi</span>
              </div>
              <div className="flex items-start gap-3">
                <FiPhone className="mt-1 shrink-0 text-amber-300" />
                <span>+91 7827804053</span>
                <span>+91 8252745476</span>
              </div>
              <div className="flex items-start gap-3">
                <FiMail className="mt-1 shrink-0 text-amber-300" />
                <span>info@kusco.com</span>
              </div>
              <div className="flex items-start gap-3">
                <FiClock className="mt-1 shrink-0 text-amber-300" />
                <span>Monday to Friday, 9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li>
                <a href="#home" className="transition-colors hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="#products" className="transition-colors hover:text-white">
                  Products
                </a>
              </li>
              <li>
                <a href="#industries" className="transition-colors hover:text-white">
                  Industries
                </a>
              </li>
              <li>
                <a href="#about-us" className="transition-colors hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href={ROUTES.INQUIRY} className="transition-colors hover:text-white">
                  Inquiry
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">
              What We Do
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li>Mechanical seal supply</li>
              <li>Seal repair and refurbishment</li>
              <li>Field maintenance support</li>
              <li>Seal support systems</li>
              <li>Application troubleshooting</li>
            </ul>

            <a
              href={ROUTES.INQUIRY}
              className="mt-8 inline-flex items-center rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
            >
              Request an Inquiry
            </a>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <FiGlobe className="text-amber-300" />
              <span>Serving industrial clients with sealing solutions and technical support.</span>
            </div>
            <p>Copyright (c) 2026 Kusco. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
