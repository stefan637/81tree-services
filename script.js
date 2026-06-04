(function () {
        const root = document.getElementById("ghl-81tree");
        if (!root) return;

        const header = root.querySelector("[data-header]");
        const menuButton = root.querySelector("[data-menu-button]");
        const mobileNav = root.querySelector("[data-mobile-nav]");
        const mobileGroups = root.querySelectorAll("[data-mobile-group]");
        const mobileGroupTimers = new WeakMap();

        if ("scrollRestoration" in history) {
          history.scrollRestoration = "manual";
        }

        window.addEventListener("load", function () {
          requestAnimationFrame(function () {
            window.scrollTo(0, 0);
          });
        });

        function closeMenu() {
          if (!header) return;
          header.classList.remove("is-open");
          root.classList.remove("menu-open");
          mobileGroups.forEach(closeMobileGroup);
          if (menuButton) menuButton.setAttribute("aria-label", "Open menu");
        }

        function closeMobileGroup(group) {
          const trigger = group.querySelector(".mobile-group-trigger");
          const links = group.querySelector("[data-mobile-sublinks]");
          const existingTimer = mobileGroupTimers.get(group);
          if (existingTimer) window.clearTimeout(existingTimer);

          if (trigger) trigger.setAttribute("aria-expanded", "false");
          if (links) links.setAttribute("aria-hidden", "true");

          if (!links || !group.classList.contains("is-open")) {
            group.classList.remove("is-open", "is-closing");
            if (links) links.style.maxHeight = "0px";
            return;
          }

          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            group.classList.remove("is-open", "is-closing");
            links.style.maxHeight = "0px";
            return;
          }

          const currentHeight = links.scrollHeight;
          group.classList.add("is-closing");
          links.style.maxHeight = currentHeight + "px";
          links.offsetHeight;
          group.classList.remove("is-open");

          requestAnimationFrame(function () {
            links.style.maxHeight = "0px";
          });

          const cleanupTimer = window.setTimeout(function () {
            group.classList.remove("is-closing");
            links.style.maxHeight = "0px";
            mobileGroupTimers.delete(group);
          }, 480);

          mobileGroupTimers.set(group, cleanupTimer);
        }

        function openMobileGroup(group) {
          mobileGroups.forEach(function (otherGroup) {
            if (otherGroup !== group) closeMobileGroup(otherGroup);
          });

          const trigger = group.querySelector(".mobile-group-trigger");
          const links = group.querySelector("[data-mobile-sublinks]");
          const existingTimer = mobileGroupTimers.get(group);
          if (existingTimer) window.clearTimeout(existingTimer);

          group.classList.remove("is-closing");
          if (links) links.style.maxHeight = "0px";
          group.classList.add("is-open");
          if (trigger) trigger.setAttribute("aria-expanded", "true");
          if (links) links.setAttribute("aria-hidden", "false");
          if (links) {
            requestAnimationFrame(function () {
              links.style.maxHeight = links.scrollHeight + "px";
            });
          }
        }

        function updateHeader() {
          if (!header) return;
          header.classList.toggle("is-scrolled", window.scrollY > 20);
        }

        window.addEventListener("scroll", updateHeader);
        updateHeader();

        if (menuButton && header) {
          menuButton.addEventListener("click", function () {
            const isOpen = header.classList.toggle("is-open");
            menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
            root.classList.toggle("menu-open", isOpen);
          });
        }

        if (mobileNav) {
          mobileNav.addEventListener("click", function (event) {
            if (event.target && event.target.matches("a")) closeMenu();
          });
        }

        mobileGroups.forEach(function (group) {
          const trigger = group.querySelector(".mobile-group-trigger");
          if (!trigger) return;

          trigger.addEventListener("click", function () {
            if (group.classList.contains("is-open")) {
              closeMobileGroup(group);
            } else {
              openMobileGroup(group);
            }
          });
        });

        mobileGroups.forEach(function (group) {
          const links = group.querySelector("[data-mobile-sublinks]");
          if (!links) return;

          links.addEventListener("transitionend", function (event) {
            if (event.propertyName !== "max-height" || !group.classList.contains("is-open")) return;
            links.style.maxHeight = links.scrollHeight + "px";
          });
        });

        window.addEventListener("keydown", function (event) {
          if (event.key === "Escape" && header && header.classList.contains("is-open")) closeMenu();
        });

        root.querySelectorAll('a[href^="#"]').forEach(function (link) {
          link.addEventListener("click", function (event) {
            const targetId = link.getAttribute("href");
            if (!targetId || targetId === "#") return;
            const target = root.querySelector(targetId);
            if (!target) return;
            event.preventDefault();
            closeMenu();
            const headerHeight = header ? header.offsetHeight : 0;
            const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 18;
            window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
          });
        });

        function animateCount(element) {
          const target = Number(element.dataset.count || 0);
          const suffix = element.dataset.suffix || "";
          const decimals = Number(element.dataset.decimals || 0);
          const duration = Number(element.dataset.duration || 1700);
          const start = performance.now();

          function frame(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const value = target * eased;
            element.textContent = value.toFixed(decimals) + suffix;
            if (progress < 1) requestAnimationFrame(frame);
          }

          requestAnimationFrame(frame);
        }

        const revealObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
        );

        const revealGroups = new Map();
        root.querySelectorAll(".reveal").forEach(function (element) {
          const group = element.closest("section, footer") || element.parentElement || root;
          if (!revealGroups.has(group)) revealGroups.set(group, []);
          revealGroups.get(group).push(element);
        });

        revealGroups.forEach(function (elements) {
          elements.forEach(function (element, index) {
            element.style.setProperty("--reveal-delay", Math.min(index * 75, 300) + "ms");
            revealObserver.observe(element);
          });
        });

        const countObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              animateCount(entry.target);
              countObserver.unobserve(entry.target);
            });
          },
          { threshold: 0.45, rootMargin: "0px 0px -6% 0px" }
        );

        root.querySelectorAll("[data-count]").forEach(function (element) {
          countObserver.observe(element);
        });

        const year = root.querySelector("[data-year]");
        if (year) year.textContent = new Date().getFullYear();
      })();
