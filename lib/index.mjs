//#region src/index.ts
const name = "dsh-plugin-astrology";
const inject = [];
function isDesktopAstrologyService(value) {
	return typeof value === "object" && value !== null && "apiVersion" in value && value.apiVersion === 1 && "activate" in value && typeof value.activate === "function";
}
/** Activate native windows and safe routes only while the bundle is loaded. */
function apply(ctx) {
	const candidate = ctx.get("desktopAstrology", false);
	if (!isDesktopAstrologyService(candidate)) return;
	ctx.effect(() => candidate.activate(), "Astrology Desktop capability");
}
//#endregion
export { apply, inject, name };
