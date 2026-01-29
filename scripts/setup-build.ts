import { execSync, ExecSyncOptionsWithStringEncoding } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const CHROMIUM_DIR = path.resolve(process.cwd(), "src");
const PATCHES_DIR = path.resolve(process.cwd(), "patches");

interface StepConfig {
  name: string;
  fn: () => void;
}

function log(message: string, type: "info" | "error" | "success" = "info") {
  const prefix = {
    info: "[INFO]",
    error: "[ERROR]",
    success: "[SUCCESS]",
  }[type];
  console.log(`${prefix} ${message}`);
}

function exec(
  command: string,
  cwd: string = process.cwd(),
  options: Partial<ExecSyncOptionsWithStringEncoding> = {}
) {
  try {
    return execSync(command, {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "inherit", "inherit"],
      ...options,
    }).trim();
  } catch (err: any) {
    const message = err.stderr?.toString() || err.message || String(err);
    throw new Error(
      `Command ${command} failed with a non-zero exit code:\n${message}`
    );
  }
}

function checkChromiumExists(): boolean {
  return fs.existsSync(CHROMIUM_DIR);
}

function downloadChromium() {
  log("Downloading Chromium source code...");

  if (checkChromiumExists()) {
    log("Chromium source code already exists. Skipping download.", "info");
    return;
  }

  exec("fetch --nohooks chromium", process.cwd(), {
    stdio: ["pipe", "pipe", "inherit"],
  });
  log("Chromium source code downloaded successfully.", "success");
}

function checkoutVersion(): void {
  log("Fetching latest chromium main branch...");

  try {
    exec("git fetch origin main", CHROMIUM_DIR);
    exec("git checkout origin/main", CHROMIUM_DIR);

    const commit = exec("git rev-parse --short HEAD", CHROMIUM_DIR);
    log(`Checked out Chromium at commit ${commit}`, "success");
  } catch (err) {
    log(`Failed to checkout Chromium version: ${err}`, "error");
    throw err;
  }
}

function applyPatches() {
  log("Applying patches to Chromium source code...");

  if (!checkChromiumExists()) {
    log("Chromium source code does not exist. Cannot apply patches.", "error");
    throw new Error("Chromium source code not found.");
  }

  if (!fs.existsSync(PATCHES_DIR)) {
    log("No patches directory found. Skipping patch application.", "info");
    return;
  }

  const patches = fs
    .readdirSync(PATCHES_DIR)
    .filter((file) => file.endsWith(".patch"))
    .sort();
  if (patches.length === 0) {
    log("No patch files found. Skipping patch application.", "info");
    return;
  }

  log(`Found ${patches.length} patch(es). Applying...`);

  for (const patch of patches) {
    const patchPath = path.resolve(PATCHES_DIR, patch);
    try {
      log(`Applying patch: ${patch}`);
      exec(`git apply "${patchPath}"`, CHROMIUM_DIR);
      log(`Successfully applied patch: ${patch}`, "success");
    } catch (err) {
      log(
        `Failed to apply patch ${patch}. This might mean that the patch is incompatible with this chromium version.\n${err}`,
        "error"
      );
      throw err;
    }
  }

  log("All patches applied successfully.", "success");
}

function validateSetup() {
  log("Validating Chromium setup...");

  if (!checkChromiumExists()) {
    log("Chromium source code does not exist. Validation failed.", "error");
    throw new Error("Chromium source code not found.");
  }

  const gitDir = path.join(CHROMIUM_DIR, ".git");
  if (!fs.existsSync(gitDir)) {
    log(
      "Chromium directory is not a valid git repository. Validation failed.",
      "error"
    );
    throw new Error("Invalid Chromium git repository.");
  }

  log("Chromium setup validated successfully.", "success");
}

async function main() {
  console.log("\nSetting up chromium browser");

  const steps: StepConfig[] = [
    { name: "Download Chromium", fn: downloadChromium },
    { name: "Checkout Version", fn: checkoutVersion },
    { name: "Apply Patches", fn: applyPatches },
    { name: "Validate Setup", fn: validateSetup },
  ];

  for (const step of steps) {
    log(`Starting step: ${step.name}`);
    try {
      step.fn();
      log(`Completed step: ${step.name}`, "success");
    } catch (err) {
      log(`Step failed: ${step.name}\n${err}`, "error");
      process.exit(1);
    }
  }

  console.log("\nChromium browser setup completed successfully!");
  console.log(
    "You can now proceed with building or using the patched Chromium browser.\n"
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    log(`Setup failed: ${err}`, "error");
    process.exit(1);
  });
}

export { downloadChromium, checkoutVersion, applyPatches, validateSetup };
