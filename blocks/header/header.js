import React, { useEffect, useState, useRef } from "react";
import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";

const isDesktop = window.matchMedia("(min-width: 900px)");

const Header = () => {
  const [navExpanded, setNavExpanded] = useState(false);
  const navRef = useRef(null);
  const navSectionsRef = useRef(null);

  const closeOnEscape = (e) => {
    if (e.code === "Escape") {
      const nav = navRef.current;
      const navSections = navSectionsRef.current;
      const navSectionExpanded = navSections.querySelector(
        '[aria-expanded="true"]'
      );
      if (navSectionExpanded && isDesktop.matches) {
        toggleAllNavSections(navSections);
        navSectionExpanded.focus();
      } else if (!isDesktop.matches) {
        toggleMenu(nav, navSections);
        nav.querySelector("button").focus();
      }
    }
  };

  const closeOnFocusLost = (e) => {
    const nav = navRef.current;
    if (!nav.contains(e.relatedTarget)) {
      const navSections = navSectionsRef.current;
      const navSectionExpanded = navSections.querySelector(
        '[aria-expanded="true"]'
      );
      if (navSectionExpanded && isDesktop.matches) {
        toggleAllNavSections(navSections, false);
      } else if (!isDesktop.matches) {
        toggleMenu(nav, navSections, false);
      }
    }
  };

  const openOnKeydown = (e) => {
    const focused = document.activeElement;
    const isNavDrop = focused.className === "nav-drop";
    if (isNavDrop && (e.code === "Enter" || e.code === "Space")) {
      const dropExpanded = focused.getAttribute("aria-expanded") === "true";
      toggleAllNavSections(focused.closest(".nav-sections"));
      focused.setAttribute("aria-expanded", dropExpanded ? "false" : "true");
    }
  };

  const focusNavSection = () => {
    document.activeElement.addEventListener("keydown", openOnKeydown);
  };

  const toggleAllNavSections = (sections, expanded = false) => {
    sections
      .querySelectorAll(".nav-sections .default-content-wrapper > ul > li")
      .forEach((section) => {
        section.setAttribute("aria-expanded", expanded);
      });
  };

  const toggleMenu = (nav, navSections, forceExpanded = null) => {
    const expanded =
      forceExpanded !== null
        ? !forceExpanded
        : nav.getAttribute("aria-expanded") === "true";
    const button = nav.querySelector(".nav-hamburger button");
    document.body.style.overflowY =
      expanded || isDesktop.matches ? "" : "hidden";
    nav.setAttribute("aria-expanded", expanded ? "false" : "true");
    toggleAllNavSections(
      navSections,
      expanded || isDesktop.matches ? "false" : "true"
    );
    button.setAttribute(
      "aria-label",
      expanded ? "Open navigation" : "Close navigation"
    );

    const navDrops = navSections.querySelectorAll(".nav-drop");
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute("tabindex")) {
          drop.setAttribute("tabindex", 0);
          drop.addEventListener("focus", focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute("tabindex");
        drop.removeEventListener("focus", focusNavSection);
      });
    }

    if (!expanded || isDesktop.matches) {
      window.addEventListener("keydown", closeOnEscape);
      nav.addEventListener("focusout", closeOnFocusLost);
    } else {
      window.removeEventListener("keydown", closeOnEscape);
      nav.removeEventListener("focusout", closeOnFocusLost);
    }
  };

  useEffect(() => {
    const loadNav = async () => {
      const navMeta = getMetadata("nav");
      const navPath = navMeta
        ? new URL(navMeta, window.location).pathname
        : "/nav";
      const fragment = await loadFragment(navPath);

      const nav = navRef.current;
      nav.textContent = "";
      while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

      const classes = ["brand", "sections", "tools"];
      classes.forEach((c, i) => {
        const section = nav.children[i];
        if (section) section.classList.add(`nav-${c}`);
      });

      const navBrand = nav.querySelector(".nav-brand");
      const brandLink = navBrand.querySelector(".button");
      if (brandLink) {
        brandLink.className = "";
        brandLink.closest(".button-container").className = "";
      }

      const navSections = nav.querySelector(".nav-sections");
      navSectionsRef.current = navSections;
      if (navSections) {
        navSections
          .querySelectorAll(":scope .default-content-wrapper > ul > li")
          .forEach((navSection) => {
            if (navSection.querySelector("ul"))
              navSection.classList.add("nav-drop");
            navSection.addEventListener("click", () => {
              if (isDesktop.matches) {
                const expanded =
                  navSection.getAttribute("aria-expanded") === "true";
                toggleAllNavSections(navSections);
                navSection.setAttribute(
                  "aria-expanded",
                  expanded ? "false" : "true"
                );
              }
            });
          });
      }

      const hamburger = document.createElement("div");
      hamburger.classList.add("nav-hamburger");
      hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
      hamburger.addEventListener("click", () => toggleMenu(nav, navSections));
      nav.prepend(hamburger);
      nav.setAttribute("aria-expanded", "false");

      toggleMenu(nav, navSections, isDesktop.matches);
      isDesktop.addEventListener("change", () =>
        toggleMenu(nav, navSections, isDesktop.matches)
      );
    };

    loadNav();
  }, []);

  return (
    <div className="nav-wrapper">
      <nav id="nav" ref={navRef} aria-expanded="false"></nav>
    </div>
  );
};

export default Header;
