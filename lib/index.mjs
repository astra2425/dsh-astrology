import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { win32 } from "node:path";
import { fileURLToPath } from "node:url";
//#region src/windows-pet.ts
/** Start one independent, opted-in companion owned by the DSH Host lifecycle. */
function launchWindowsPet() {
	const systemRoot = process.env.SystemRoot;
	if (!systemRoot || !win32.isAbsolute(systemRoot)) return () => void 0;
	const resources = new URL("../resources/desktop/", import.meta.url);
	const script = readFileSync(new URL("windows-pet.ps1", resources), "utf8");
	const shell = win32.join(systemRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
	const child = spawn(shell, [
		"-NoLogo",
		"-NoProfile",
		"-NonInteractive",
		"-STA",
		"-EncodedCommand",
		Buffer.from(script, "utf16le").toString("base64")
	], {
		windowsHide: true,
		stdio: [
			"ignore",
			"pipe",
			"pipe"
		],
		env: {
			SystemRoot: systemRoot,
			WINDIR: systemRoot,
			TEMP: process.env.TEMP,
			TMP: process.env.TMP,
			DSH_ASTROLOGY_PET_OWNER: String(process.pid),
			DSH_ASTROLOGY_PET_ASSETS: fileURLToPath(resources)
		}
	});
	child.on("error", (error) => console.warn("Astrology could not start the Windows companion:", error.message));
	child.stdout?.setEncoding("utf8").on("data", (chunk) => {
		if (String(chunk).includes("ASTROLOGY_PET_READY")) console.info("Astrology Windows companion ready");
	});
	child.stderr?.setEncoding("utf8").on("data", (chunk) => console.warn("Astrology Windows companion:", String(chunk).trim()));
	return () => {
		if (child.exitCode === null && child.signalCode === null) child.kill();
	};
}
//#endregion
//#region src/index.ts
const name = "dsh-plugin-astrology";
const inject = [];
function isDesktopAstrologyService(value) {
	return typeof value === "object" && value !== null && "apiVersion" in value && value.apiVersion === 1 && "activate" in value && typeof value.activate === "function";
}
/** Activate native windows and safe routes only while the bundle is loaded. */
function apply(ctx, config) {
	const candidate = ctx.get("desktopAstrology", false);
	if (isDesktopAstrologyService(candidate)) ctx.effect(() => candidate.activate(), "Astrology Desktop capability");
	else if (process.platform === "win32" && (config?.desktopPet === true || process.env.DSH_ASTROLOGY_DESKTOP_PET === "1")) ctx.effect(() => {
		try {
			return launchWindowsPet();
		} catch (error) {
			console.warn("Astrology companion failed to start:", error);
		}
	}, "Astrology Windows companion");
}
//#endregion
export { apply, inject, name };
