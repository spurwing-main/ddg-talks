function main() {
	function buttonHover() {
		if (typeof gsap === "undefined") return;

		// expects GSAP loaded
		// Apply to multiple buttons
		document.querySelectorAll(".button").forEach((btn) => {
			const ripple = btn.querySelector(".button_ripple");
			if (!ripple) return;
			const rippleColor = getComputedStyle(btn).getPropertyValue("--ripple-color").trim();
			ripple.style.backgroundColor = rippleColor || "rgba(255, 255, 255, 0.18)";
			gsap.set(ripple, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });

			// helper: set ripple position in button coords
			const setPos = (e) => {
				const r = btn.getBoundingClientRect();
				// Clamp to the button bounds so the ripple always starts visible (not fully clipped)
				const x = Math.min(Math.max(e.clientX - r.left, 0), r.width);
				const y = Math.min(Math.max(e.clientY - r.top, 0), r.height);
				gsap.set(ripple, { x, y });
				return { x, y, w: r.width, h: r.height };
			};

			// we scale a circle that is big enough to cover the farthest corner
			const setSizeForCover = (x, y, w, h) => {
				const dx = Math.max(x, w - x);
				const dy = Math.max(y, h - y);
				const radius = Math.sqrt(dx * dx + dy * dy);
				const diameter = radius * 2;

				gsap.set(ripple, { width: diameter, height: diameter });
			};

			// nicer cursor tracking during hover (optional)
			const xTo = gsap.quickTo(ripple, "x", { duration: 0.2, ease: "power3.out" });
			const yTo = gsap.quickTo(ripple, "y", { duration: 0.2, ease: "power3.out" });

			btn.addEventListener("pointerenter", (e) => {
				const { x, y, w, h } = setPos(e);
				setSizeForCover(x, y, w, h);

				gsap.killTweensOf(ripple);
				gsap.set(ripple, { scale: 0, opacity: 1 });

				gsap.to(ripple, {
					scale: 1,
					duration: 1,
					ease: "power3.out",
				});
			});

			// btn.addEventListener("pointermove", (e) => {
			// 	const r = btn.getBoundingClientRect();
			// 	xTo(e.clientX - r.left);
			// 	yTo(e.clientY - r.top);
			// });

			btn.addEventListener("pointerleave", () => {
				gsap.to(ripple, {
					scale: 0,
					duration: 0.75,
					ease: "power3.out",
					onComplete: () => gsap.set(ripple, { opacity: 0 }),
				});
			});
		});
	}

	function navOpen() {
		const navButton = document.querySelector(".nav_outer.is-right .button"); // on desktop this acts as a CTA link, on mobile we use it to open the nav
		const navMenu = document.querySelector(".nav_menu");
		const navMenuWrap = document.querySelector(".nav_menu-wrap");
		const navIcon = navButton ? navButton.querySelector(".button_icon") : null;
		const nav = document.querySelector(".nav");

		const navLinks = navMenu ? navMenu.querySelectorAll(".nav_menu-link") : null;
		if (!navButton || !navMenuWrap || !navMenu || !navLinks) return;

		let isOpen = false;
		const htmlEl = document.documentElement;

		const navTl = gsap.timeline({
			paused: true,
			onReverseComplete: () => {
				gsap.set(navMenuWrap, { display: "none" });
			},
		});
		navTl.set(navMenuWrap, { display: "block" }, 0);
		navTl.fromTo(
			navLinks,
			{ autoAlpha: 0 },
			{
				autoAlpha: 1,
				duration: 0.25,
				ease: "power3.out",
				stagger: 0.05,
			},
			0,
		);
		if (navIcon) {
			navTl.fromTo(
				navIcon,
				{ rotate: 0 },
				{
					rotate: 180,
					duration: 0.25,
					ease: "power3.out",
				},
				0,
			);
		}

		function clickHandler(event) {
			console.log("nav button clicked");
			event.preventDefault();
			if (isOpen) close();
			else open();
		}

		const initMobile = () => {
			htmlEl.classList.remove("nav-open");
			isOpen = false;
			if (navIcon) gsap.set(navIcon, { display: "block" });
		};

		const open = () => {
			console.log("nav open");
			htmlEl.classList.add("nav-open");
			navTl.play();
			isOpen = true;
		};

		const close = () => {
			console.log("nav close");
			htmlEl.classList.remove("nav-open");
			navTl.reverse();
			isOpen = false;
		};

		const initDesktop = () => {
			htmlEl.classList.remove("nav-open");
			gsap.set(navMenuWrap, { clearProps: "display" });
			gsap.set(navLinks, { clearProps: "opacity,visibility" });
			if (navIcon) gsap.set(navIcon, { clearProps: "transform", display: "none" });
			isOpen = false;
			navTl.pause(0);
		};

		let mm = gsap.matchMedia();
		mm.add(
			// Mobile
			"(max-width: 767px)",
			() => {
				console.log("mobile active");
				initMobile();
				navButton.addEventListener("click", clickHandler);
				return () => {
					console.log("desktop active");
					initDesktop();
					navButton.removeEventListener("click", clickHandler);
				};
			},
		);
		mm.add(
			// Desktop
			"(min-width: 768px)",
			() => {
				console.log("desktop active");
				initDesktop();
			},
		);
	}

	// call functions

	buttonHover();
	navOpen();
}
