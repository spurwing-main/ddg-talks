function main() {
	function buttonHover() {
		if (typeof gsap === "undefined") return;

		// expects GSAP loaded
		// Apply to multiple buttons
		document.querySelectorAll(".button, .nav-link, .timeline_slider-button").forEach((btn) => {
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
				console.log("button pointerenter");
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
		const navButton = document.querySelector(".nav_btn-wrap.is-mbl .button"); // on desktop this acts as a CTA link, on mobile we use it to open the nav
		const navMenu = document.querySelector(".nav_menu");
		const navMenuWrap = document.querySelector(".nav_menu-wrap");
		const navIcon = navButton ? navButton.querySelector(".button_icon") : null;
		const nav = document.querySelector(".nav");

		const navLinks = navMenu ? navMenu.querySelectorAll(".nav-link ") : null;
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

	// function pixelEdgeEffect() {
	// 	// Pixelated metaball edge effect
	// 	// by Adam Kuhn - adamkuhn.net
	// 	// MIT License
	// 	const wrap = document.querySelector(".pixel-edge");
	// 	const canvas = document.querySelector(".pixel-edge_canvas");
	// 	if (!wrap || !canvas) return;

	// 	const ctx = canvas.getContext("2d");

	// 	// ====== TWEAKS ======
	// 	const baseSettings = {
	// 		pixelSize: 50, // bigger = chunkier pixels (try 10–18)
	// 		blobCount: 6, // number of drifting blobs
	// 		blobRadius: 85, // influence radius-ish (bigger = more merging)
	// 		threshold: 1.5, // lower = more filled, higher = more gaps
	// 		speed: 1.5, // drift speed
	// 		color: "#2c2c2c",
	// 		mouseStrength: 0.2, // 0 = off; higher = more interaction
	// 		mouseRadius: 300,
	// 		bottomBand: 0.35, // only allow blobs in bottom 55% of canvas
	// 	};
	// 	let settings = { ...baseSettings };

	// 	function applyResponsiveSettings() {
	// 		settings = { ...baseSettings };

	// 		// tablet and down
	// 		if (window.matchMedia("(max-width: 991px)").matches) {
	// 			settings.pixelSize = baseSettings.pixelSize * 0.8;
	// 			settings.blobRadius = baseSettings.blobRadius * 0.8;
	// 			settings.mouseRadius = baseSettings.mouseRadius * 0.8;
	// 		}

	// 		// mobile
	// 		if (window.matchMedia("(max-width: 767px)").matches) {
	// 			settings.pixelSize = baseSettings.pixelSize * 0.8;
	// 			settings.blobRadius = baseSettings.blobRadius * 0.28;
	// 			settings.threshold = 1.2;
	// 			settings.speed = 1.2;
	// 			settings.mouseStrength = 0.12;
	// 			settings.mouseRadius = baseSettings.mouseRadius * 0.72;
	// 			settings.bottomBand = baseSettings.bottomBand * 0.72; // keep it tighter to the bottom on small screens
	// 		}

	// 		// tiny phones
	// 		if (window.matchMedia("(max-width: 479px)").matches) {
	// 			settings.pixelSize = baseSettings.pixelSize * 0.64;
	// 		}
	// 	}

	// 	// ====== INTERNALS ======
	// 	let w = 0,
	// 		h = 0,
	// 		dpr = 1;
	// 	let cols = 0,
	// 		rows = 0;
	// 	const blobs = [];
	// 	const mouse = {
	// 		x: -9999,
	// 		y: -9999, // current
	// 		tx: -9999,
	// 		ty: -9999, // target
	// 		alpha: 0, // 0..1 (influence on/off)
	// 		targetAlpha: 0,
	// 	};

	// 	function rand(min, max) {
	// 		return min + Math.random() * (max - min);
	// 	}

	// 	function resize() {
	// 		applyResponsiveSettings();

	// 		const rect = wrap.getBoundingClientRect();
	// 		dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
	// 		w = Math.floor(rect.width);
	// 		h = Math.floor(rect.height);
	// 		const bandTop = h * (1 - settings.bottomBand);

	// 		canvas.width = Math.floor(w * dpr);
	// 		canvas.height = Math.floor(h * dpr);
	// 		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

	// 		cols = Math.ceil(w / settings.pixelSize);
	// 		rows = Math.ceil(h / settings.pixelSize);

	// 		// init blobs once
	// 		if (!blobs.length) {
	// 			for (let i = 0; i < settings.blobCount; i++) {
	// 				blobs.push({
	// 					x: rand(0, w),
	// 					y: rand(bandTop, h),
	// 					vx: rand(-1, 1),
	// 					vy: rand(-0.6, 0.6),
	// 					phase: rand(0, Math.PI * 2),
	// 				});
	// 			}
	// 		}
	// 	}

	// 	function update(dt) {
	// 		const s = settings.speed;
	// 		const bandTop = h * (1 - settings.bottomBand);
	// 		const bandBottom = h * 1.15; // allow a bit below so it “merges” into next section

	// 		for (const b of blobs) {
	// 			b.phase += dt * 0.8;

	// 			// gentle noisy drift (no library)
	// 			b.vx += Math.sin(b.phase) * 0.02;
	// 			b.vy += Math.cos(b.phase * 0.9) * 0.02;

	// 			b.x += b.vx * s * 60 * dt;
	// 			b.y += b.vy * s * 60 * dt;

	// 			// keep in bounds with soft bounce
	// 			if (b.x < -w * 0.1) {
	// 				b.x = -w * 0.1;
	// 				b.vx *= -0.9;
	// 			}
	// 			if (b.x > w * 1.1) {
	// 				b.x = w * 1.1;
	// 				b.vx *= -0.9;
	// 			}
	// 			if (b.y < -h * 0.2) {
	// 				b.y = -h * 0.2;
	// 				b.vy *= -0.9;
	// 			}
	// 			if (b.y > h * 1.2) {
	// 				b.y = h * 1.2;
	// 				b.vy *= -0.9;
	// 			}

	// 			if (b.y < bandTop) {
	// 				b.y = bandTop;
	// 				b.vy = Math.abs(b.vy) * 0.9;
	// 			}
	// 			if (b.y > bandBottom) {
	// 				b.y = bandBottom;
	// 				b.vy = -Math.abs(b.vy) * 0.9;
	// 			}

	// 			// mouse interaction: repel a bit
	// 			if (mouse.alpha > 0.001 && settings.mouseStrength > 0) {
	// 				const dx = b.x - mouse.x;
	// 				const dy = b.y - mouse.y;
	// 				const dist = Math.hypot(dx, dy);
	// 				const r = settings.mouseRadius;
	// 				if (dist < r && dist > 0.001) {
	// 					const force = (1 - dist / r) * 0.08 * settings.mouseStrength * mouse.alpha;

	// 					b.vx += (dx / dist) * force;
	// 					b.vy += (dy / dist) * force;
	// 				}
	// 			}

	// 			// damp velocity so it doesn't explode
	// 			b.vx *= 0.985;
	// 			b.vy *= 0.985;
	// 		}
	// 		// smooth follow + smooth fade
	// 		const follow = 1 - Math.pow(0.001, dt); // framerate-independent
	// 		mouse.x += (mouse.tx - mouse.x) * follow;
	// 		mouse.y += (mouse.ty - mouse.y) * follow;

	// 		const fade = 1 - Math.pow(0.01, dt); // slower
	// 		mouse.alpha += (mouse.targetAlpha - mouse.alpha) * fade;
	// 	}

	// 	function fieldValue(x, y) {
	// 		// sum r^2 / d^2 style metaball field
	// 		let v = 0;
	// 		const r2 = settings.blobRadius * settings.blobRadius;

	// 		for (const b of blobs) {
	// 			const dx = x - b.x;
	// 			const dy = y - b.y;
	// 			const d2 = dx * dx + dy * dy + 0.0001;
	// 			v += r2 / d2;
	// 		}

	// 		// add a "mouse blob" to pull the surface toward cursor
	// 		if (mouse.alpha > 0.001 && settings.mouseStrength > 0) {
	// 			const dx = x - mouse.x;
	// 			const dy = y - mouse.y;
	// 			const d2 = dx * dx + dy * dy + 0.0001;
	// 			const mr2 =
	// 				settings.mouseRadius * settings.mouseRadius * settings.mouseStrength * mouse.alpha;
	// 			v += mr2 / d2;
	// 		}

	// 		return v;
	// 	}

	// 	function render() {
	// 		ctx.clearRect(0, 0, w, h);
	// 		ctx.fillStyle = settings.color;

	// 		const p = settings.pixelSize;

	// 		for (let gy = 0; gy < rows; gy++) {
	// 			const y = gy * p + p * 0.5;
	// 			for (let gx = 0; gx < cols; gx++) {
	// 				const x = gx * p + p * 0.5;

	// 				if (fieldValue(x, y) > settings.threshold) {
	// 					ctx.fillRect(gx * p, gy * p, p, p);
	// 				}
	// 			}
	// 		}
	// 	}

	// 	// ====== LOOP ======
	// 	let last = performance.now();
	// 	function tick(now) {
	// 		const dt = Math.min(0.033, (now - last) / 1000);
	// 		last = now;

	// 		update(dt);
	// 		render();
	// 		requestAnimationFrame(tick);
	// 	}

	// 	// ====== EVENTS ======
	// 	wrap.addEventListener("mousemove", (e) => {
	// 		const r = wrap.getBoundingClientRect();
	// 		mouse.tx = e.clientX - r.left;
	// 		mouse.ty = e.clientY - r.top;
	// 		mouse.targetAlpha = 1;
	// 	});

	// 	wrap.addEventListener("mouseleave", () => {
	// 		mouse.targetAlpha = 0;
	// 	});

	// 	window.addEventListener("resize", resize);

	// 	resize();
	// 	requestAnimationFrame(tick);
	// }

	function newPixelEffect() {
		(() => {
			/**
			 * PixelDivider — responsive modes
			 *
			 * Mode A (Desktop): Interactive erase (1 block) on cursor movement.
			 * Mode B (Tablet and below): No cursor interaction; wave scrolls endlessly.
			 *
			 * Mobile wave shape: moundy + more varied (still smooth).
			 * Animation direction: RIGHT → LEFT.
			 */

			// =========================================================
			// CONTROLS
			// =========================================================
			const CONTROLS = {
				DEBUG_LOGS: true,
				HOST_SELECTOR: "#pixel-divider",

				// Webflow Tablet starts at 991px (Desktop is > 991)
				DISABLE_INTERACTION_AT_AND_BELOW_PX: 991,

				// Grid / sizing
				BLOCK_SIZE_REM: 2, // 1 block = 2rem
				BAND_HEIGHT_BLOCKS: 7, // band height in blocks
				WAVE_MIN_HEIGHT_BLOCKS: 0, // 0 allows dips; set 1 for always-charcoal baseline

				// Desktop wave shape (two-wave blend)
				WAVE_DESKTOP: {
					CYCLES_1_RANGE: [1.0, 2.4],
					CYCLES_2_RANGE: [2.0, 4.4],
					AMP_1_RANGE: [0.45, 0.85],
					AMP_2_RANGE: [0.1, 0.35],
					NOISE_AMOUNT_RANGE: [0.03, 0.12],
					NOISE_SCALE_X: 0.12,
					MAX_FLAT_RUN_BLOCKS: 20,
				},

				// Tablet/Mobile wave shape (moundy + varied)
				WAVE_MOBILE: {
					// Main mound (wide)
					CYCLES_1_RANGE: [0.6, 1.35],
					AMP_1_RANGE: [0.62, 0.95],

					// Extra super-wide variation layer (adds uniqueness per build, stays moundy)
					CYCLES_VARIATION_RANGE: [0.18, 0.45],
					AMP_VARIATION_RANGE: [0.12, 0.28],

					// Soft noise (adds organic variation without jaggies)
					NOISE_AMOUNT_RANGE: [0.03, 0.1],
					NOISE_SCALE_X: 0.06,

					MAX_FLAT_RUN_BLOCKS: 30,

					// Keep rounded but not identical
					SMOOTHING_PASSES: 1,
				},

				// Interaction (desktop only)
				INTERACTION: {
					MOVE_THRESHOLD_PX: 2,
					IGNORE_FIRST_SAMPLE: true,
					ERASE_DURATION_MS: 0, // 0 = instant off; >0 ramps to off over ms
					OFF_HOLD_MS: 600,
				},

				// Tablet/mobile animation (non-interactive)
				ANIMATION: {
					ENABLED: true,
					DIRECTION: "left", // ✅ right-to-left
					BLOCKS_PER_SECOND: 1, // 1 block per 1s
				},

				// Responsive
				RESIZE_DEBOUNCE_MS: 140,
			};

			// =========================================================
			// Logging
			// =========================================================
			const log = (...a) => CONTROLS.DEBUG_LOGS && console.log("[PixelDivider]", ...a);
			const warn = (...a) => CONTROLS.DEBUG_LOGS && console.warn("[PixelDivider]", ...a);

			// =========================================================
			// Guards
			// =========================================================
			if (typeof window.p5 === "undefined") {
				warn("p5.js not found. Load p5 before this script.");
				return;
			}
			log("p5.js loaded ✅");

			const hostEl = document.querySelector(CONTROLS.HOST_SELECTOR);
			if (!hostEl) {
				warn(`Canvas host not found: ${CONTROLS.HOST_SELECTOR}`);
				return;
			}
			log("Canvas host found ✅", hostEl);

			// =========================================================
			// Utilities
			// =========================================================
			const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

			const remToPx = (rem) => {
				const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
				return rem * rootFont;
			};

			const getCharcoal = () =>
				getComputedStyle(document.documentElement).getPropertyValue("--charcoal").trim() ||
				"#2b2b2b";

			const enforceMaxRun = (arr, maxRun, maxH, minH) => {
				if (!arr.length) return;
				let runVal = arr[0];
				let runLen = 1;

				for (let i = 1; i < arr.length; i++) {
					if (arr[i] === runVal) {
						runLen++;
						if (runLen > maxRun) {
							const dir = i % 2 === 0 ? 1 : -1;
							arr[i] = clamp(runVal + dir, minH, maxH);
							runVal = arr[i];
							runLen = 1;
						}
					} else {
						runVal = arr[i];
						runLen = 1;
					}
				}
			};

			// Smooth integer skyline with moving average; re-quantize to ints
			const smoothHeights = (heights, passes, minH, maxH) => {
				if (!passes || passes <= 0) return heights;

				let arr = heights.slice();
				for (let p = 0; p < passes; p++) {
					const next = arr.slice();
					for (let i = 0; i < arr.length; i++) {
						const a = arr[(i - 1 + arr.length) % arr.length];
						const b = arr[i];
						const c = arr[(i + 1) % arr.length];
						const avg = Math.round((a + b + c) / 3);
						next[i] = clamp(avg, minH, maxH);
					}
					arr = next;
				}
				return arr;
			};

			// =========================================================
			// Sketch lifecycle
			// =========================================================
			let sketchInstance = null;

			const isInteractive = () => window.innerWidth > CONTROLS.DISABLE_INTERACTION_AT_AND_BELOW_PX;

			const createSketch = () => {
				if (sketchInstance) {
					log("Removing existing sketch…");
					sketchInstance.remove();
					sketchInstance = null;
				}

				const blockPx = Math.max(1, Math.round(remToPx(CONTROLS.BLOCK_SIZE_REM)));
				const bandHeightPx = blockPx * CONTROLS.BAND_HEIGHT_BLOCKS;
				hostEl.style.height = `${bandHeightPx}px`;

				const rect = hostEl.getBoundingClientRect();
				const w = Math.max(1, Math.floor(rect.width));
				const h = Math.max(1, Math.floor(rect.height));

				const interactive = isInteractive();
				log(
					`Canvas ${w}x${h} | block=${blockPx}px | mode=${interactive ? "INTERACTIVE (desktop)" : "ANIMATED (tablet↓)"}`,
				);

				sketchInstance = new p5((p) => {
					let cols = 0;
					const rows = CONTROLS.BAND_HEIGHT_BLOCKS;

					// Displayed wave
					let heights = [];

					// Base wave for animation shifting (tablet↓)
					let baseHeights = [];

					// State for interactive erase (desktop)
					let vis = [];
					let eraseStartMs = [];
					let offUntilMs = [];

					// Movement gating (desktop)
					let ignoreNext = CONTROLS.INTERACTION.IGNORE_FIRST_SAMPLE;

					const rand = (min, max) => p.random(min, max);

					const buildWaveOnce = () => {
						cols = Math.ceil(p.width / blockPx);

						const minH = CONTROLS.WAVE_MIN_HEIGHT_BLOCKS;
						const maxH = rows;

						const useMobileWave = !interactive; // tablet↓ uses mobile-friendly wave
						const W = useMobileWave ? CONTROLS.WAVE_MOBILE : CONTROLS.WAVE_DESKTOP;

						const newHeights = new Array(cols);

						// Random params ONCE per build (important)
						const phase1 = rand(0, Math.PI * 2);
						const cycles1 = rand(W.CYCLES_1_RANGE[0], W.CYCLES_1_RANGE[1]);
						const k1 = (Math.PI * 2 * cycles1) / p.width;

						const a1 = rand(W.AMP_1_RANGE[0], W.AMP_1_RANGE[1]);
						const nAmt = rand(W.NOISE_AMOUNT_RANGE[0], W.NOISE_AMOUNT_RANGE[1]);

						// Desktop second wave params
						let phase2 = 0,
							k2 = 0,
							a2 = 0;
						if (!useMobileWave) {
							phase2 = rand(0, Math.PI * 2);
							const cycles2 = rand(W.CYCLES_2_RANGE[0], W.CYCLES_2_RANGE[1]);
							k2 = (Math.PI * 2 * cycles2) / p.width;
							a2 = rand(W.AMP_2_RANGE[0], W.AMP_2_RANGE[1]);
						}

						// Mobile variation wave params (super-wide) — ONCE per build
						let phaseV = 0,
							kV = 0,
							aV = 0;
						if (useMobileWave) {
							phaseV = rand(0, Math.PI * 2);
							const cyclesV = rand(W.CYCLES_VARIATION_RANGE[0], W.CYCLES_VARIATION_RANGE[1]);
							kV = (Math.PI * 2 * cyclesV) / p.width;
							aV = rand(W.AMP_VARIATION_RANGE[0], W.AMP_VARIATION_RANGE[1]);
						}

						for (let i = 0; i < cols; i++) {
							const x = i * blockPx + blockPx * 0.5;

							const s1 = (Math.sin(x * k1 + phase1) + 1) * 0.5; // 0..1
							let v = s1 * a1;

							if (useMobileWave) {
								const sV = (Math.sin(x * kV + phaseV) + 1) * 0.5;
								v += sV * aV;
							} else {
								const s2 = (Math.sin(x * k2 + phase2) + 1) * 0.5;
								v += s2 * a2;
							}

							// baked-in static noise
							const n = p.noise(i * W.NOISE_SCALE_X, 101.123);
							v += (n - 0.5) * 2 * nAmt;

							v = clamp(v, 0, 1);

							const hBlocks = Math.floor(v * rows);
							newHeights[i] = clamp(hBlocks, minH, maxH);
						}

						enforceMaxRun(newHeights, W.MAX_FLAT_RUN_BLOCKS, maxH, minH);

						// Optional smoothing on tablet↓ to keep mounds, not jaggies
						const smoothed =
							useMobileWave && W.SMOOTHING_PASSES
								? smoothHeights(newHeights, W.SMOOTHING_PASSES, minH, maxH)
								: newHeights;

						heights = smoothed.slice();
						baseHeights = smoothed.slice();

						// Init interactive state grids (only meaningful on desktop)
						vis = new Array(cols);
						eraseStartMs = new Array(cols);
						offUntilMs = new Array(cols);
						for (let c = 0; c < cols; c++) {
							vis[c] = new Array(rows).fill(1);
							eraseStartMs[c] = new Array(rows).fill(null);
							offUntilMs[c] = new Array(rows).fill(0);
						}

						log("Wave built ✅", {
							cols,
							profile: useMobileWave ? "mobile(mound+variation)" : "desktop(two-wave)",
						});
					};

					// Tablet↓ animation: shift baseHeights sideways by a block offset
					const applyAnimatedOffset = () => {
						if (interactive) return;
						if (!CONTROLS.ANIMATION.ENABLED) return;

						const bps = Math.max(0, CONTROLS.ANIMATION.BLOCKS_PER_SECOND);
						if (bps === 0) return;

						const dir = CONTROLS.ANIMATION.DIRECTION === "left" ? -1 : 1;
						const offsetBlocks = Math.floor((p.millis() / 1000) * bps) * dir;

						for (let i = 0; i < cols; i++) {
							const src = (i - offsetBlocks) % cols;
							const idx = (src + cols) % cols;
							heights[i] = baseHeights[idx];
						}
					};

					// Desktop interaction: erase exactly one cell under cursor on movement
					const eraseOneCellIfMoving = () => {
						if (!interactive) return;

						if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
							ignoreNext = CONTROLS.INTERACTION.IGNORE_FIRST_SAMPLE;
							return;
						}

						const dx = p.movedX || 0;
						const dy = p.movedY || 0;
						const dist = Math.sqrt(dx * dx + dy * dy);

						if (ignoreNext) {
							ignoreNext = false;
							return;
						}

						if (dist < CONTROLS.INTERACTION.MOVE_THRESHOLD_PX) return;

						const col = clamp(Math.floor(p.mouseX / blockPx), 0, cols - 1);

						const rowFromTop = Math.floor(p.mouseY / blockPx);
						const rowFromBottom = rows - 1 - rowFromTop;
						const row = clamp(rowFromBottom, 0, rows - 1);

						if (row >= heights[col]) return;

						const now = p.millis();
						if (now < offUntilMs[col][row]) return;

						if (CONTROLS.INTERACTION.ERASE_DURATION_MS === 0) {
							vis[col][row] = 0;
							eraseStartMs[col][row] = null;
							offUntilMs[col][row] = now + CONTROLS.INTERACTION.OFF_HOLD_MS;
							return;
						}

						if (eraseStartMs[col][row] === null) {
							eraseStartMs[col][row] = now;
						}
					};

					const updateInteractiveBlocks = () => {
						if (!interactive) return;

						const now = p.millis();
						const eraseMs = CONTROLS.INTERACTION.ERASE_DURATION_MS;

						for (let c = 0; c < cols; c++) {
							const colHeight = heights[c];

							for (let r = 0; r < colHeight; r++) {
								if (now < offUntilMs[c][r]) {
									vis[c][r] = 0;
									eraseStartMs[c][r] = null;
									continue;
								}

								if (vis[c][r] === 0 && offUntilMs[c][r] !== 0 && now >= offUntilMs[c][r]) {
									vis[c][r] = 1;
									offUntilMs[c][r] = 0;
									eraseStartMs[c][r] = null;
									continue;
								}

								const start = eraseStartMs[c][r];
								if (start !== null && eraseMs > 0) {
									const t = clamp((now - start) / eraseMs, 0, 1);
									vis[c][r] = 1 - t;

									if (t >= 1) {
										vis[c][r] = 0;
										eraseStartMs[c][r] = null;
										offUntilMs[c][r] = now + CONTROLS.INTERACTION.OFF_HOLD_MS;
									}
								}
							}
						}
					};

					const drawBlocks = () => {
						const charcoal = getCharcoal();
						const baseY = p.height;

						p.fill(charcoal);

						for (let c = 0; c < cols; c++) {
							const x = c * blockPx;
							const colHeight = heights[c];

							for (let r = 0; r < colHeight; r++) {
								const a = interactive ? vis[c][r] : 1;
								if (a <= 0.001) continue;

								const y = baseY - (r + 1) * blockPx;

								p.push();
								p.drawingContext.globalAlpha = a;
								p.rect(x, y, blockPx, blockPx);
								p.pop();
							}
						}

						p.drawingContext.globalAlpha = 1;
					};

					p.setup = () => {
						const cnv = p.createCanvas(w, h);
						cnv.parent(hostEl);

						p.pixelDensity(1);
						p.noStroke();
						p.clear();

						buildWaveOnce();
						ignoreNext = CONTROLS.INTERACTION.IGNORE_FIRST_SAMPLE;

						log("Canvas created ✅");
					};

					p.draw = () => {
						p.clear();

						applyAnimatedOffset(); // tablet↓ only
						eraseOneCellIfMoving(); // desktop only
						updateInteractiveBlocks(); // desktop only
						drawBlocks();
					};
				});
			};

			// Debounced resize rebuild
			let resizeTimer = null;
			const onResize = () => {
				if (resizeTimer) window.clearTimeout(resizeTimer);
				resizeTimer = window.setTimeout(() => {
					log("Resize detected → rebuilding");
					createSketch();
				}, CONTROLS.RESIZE_DEBOUNCE_MS);
			};
			window.addEventListener("resize", onResize, { passive: true });

			// Boot + debug API
			createSketch();
			log("Ready ✅", {
				interactionDisabledAtAndBelow: CONTROLS.DISABLE_INTERACTION_AT_AND_BELOW_PX,
				tabletAnimationDirection: CONTROLS.ANIMATION.DIRECTION,
				tabletAnimationBlocksPerSecond: CONTROLS.ANIMATION.BLOCKS_PER_SECOND,
			});

			window.PixelDivider = {
				rebuild: () => {
					log("Manual rebuild requested");
					createSketch();
				},
				controls: CONTROLS,
			};
		})();
	}

	function formButtonProxySubmit() {
		const buttons = document.querySelectorAll(".form_button-wrap > .button");
		buttons.forEach((btn) => {
			btn.addEventListener("click", (event) => {
				// If this is an anchor-style button, prevent navigation so the submit can happen.
				if (btn.tagName === "A") event.preventDefault();

				const formRoot = btn.closest(".form");
				if (!formRoot) return;
				const hiddenSubmit = formRoot.querySelector(".form_submit-hidden");
				if (!hiddenSubmit) return;

				hiddenSubmit.click();
			});
		});
	}

	function customSelect() {
		const dropdowns = document.querySelectorAll('[data-custom-select="dropdown"]');
		if (!dropdowns.length) return;

		dropdowns.forEach((dropdown) => {
			const select = dropdown.querySelector("select");
			const defaultTextEl = dropdown.querySelector('[data-custom-select="default"]');
			const toggleTextFallback = dropdown.querySelector(".w-dropdown-toggle > div");
			const optionsWrap = dropdown.querySelector(".custom-select_list");
			if (!select || !optionsWrap) return;

			const placeholderText = defaultTextEl
				? defaultTextEl.textContent.trim()
				: toggleTextFallback
					? toggleTextFallback.textContent.trim()
					: "Select an option";

			// Ensure a "default/reset" option exists as the first list item
			let resetLink = optionsWrap.querySelector('[data-custom-select="reset"]');
			if (!resetLink) {
				resetLink = document.createElement("a");
				resetLink.href = "#";
				resetLink.className = "custom-select_option w-dropdown-link";
				resetLink.setAttribute("data-custom-select", "reset");
				resetLink.setAttribute("data-value", "");
				resetLink.textContent = placeholderText;
				optionsWrap.prepend(resetLink);
			} else {
				resetLink.textContent = placeholderText;
				resetLink.setAttribute("data-value", "");
			}

			// Collect options (including reset)
			const optionLinks = Array.from(
				optionsWrap.querySelectorAll("a.custom-select_option, a.custom-select__option"),
			);
			if (!optionLinks.length) return;

			// Build select options from list
			const optionsData = [];
			optionLinks.forEach((a) => {
				const label = a.textContent.trim();
				if (!label && a.getAttribute("data-value") !== "") return;
				const value = (a.getAttribute("data-value") ?? label).trim();
				optionsData.push({ value, label: label || placeholderText });
			});

			// Rebuild select
			select.innerHTML = "";
			optionsData.forEach(({ value, label }) => {
				const opt = document.createElement("option");
				opt.value = value;
				opt.textContent = label;
				select.appendChild(opt);
			});

			function setCurrentUI(value) {
				const match = optionsData.find((o) => o.value === value);
				const label = match ? match.label : placeholderText;

				if (defaultTextEl) defaultTextEl.textContent = label;
				else if (toggleTextFallback) toggleTextFallback.textContent = label;

				optionLinks.forEach((a) => a.classList.remove("is-current"));

				const active = optionLinks.find((a) => (a.getAttribute("data-value") || "") === value);
				if (active) active.classList.add("is-current");
			}

			optionsWrap.addEventListener("click", (e) => {
				const option = e.target.closest("a.custom-select_option, a.custom-select__option");
				if (!option) return;
				e.preventDefault();

				const label = option.textContent.trim();
				const value = (option.getAttribute("data-value") || label).trim();

				select.value = value;
				select.dispatchEvent(new Event("input", { bubbles: true }));
				select.dispatchEvent(new Event("change", { bubbles: true }));

				setCurrentUI(value);

				closeDropdown(dropdown);
			});

			select.addEventListener("change", () => setCurrentUI(select.value));

			// Init
			if (!select.value) select.value = "";
			setCurrentUI(select.value);
		});

		function closeDropdown(dropdown) {
			// Preferred: notify Webflow dropdown component properly
			if (window.jQuery) {
				window.jQuery(dropdown).trigger("w-close");
				window.jQuery(dropdown).trigger("w-close.w-dropdown");
				return;
			}

			dropdown.classList.remove("w--open");

			const toggle = dropdown.querySelector(".w-dropdown-toggle");
			const list = dropdown.querySelector(".w-dropdown-list");

			if (toggle) {
				toggle.setAttribute("aria-expanded", "false");
				toggle.classList.remove("w--open");
			}

			if (list) {
				list.classList.remove("w--open");
			}
		}
	}

	function cards() {
		const cards = document.querySelectorAll(".card");

		cards.forEach((card, index) => {
			const isLast = index === cards.length - 1;
			const cardInner = card.querySelector(".card_inner");
			const cardContent = card.querySelector(".card_content");

			if (!isLast) {
				gsap.to(cardContent, {
					rotationZ: (Math.random() - 0.5) * 10,
					scale: 0.7,
					rotationX: 40,
					ease: "power1.in",
					scrollTrigger: {
						pin: cardInner,
						trigger: card,
						start: "top top",
						end: "+=" + window.innerHeight,
						scrub: true,
					},
				});

				const pinDuration = window.innerHeight;

				gsap.to(cardContent, {
					autoAlpha: 0,
					ease: "power1.inOut",
					scrollTrigger: {
						trigger: card,
						start: `top+=${pinDuration * 0.75} top`,
						end: `top+=${pinDuration} top`,
						scrub: true,
					},
				});
			}
		});
	}

	function faq() {
		const items = Array.from(document.querySelectorAll(".faq_item"));
		if (!items.length) return;

		const closeItem = (item) => {
			const bodyWrap = item.querySelector(".faq_item-body-wrap");
			const svg = item.querySelector(".faq_item-svg");
			if (!bodyWrap) return;

			item.classList.remove("is-open");
			gsap.killTweensOf([bodyWrap, svg].filter(Boolean));
			gsap.to(bodyWrap, { height: 0, duration: 0.3, ease: "power3.inOut" });
			if (svg) gsap.to(svg, { rotate: 0, duration: 0.25, ease: "power3.out" });
		};

		const openItem = (item) => {
			const bodyWrap = item.querySelector(".faq_item-body-wrap");
			const svg = item.querySelector(".faq_item-svg");
			if (!bodyWrap) return;

			items.forEach((other) => {
				if (other !== item && other.classList.contains("is-open")) closeItem(other);
			});

			item.classList.add("is-open");
			gsap.killTweensOf([bodyWrap, svg].filter(Boolean));
			gsap.set(bodyWrap, { overflow: "hidden" });
			gsap.to(bodyWrap, { height: "auto", duration: 0.35, ease: "power3.out" });
			if (svg) gsap.to(svg, { rotate: 180, duration: 0.25, ease: "power3.out" });
		};

		// Initial state
		items.forEach((item) => {
			const header = item.querySelector(".faq_item-header");
			const bodyWrap = item.querySelector(".faq_item-body-wrap");
			const svg = item.querySelector(".faq_item-svg");
			if (!header || !bodyWrap) return;

			item.classList.remove("is-open");
			gsap.set(bodyWrap, { height: 0, overflow: "hidden" });
			if (svg) gsap.set(svg, { rotate: 0 });

			header.addEventListener("click", (e) => {
				e.preventDefault();
				if (item.classList.contains("is-open")) closeItem(item);
				else openItem(item);
			});
		});
	}

	function carousel() {
		if (typeof gsap === "undefined") return;

		const sliders = Array.from(document.querySelectorAll(".timeline_slider"));
		if (!sliders.length) return;

		sliders.forEach((slider) => {
			const list = slider.querySelector(".timeline-slider_list");
			const slides = Array.from(slider.querySelectorAll(".timeline-slider_slide"));
			if (!slides.length) return;

			const refreshScrollTriggers = () => {
				if (typeof ScrollTrigger === "undefined") return;
				requestAnimationFrame(() => ScrollTrigger.refresh());
			};

			const prevBtn = slider.querySelector(".timeline_slider-button.is-prev");
			const nextBtn = slider.querySelector(".timeline_slider-button.is-next");
			const pagination = slider.querySelector(".timeline_slider-pagination");
			if (!prevBtn || !nextBtn || !pagination) return;

			const total = slides.length;
			let currentIndex = 0;
			let isAnimating = false;

			const updateControls = () => {
				prevBtn.disabled = currentIndex === 0;
				nextBtn.disabled = currentIndex === total - 1;
				prevBtn.setAttribute("aria-disabled", String(prevBtn.disabled));
				nextBtn.setAttribute("aria-disabled", String(nextBtn.disabled));
				pagination.innerText = `${currentIndex + 1}/${total}`;
			};

			const setActiveSlide = (index) => {
				currentIndex = Math.min(Math.max(index, 0), total - 1);
				slides.forEach((slide, idx) => {
					const isActive = idx === currentIndex;
					slide.hidden = !isActive;
					slide.setAttribute("aria-hidden", String(!isActive));
					gsap.set(slide, {
						autoAlpha: isActive ? 1 : 0,
						pointerEvents: isActive ? "auto" : "none",
					});
					if (isActive) gsap.set(slide, { clearProps: "position,top,left,width" });
				});

				if (list) {
					gsap.set(list, { position: "relative", height: "auto" });
				}
				updateControls();
			};

			const transitionTo = (nextIndex) => {
				const targetIndex = Math.min(Math.max(nextIndex, 0), total - 1);
				if (isAnimating) return;
				if (targetIndex === currentIndex) return;

				const currentSlide = slides[currentIndex];
				const nextSlide = slides[targetIndex];
				if (!currentSlide || !nextSlide) return;
				if (!list) {
					setActiveSlide(targetIndex);
					return;
				}

				isAnimating = true;

				// Measure current slide height (list is already at auto)
				const currentHeight = currentSlide.offsetHeight;

				// Prep next slide for measuring + fade-in
				nextSlide.hidden = false;
				nextSlide.setAttribute("aria-hidden", "false");
				gsap.set(nextSlide, {
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					autoAlpha: 0,
					pointerEvents: "none",
				});

				const nextHeight = nextSlide.offsetHeight;
				gsap.set(list, { height: currentHeight });

				// Update index/pagination immediately so UI feels responsive
				currentIndex = targetIndex;
				updateControls();

				gsap
					.timeline({
						defaults: { ease: "power2.out" },
						onComplete: () => {
							// Hide old slides, keep only active visible
							slides.forEach((slide, idx) => {
								const isActive = idx === currentIndex;
								slide.hidden = !isActive;
								slide.setAttribute("aria-hidden", String(!isActive));
								gsap.set(slide, {
									autoAlpha: isActive ? 1 : 0,
									pointerEvents: isActive ? "auto" : "none",
								});
							});

							// Reset positioning on the now-active slide
							// gsap.set(nextSlide, { clearProps: "position,top,left,width,pointerEvents" });
							// gsap.set(list, { height: "auto" });
							isAnimating = false;
							refreshScrollTriggers();
						},
					})
					.to(list, { height: nextHeight, duration: 0.35 }, 0)
					.to(currentSlide, { autoAlpha: 0, duration: 0.2 }, 0)
					.to(nextSlide, { autoAlpha: 1, duration: 0.25 }, 0.08);
			};

			// init
			setActiveSlide(0);

			prevBtn.addEventListener("click", (e) => {
				e.preventDefault();
				if (prevBtn.disabled) return;
				transitionTo(currentIndex - 1);
			});

			nextBtn.addEventListener("click", (e) => {
				e.preventDefault();
				if (nextBtn.disabled) return;
				transitionTo(currentIndex + 1);
			});
		});
	}

	function cardsTitleColorScroll() {
		if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

		const titles = Array.from(document.querySelectorAll(".c-cards h2.section-title"));
		if (!titles.length) return;

		const centres = Array.from(document.querySelectorAll(".timeline_center, .timeline_centre"));
		const lastCentre = centres[centres.length - 1];
		if (!lastCentre) return;

		const tween = gsap.to(titles, {
			color: "#9887ff",
			duration: 0.75,
			ease: "power2.out",
			paused: true,
		});

		ScrollTrigger.create({
			trigger: lastCentre,
			start: "bottom center",
			onEnter: () => tween.play(),
			onLeaveBack: () => tween.reverse(),
		});
	}

	function initImpactGallery() {
		const section = document.querySelector(".c-impact");
		const scroller = section?.querySelector(".impact_scroll");
		const sticky = section?.querySelector(".impact_sticky-content");
		const content = section?.querySelector(".impact_content");
		const imgsWrap = section?.querySelector(".impact_imgs");
		const items = gsap.utils.toArray(".c-impact-img", imgsWrap);
		const isMobile = () => window.innerWidth <= 767;

		if (!scroller || !sticky || !imgsWrap || !items.length) return;

		// --- cleanup: kill old ST + ticker fn (prevents stacking) ---
		if (scroller._impactST) {
			scroller._impactST.kill();
			scroller._impactST = null;
		}
		if (scroller._impactContentTween) {
			scroller._impactContentTween.kill();
			scroller._impactContentTween = null;
		}
		if (scroller._impactTickerFn) {
			gsap.ticker.remove(scroller._impactTickerFn);
			scroller._impactTickerFn = null;
		}

		// also kill any stray triggers tied to this section (optional safety)
		ScrollTrigger.getAll()
			.filter((st) => st.trigger === scroller)
			.forEach((st) => st.kill());

		// Mobile: do not run any of the Impact animation machinery
		if (isMobile()) {
			// Avoid a huge scroll-only section on mobile
			scroller.style.height = "";

			// Content should just be visible
			if (content) gsap.set(content, { opacity: 1, y: 0, clearProps: "willChange" });

			// Hide images on mobile (previous behavior), and clear any 3D styles
			imgsWrap.style.visibility = "";
			imgsWrap.style.transformStyle = "";
			sticky.style.perspective = "";

			items.forEach((el) => {
				gsap.set(el, {
					opacity: 0,
					clearProps:
						"filter,transform,willChange,backfaceVisibility,transformStyle,z,left,top,xPercent,yPercent",
				});
			});
			return;
		}

		imgsWrap.style.visibility = "hidden";

		// perspective: good
		sticky.style.perspective = `${Math.round(window.innerWidth * 0.9)}px`;
		imgsWrap.style.transformStyle = "preserve-3d";

		const clamp01 = gsap.utils.clamp(0, 1);

		function biasedPosition(el, { sideBias, minGutter, centerExclusion, topPad, bottomPad } = {}) {
			const vw = window.innerWidth;
			const rect = el.getBoundingClientRect();
			const w = rect.width || 260;

			const xMin = minGutter + w * 0.5;
			const xMax = vw - minGutter - w * 0.5;

			const cx = vw * 0.5;
			const halfDead = vw * centerExclusion * 0.5;

			const leftBand = [xMin, Math.max(xMin, cx - halfDead)];
			const rightBand = [Math.min(xMax, cx + halfDead), xMax];

			const pickRight = Math.random() < sideBias;
			let band = pickRight ? rightBand : leftBand;
			if (band[1] - band[0] < 20) band = [xMin, xMax];

			const xPx = gsap.utils.random(band[0], band[1], 1);
			const yPct = gsap.utils.random(topPad, 100 - bottomPad, 1);

			return {
				left: `${(xPx / vw) * 100}%`,
				top: `${yPct}%`,
			};
		}

		// --- TIMING MODEL ---
		const vh = () => window.innerHeight;

		const stepPx = () => vh() * 0.35;
		const winPx = () => vh() * 1.5;
		const leadIn = () => vh() * 0.25;
		const tailOut = () => vh() * 0.25;

		const totalScrollPx = () => leadIn() + (items.length - 1) * stepPx() + winPx() + tailOut();

		const setScrollerHeight = () => {
			const total = totalScrollPx();
			scroller.style.height = `${Math.ceil(((total + vh()) / vh()) * 100)}vh`;
		};
		if (!isMobile()) setScrollerHeight();

		// --- impact content fade-in (scrubbed) ---
		if (content) {
			if (isMobile()) {
				gsap.set(content, { opacity: 1, y: 0, clearProps: "willChange" });
			} else {
				gsap.set(content, { opacity: 0, y: 10, willChange: "opacity, transform" });
				scroller._impactContentTween = gsap.to(content, {
					opacity: 1,
					y: 0,
					ease: "none",
					scrollTrigger: {
						trigger: scroller,
						start: () => `top+=${Math.round(totalScrollPx() * 0.25)} top`,
						end: () => `top+=${Math.round(totalScrollPx() * 0.45)} top`,
						scrub: true,
						invalidateOnRefresh: true,
					},
				});
			}
		}

		// --- layout + baseline (no transform strings) ---
		items.forEach((el) => {
			const pos = biasedPosition(el, {
				sideBias: 0.5,
				minGutter: 32,
				centerExclusion: 0.35,
				topPad: 50,
				bottomPad: 75,
			});

			gsap.set(el, {
				left: pos.left,
				top: pos.top,
				xPercent: -50,
				yPercent: -50,
				opacity: 0,
				filter: "blur(20px)",
				transformStyle: "preserve-3d",
				backfaceVisibility: "hidden",
				willChange: "transform, opacity, filter",
				z: -300, // in vh units we’ll treat as vh later; you can switch to px if you want
			});
		});

		// --- quickSetters (components, NOT full transform) ---
		const setters = items.map((el) => ({
			z: gsap.quickSetter(el, "z", "vh"), // sets translateZ(...) in vh units
			opacity: gsap.quickSetter(el, "opacity"),
			blur: (px) => (el.style.filter = `blur(${px}px)`),
		}));

		function render(t) {
			const fadeInP = 0.35;
			const fadeOutP = 0.25;

			items.forEach((el, i) => {
				const start = leadIn() + i * stepPx();
				const u = (t - start) / winPx();
				const p = clamp01(u);

				// outside its window -> hard hidden
				if (u <= 0 || u >= 1) {
					setters[i].opacity(0);
					setters[i].blur(20);
					setters[i].z(-300);
					return;
				}

				let alpha;
				if (p < fadeInP) alpha = p / fadeInP;
				else if (p > 1 - fadeOutP) alpha = (1 - p) / fadeOutP;
				else alpha = 1;

				const blurPx = 20 * (1 - alpha);
				const zVh = -300 + 500 * p;

				setters[i].opacity(alpha);
				setters[i].blur(blurPx);
				setters[i].z(zVh);
			});
		}

		// --- ScrollTrigger (raw) ---
		const st = ScrollTrigger.create({
			trigger: scroller,
			start: "top top",
			end: () => "+=" + totalScrollPx(),
			scrub: false, // IMPORTANT: manual smoothing handles “scrub”
			invalidateOnRefresh: true,
			onRefresh: setScrollerHeight,
		});
		scroller._impactST = st;

		// --- manual scrub via ticker (store fn so we can remove it) ---
		let smoothedT = 0;
		const scrubSeconds = 0.2; // 0.2 is quite “snappy”; try 0.6–1.2 for smoother

		scroller._impactTickerFn = () => {
			if (!scroller._impactST) return;
			if (isMobile()) {
				items.forEach((el) => (el.style.opacity = "0"));
				return;
			}

			const rawT = scroller._impactST.scroll() - scroller._impactST.start;

			const dt = gsap.ticker.deltaRatio() / 60;
			const k = 1 - Math.exp(-dt / scrubSeconds);
			smoothedT += (rawT - smoothedT) * k;

			render(smoothedT);
		};

		gsap.ticker.add(scroller._impactTickerFn);

		// first paint
		render(0);
		ScrollTrigger.refresh();
		imgsWrap.style.visibility = "";
	}

	// Run after load so image sizes exist for safe positioning
	window.addEventListener("load", initImpactGallery);

	function randomImgSrc() {
		const impactImgs = document.querySelectorAll(".c-impact-img > img");
		impactImgs.forEach((img, index) => {
			img.src = `https://picsum.photos/600/600.webp?random=${Math.random() * 1000 + index}`;
		});
	}

	// run once, and again on resize (debounced)
	initImpactGallery();
	// window.addEventListener("resize", gsap.utils.debounce(initImpactGallery, 250));

	if ("requestIdleCallback" in window) {
		requestIdleCallback(cards);
	} else {
		setTimeout(cards, 500);
	}

	// call functions

	randomImgSrc();
	buttonHover();
	navOpen();
	// pixelEdgeEffect();
	newPixelEffect();
	formButtonProxySubmit();
	customSelect();
	faq();
	carousel();
	cardsTitleColorScroll();
}
