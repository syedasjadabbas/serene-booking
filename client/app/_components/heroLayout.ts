// Shared geometry for the home hero picture and the sky arch that rises over it (a plain module, so the
// server-rendered EraArch and the client EraHero can both use it).

/** Height of the photo band: tall enough for the tower to come up into view before the arch arrives (cropped a little at the sides). */
export const PHOTO_H = "max(82vw, 90svh)";
/** Painted sky above the photo. */
export const SKY_H = "55svh";
/** Hero (first screen) height. */
export const HERO_H = "max(100svh, 680px)";
/** How far below its resting place the arch waits (% of screen height) before gliding up as you scroll. */
export const ARCH_RISE = 40;
/** The whole tall picture: sky + photo, plus room for the arch's rise so the photo shows at its corners. */
export const SCENE_H = `calc(${SKY_H} + ${PHOTO_H} + ${ARCH_RISE}svh)`;
/** Scroll distance of the opening splash (the arch window growing to full screen). */
export const INTRO_H = "110svh";
/** Pull the sky arch up over the picture so the bottom of its curve (42% of the width) meets the photo's lower part. */
export const ARCH_TOP = `calc(-42vw - ${ARCH_RISE}svh)`;
