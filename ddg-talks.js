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

	function pixelEdgeEffect() {
		// Pixelated metaball edge effect
		// by Adam Kuhn - adamkuhn.net
		// MIT License
		const wrap = document.querySelector(".pixel-edge");
		const canvas = document.querySelector(".pixel-edge_canvas");
		if (!wrap || !canvas) return;

		const ctx = canvas.getContext("2d");

		// ====== TWEAKS ======
		const settings = {
			pixelSize: 24, // bigger = chunkier pixels (try 10–18)
			blobCount: 6, // number of drifting blobs
			blobRadius: 250, // influence radius-ish (bigger = more merging)
			threshold: 1.5, // lower = more filled, higher = more gaps
			speed: 1.5, // drift speed
			color: "#2c2c2c",
			mouseStrength: 0.2, // 0 = off; higher = more interaction
			mouseRadius: 500,
		};

		// ====== INTERNALS ======
		let w = 0,
			h = 0,
			dpr = 1;
		let cols = 0,
			rows = 0;
		const blobs = [];
		const mouse = {
			x: -9999,
			y: -9999, // current
			tx: -9999,
			ty: -9999, // target
			alpha: 0, // 0..1 (influence on/off)
			targetAlpha: 0,
		};

		function rand(min, max) {
			return min + Math.random() * (max - min);
		}

		function resize() {
			const rect = wrap.getBoundingClientRect();
			dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
			w = Math.floor(rect.width);
			h = Math.floor(rect.height);

			canvas.width = Math.floor(w * dpr);
			canvas.height = Math.floor(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			cols = Math.ceil(w / settings.pixelSize);
			rows = Math.ceil(h / settings.pixelSize);

			// init blobs once
			if (!blobs.length) {
				for (let i = 0; i < settings.blobCount; i++) {
					blobs.push({
						x: rand(0, w),
						y: rand(h * 0.7, h), // spawn closer to bottom
						vx: rand(-1, 1),
						vy: rand(-0.6, 0.6),
						phase: rand(0, Math.PI * 2),
					});
				}
			}
		}

		function update(dt) {
			const s = settings.speed;
			for (const b of blobs) {
				b.phase += dt * 0.8;

				// gentle noisy drift (no library)
				b.vx += Math.sin(b.phase) * 0.02;
				b.vy += Math.cos(b.phase * 0.9) * 0.02;

				b.x += b.vx * s * 60 * dt;
				b.y += b.vy * s * 60 * dt;

				// keep in bounds with soft bounce
				if (b.x < -w * 0.1) {
					b.x = -w * 0.1;
					b.vx *= -0.9;
				}
				if (b.x > w * 1.1) {
					b.x = w * 1.1;
					b.vx *= -0.9;
				}
				if (b.y < -h * 0.2) {
					b.y = -h * 0.2;
					b.vy *= -0.9;
				}
				if (b.y > h * 1.2) {
					b.y = h * 1.2;
					b.vy *= -0.9;
				}

				// mouse interaction: repel a bit
				if (mouse.active && settings.mouseStrength > 0) {
					const dx = b.x - mouse.x;
					const dy = b.y - mouse.y;
					const dist = Math.hypot(dx, dy);
					const r = settings.mouseRadius;
					if (dist < r && dist > 0.001) {
						const force = (1 - dist / r) * 0.08 * settings.mouseStrength;
						b.vx += (dx / dist) * force;
						b.vy += (dy / dist) * force;
					}
				}

				// damp velocity so it doesn't explode
				b.vx *= 0.985;
				b.vy *= 0.985;
			}
			// smooth follow + smooth fade
			const follow = 1 - Math.pow(0.001, dt); // framerate-independent
			mouse.x += (mouse.tx - mouse.x) * follow;
			mouse.y += (mouse.ty - mouse.y) * follow;

			const fade = 1 - Math.pow(0.01, dt); // slower
			mouse.alpha += (mouse.targetAlpha - mouse.alpha) * fade;
		}

		function fieldValue(x, y) {
			// sum r^2 / d^2 style metaball field
			let v = 0;
			const r2 = settings.blobRadius * settings.blobRadius;

			for (const b of blobs) {
				const dx = x - b.x;
				const dy = y - b.y;
				const d2 = dx * dx + dy * dy + 0.0001;
				v += r2 / d2;
			}

			// add a "mouse blob" to pull the surface toward cursor
			if (mouse.alpha > 0.001 && settings.mouseStrength > 0) {
				const dx = x - mouse.x;
				const dy = y - mouse.y;
				const d2 = dx * dx + dy * dy + 0.0001;
				const mr2 =
					settings.mouseRadius * settings.mouseRadius * settings.mouseStrength * mouse.alpha;
				v += mr2 / d2;
			}

			return v;
		}

		function render() {
			ctx.clearRect(0, 0, w, h);
			ctx.fillStyle = settings.color;

			const p = settings.pixelSize;

			for (let gy = 0; gy < rows; gy++) {
				const y = gy * p + p * 0.5;
				for (let gx = 0; gx < cols; gx++) {
					const x = gx * p + p * 0.5;

					if (fieldValue(x, y) > settings.threshold) {
						ctx.fillRect(gx * p, gy * p, p, p);
					}
				}
			}
		}

		// ====== LOOP ======
		let last = performance.now();
		function tick(now) {
			const dt = Math.min(0.033, (now - last) / 1000);
			last = now;

			update(dt);
			render();
			requestAnimationFrame(tick);
		}

		// ====== EVENTS ======
		wrap.addEventListener("mousemove", (e) => {
			const r = wrap.getBoundingClientRect();
			mouse.tx = e.clientX - r.left;
			mouse.ty = e.clientY - r.top;
			mouse.targetAlpha = 1;
		});

		wrap.addEventListener("mouseleave", () => {
			mouse.targetAlpha = 0;
		});

		window.addEventListener("resize", resize);

		resize();
		requestAnimationFrame(tick);
	}

	// call functions

	buttonHover();
	navOpen();
	pixelEdgeEffect();
}
