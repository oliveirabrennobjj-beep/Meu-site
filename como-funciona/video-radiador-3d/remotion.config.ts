import fs from "node:fs";
import { Config } from "@remotion/cli/config";

// Na nuvem do Claude usamos o Chromium já instalado; no seu computador o Remotion baixa o dele.
const cloudChrome =
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (fs.existsSync(cloudChrome)) {
  Config.setBrowserExecutable(cloudChrome);
}
Config.setChromiumOpenGlRenderer("swangle");
