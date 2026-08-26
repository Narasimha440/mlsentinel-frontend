"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu when pressing Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Prevent background page scrolling while mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* =========================================================
          NAVBAR
      ========================================================== */}

      <header
        className="
          fixed
          left-0
          top-0
          z-[100]
          w-full
          bg-transparent
          px-4
          pt-4
          sm:px-6
          sm:pt-5
        "
      >
        <nav
          className="
            mx-auto
            flex
            h-[68px]
            w-full
            max-w-[1240px]
            items-center
            rounded-[14px]
            border
            border-[#DCE3EC]
            bg-white
            px-5
            shadow-[0_4px_18px_rgba(15,23,42,0.06)]
            sm:h-[72px]
            sm:px-6
            lg:px-8
          "
        >
          {/* =====================================================
              LOGO
          ====================================================== */}

          <a
            href="/"
            aria-label="MLSentinel home"
            className="
              flex
              shrink-0
              items-center
            "
          >
            <img
              src="https://raw.githubusercontent.com/Narasimha440/mlsentinal/main/logo.png"
              alt="MLSentinel"
              draggable={false}
              className="
                h-10
                w-auto
                select-none
                sm:h-11
              "
            />
          </a>

          {/* =====================================================
              DESKTOP NAVIGATION
          ====================================================== */}

          <div
            className="
              ml-auto
              hidden
              items-center
              gap-7
              md:flex
              lg:gap-8
            "
          >
            <NavLink href="/docs">
              Documentation
            </NavLink>

            <NavLink href="/docs#installation">
              SDK
            </NavLink>

            <NavLink href="/docs#dashboard">
              Monitoring
            </NavLink>

            <NavLink href="/docs#data-quality">
              Data Quality
            </NavLink>

            <NavLink href="/docs#reference">
              API Reference
            </NavLink>
          </div>

          {/* =====================================================
              DESKTOP ACTIONS
          ====================================================== */}

          <div
            className="
              ml-6
              hidden
              items-center
              gap-2
              md:flex
              lg:ml-8
            "
          >
            <NavLink
              href="/login"
              className="
                rounded-lg
                px-4
                py-2.5
                text-[#0F172A]
                hover:bg-[#F8FAFC]
              "
            >
              Login
            </NavLink>

            <a
              href="/signup"
              className="
                rounded-lg
                bg-[#0F172A]
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                transition-colors
                duration-200
                hover:bg-[#1E293B]
              "
            >
              Get Started
            </a>
          </div>

          {/* =====================================================
              MOBILE MENU BUTTON
          ====================================================== */}

          <button
            type="button"
            aria-label={
              mobileOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
            onClick={() =>
              setMobileOpen((previous) => !previous)
            }
            className="
              ml-auto
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              text-[#0F172A]
              transition-colors
              duration-200
              hover:bg-[#F8FAFC]
              md:hidden
            "
          >
            {mobileOpen ? (
              <X
                className="h-5 w-5"
                strokeWidth={2}
              />
            ) : (
              <Menu
                className="h-5 w-5"
                strokeWidth={2}
              />
            )}
          </button>
        </nav>

        {/* =======================================================
            MOBILE MENU
        ======================================================== */}

        {mobileOpen && (
          <div
            className="
              mx-auto
              mt-3
              w-full
              max-w-[1240px]
              rounded-[14px]
              border
              border-[#DCE3EC]
              bg-white
              p-3
              shadow-[0_12px_30px_rgba(15,23,42,0.08)]
              md:hidden
            "
          >
            <div className="flex flex-col">
              {/* Documentation */}

              <MobileLink
                href="/docs"
                onClick={closeMobileMenu}
              >
                Documentation
              </MobileLink>

              {/* SDK */}

              <MobileLink
                href="/docs#installation"
                onClick={closeMobileMenu}
              >
                SDK
              </MobileLink>

              {/* Monitoring */}

              <MobileLink
                href="/docs#dashboard"
                onClick={closeMobileMenu}
              >
                Monitoring
              </MobileLink>

              {/* Data Quality */}

              <MobileLink
                href="/docs#data-quality"
                onClick={closeMobileMenu}
              >
                Data Quality
              </MobileLink>

              {/* API Reference */}

              <MobileLink
                href="/docs#reference"
                onClick={closeMobileMenu}
              >
                API Reference
              </MobileLink>

              {/* Divider */}

              <div
                className="
                  my-2
                  h-px
                  bg-[#E2E8F0]
                "
              />

              {/* Login */}

              <MobileLink
                href="/login"
                onClick={closeMobileMenu}
              >
                Login
              </MobileLink>

              {/* Get Started */}

              <a
                href="/signup"
                onClick={closeMobileMenu}
                className="
                  mt-2
                  rounded-lg
                  bg-[#0F172A]
                  px-4
                  py-3
                  text-center
                  text-sm
                  font-semibold
                  text-white
                  transition-colors
                  duration-200
                  hover:bg-[#1E293B]
                "
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

/* ===============================================================
   DESKTOP NAV LINK
================================================================ */

function NavLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`
        whitespace-nowrap
        text-sm
        font-medium
        text-[#334155]
        transition-colors
        duration-200
        hover:text-[#2563EB]
        ${className}
      `}
    >
      {children}
    </a>
  );
}

/* ===============================================================
   MOBILE NAV LINK
================================================================ */

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="
        rounded-lg
        px-3
        py-3
        text-[15px]
        font-medium
        text-[#475569]
        transition-colors
        duration-200
        hover:bg-[#F8FAFC]
        hover:text-[#2563EB]
      "
    >
      {children}
    </a>
  );
}