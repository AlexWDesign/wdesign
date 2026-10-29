/*
 * Shared GSAP setup for scroll-driven animation on the home page.
 * Components import from here so plugins are registered once and every
 * section uses the same easing and letter-rise animation.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Resolves once web fonts are in, so text is split with its final metrics. */
export const fontsReady = (): Promise<unknown> =>
	Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 2000))]);

/** Runs once the intro has handed over (or straight away if there is no intro). */
export function afterIntro(callback: () => void) {
	if (!document.documentElement.classList.contains('intro-pending')) return callback();
	window.addEventListener('intro:done', () => callback(), { once: true });
}

/**
 * Letters rise into place from below, each starting tipped over on its
 * bottom-left corner and standing up, one after another — a domino fall
 * played backwards. Elements using this carry `data-rise`, which keeps them
 * hidden until they are split (see global.css).
 */
export function riseIn(
	element: HTMLElement,
	scrollTrigger: ScrollTrigger.Vars = { trigger: element, start: 'top 85%' },
) {
	if (reducedMotion) {
		gsap.set(element, { visibility: 'visible' });
		return;
	}

	const split = SplitText.create(element, { type: 'words,chars' });
	gsap.set(element, { visibility: 'visible' });

	return gsap.from(split.chars, {
		yPercent: 70,
		rotate: 24,
		opacity: 0,
		transformOrigin: '0% 100%',
		duration: 1.5,
		ease: 'expo.out',
		stagger: 0.03,
		scrollTrigger: { once: true, ...scrollTrigger },
	});
}

/** Soft fade and lift, for paragraphs and supporting text. */
export function fadeUp(
	element: Element | Element[],
	scrollTrigger: ScrollTrigger.Vars,
	vars: gsap.TweenVars = {},
) {
	if (reducedMotion) return;

	return gsap.from(element, {
		opacity: 0,
		y: 24,
		duration: 1.6,
		ease: 'expo.out',
		scrollTrigger: { once: true, ...scrollTrigger },
		...vars,
	});
}

/**
 * Moves an image or video inside its overflow-hidden frame as the frame
 * scrolls through the viewport. The media is sized `--shift` larger above
 * and below the frame (see `.parallax` in global.css).
 * `direction` 1 drifts down while scrolling down, -1 drifts up.
 */
export function parallax(media: HTMLElement, direction: 1 | -1) {
	if (reducedMotion) return;

	const frame = media.parentElement ?? media;
	const shift = () => parseFloat(getComputedStyle(frame).getPropertyValue('--shift')) || 0;

	gsap.fromTo(
		media,
		{ y: () => -direction * shift() },
		{
			y: () => direction * shift(),
			ease: 'none',
			scrollTrigger: {
				trigger: frame,
				start: 'top bottom',
				end: 'bottom top',
				scrub: true,
				invalidateOnRefresh: true,
			},
		},
	);
}
