import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { ROUTES } from "../constants/endpoints";

const Header = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const navItems = [
    {
      name: "Products",
      dropdown: [
        { name: "Mechanical Seals", id: "mechanical-seals" },
        { name: "Seal Support Systems", id: "seal-support" },
        { name: "Expansion Joints", id: "expansion-joints" },
      ],
    },
    {
      name: "Services",
      dropdown: [
        { name: "Maintenance", id: "maintenance" },
        { name: "Installation", id: "installation" },
        { name: "Training", id: "training" },
      ],
    },
    {
      name: "Industries",
      dropdown: [
        { name: "Oil & Gas", id: "oil-gas" },
        { name: "Chemical", id: "chemical" },
        { name: "Power Generation", id: "power" },
      ],
    },
    { name: "About Us", id: "about-us" },
    { name: "Solutions", id: "solutions" },
  ];

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [sidebarOpen]);

  // Close sidebar on screen resize >= md
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 py-4 relative z-50 w-full">
      <div className="w-full max-w-[1500px] px-4 mx-auto flex items-center justify-between">
        {/* Logo and Tagline */}
        <div className="flex flex-col">
          <a href="/" className="text-2xl font-bold text-gray-900">
            Masinco Pvt. LTD
          </a>
          <span className="text-xs text-gray-500">
            a member of <span className="font-medium">EKK</span> and{" "}
            <span className="font-medium">FREUDENBERG</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <div key={item.name} className="relative group">
              {item.dropdown ? (
                <>
                  <button className="flex items-center text-gray-700 hover:text-blue-700 transition-colors">
                    {item.name}
                    <FiChevronDown size={16} className="ml-1" />
                  </button>
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 opacity-0 group-hover:opacity-100 group-hover:translate-y-1 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                    {item.dropdown.map((subItem) => (
                      <a
                        key={subItem.id}
                        href={`#${subItem.id}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                      >
                        {subItem.name}
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <a
                  href={`#${item.id}`}
                  className="text-gray-700 hover:text-blue-700 transition-colors"
                >
                  {item.name}
                </a>
              )}
            </div>
          ))}

          {/* Inquiry Button */}
          <button
            onClick={() => navigate(ROUTES.INQUIRY)}
            className="ml-2 inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-full shadow hover:from-purple-600 hover:to-indigo-700 transition"
          >
            Inquiry
          </button>

          {/* Contact Us Button */}
          <a
            href="#contact"
            className="ml-2 inline-block px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-full shadow hover:from-yellow-500 hover:to-orange-600 transition"
          >
            Contact Us
          </a>
        </nav>

        {/* Mobile Menu Icon */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setSidebarOpen(true)}
        >
          <FiMenu size={28} />
        </button>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40">
          <div
            ref={sidebarRef}
            className="fixed top-0 right-0 h-full w-72 bg-white shadow-lg z-50 p-6 overflow-y-auto transition-transform"
          >
            {/* Close button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Menu</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <FiX size={24} />
              </button>
            </div>

            {navItems.map((item) => (
              <div key={item.name} className="mb-2">
                {item.dropdown ? (
                  <details className="group">
                    <summary className="cursor-pointer flex items-center justify-between text-gray-800 py-2 px-2 hover:bg-gray-100 rounded">
                      <span>{item.name}</span>
                      <FiChevronDown className="ml-1 group-open:rotate-180 transition" />
                    </summary>
                    <div className="pl-4">
                      {item.dropdown.map((subItem) => (
                        <a
                          key={subItem.id}
                          href={`#${subItem.id}`}
                          className="block py-2 text-sm text-gray-700 hover:text-blue-600"
                          onClick={() => setSidebarOpen(false)}
                        >
                          {subItem.name}
                        </a>
                      ))}
                    </div>
                  </details>
                ) : (
                  <a
                    href={`#${item.id}`}
                    className="block py-2 px-2 text-gray-800 hover:bg-gray-100 rounded"
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}

            <button
              onClick={() => { navigate(ROUTES.INQUIRY); setSidebarOpen(false); }}
              className="mt-4 w-full text-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-full shadow hover:from-purple-600 hover:to-indigo-700 transition"
            >
              Inquiry
            </button>

            <a
              href="#contact"
              className="mt-2 inline-block w-full text-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-full shadow hover:from-yellow-500 hover:to-orange-600 transition"
              onClick={() => setSidebarOpen(false)}
            >
              Contact Us
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
