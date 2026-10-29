import fs from 'fs';
import path from 'path';

const RESULTS_ROOT = path.resolve(process.cwd(), 'test-results');
const artifactMap = new Map();

function sanitizeTestName(title) {
  return String(title || 'unnamed-test')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unnamed-test';
}

function removePathIfExists(targetPath) {
  if (!targetPath || !fs.existsSync(targetPath)) {
    return;
  }

  const stat = fs.lstatSync(targetPath);
  if (stat.isDirectory()) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  } else {
    fs.rmSync(targetPath, { force: true });
  }
}

function resetTestArtifacts(testName) {
  const protectedDirs = new Set([
    'logs',
    'Screenshots',
    'Video',
    'Trace',
  ]);

  const logPath = path.join(RESULTS_ROOT, 'logs', `${testName}.log`);
  const screenshotDir = path.join(RESULTS_ROOT, 'Screenshots', testName);
  const videoPath = path.join(RESULTS_ROOT, 'Video', `${testName}.webm`);
  const tracePath = path.join(RESULTS_ROOT, 'Trace', `${testName}.zip`);

  removePathIfExists(logPath);
  removePathIfExists(screenshotDir);
  removePathIfExists(videoPath);
  removePathIfExists(tracePath);

  if (fs.existsSync(RESULTS_ROOT)) {
    for (const entry of fs.readdirSync(RESULTS_ROOT, { withFileTypes: true })) {
      const candidate = path.join(RESULTS_ROOT, entry.name);
      const isProtected = entry.isDirectory() && protectedDirs.has(entry.name);
      const matchesCurrentTest = entry.name.toLowerCase().includes(testName.toLowerCase()) || entry.name.includes(testName);

      if (!isProtected && (matchesCurrentTest || entry.name === '.last-run.json' || entry.name.startsWith('ui-') || entry.name.startsWith('api-') || entry.name.startsWith('chromium-') || entry.name.startsWith('webkit-') || entry.name.startsWith('firefox-'))) {
        removePathIfExists(candidate);
      }
    }
  }

  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.mkdirSync(screenshotDir, { recursive: true });
  fs.mkdirSync(path.join(RESULTS_ROOT, 'Video'), { recursive: true });
  fs.mkdirSync(path.join(RESULTS_ROOT, 'Trace'), { recursive: true });
}

export function getArtifactsForTest(testInfo) {
  return artifactMap.get(testInfo.testId);
}

export async function setupArtifactsForTest(page, context, testInfo) {
  const testName = sanitizeTestName(testInfo.title);
  resetTestArtifacts(testName);

  const logPath = path.join(RESULTS_ROOT, 'logs', `${testName}.log`);
  const screenshotDir = path.join(RESULTS_ROOT, 'Screenshots', testName);

  const writeLog = (message) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
  };

  const captureScreenshot = async (label = 'step') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeLabel = String(label || 'step')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'step';
    const filePath = path.join(
      screenshotDir,
      `${testName}_${timestamp}_${safeLabel}.png`
    );
    await page.screenshot({ path: filePath, fullPage: false });
    writeLog(`Screenshot saved: ${filePath}`);
    return filePath;
  };

  const artifacts = {
    testName,
    logPath,
    screenshotDir,
    writeLog,
    captureScreenshot,
    captureStep: captureScreenshot,
  };

  artifactMap.set(testInfo.testId, artifacts);

  writeLog(`Starting test: ${testInfo.title}`);

  page.on('console', (msg) => {
    writeLog(`console:${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', (error) => {
    writeLog(`pageerror: ${error.message}`);
  });

  page.on('requestfailed', (request) => {
    writeLog(`requestfailed: ${request.url()} :: ${request.failure()?.errorText || 'Unknown error'}`);
  });

  if (!context.__traceStarted) {
    context.__traceStarted = true;
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  }

  return artifacts;
}

export async function finalizeArtifactsForTest(page, context, testInfo) {
  const artifacts = getArtifactsForTest(testInfo);
  if (!artifacts) {
    return;
  }

  const videoDir = path.join(RESULTS_ROOT, 'Video');
  const traceDir = path.join(RESULTS_ROOT, 'Trace');
  fs.mkdirSync(videoDir, { recursive: true });
  fs.mkdirSync(traceDir, { recursive: true });

  try {
    const video = page.video ? page.video() : null;
    if (video) {
      const videoPath = await video.path().catch(() => null);
      if (videoPath && fs.existsSync(videoPath)) {
        const destination = path.join(videoDir, `${artifacts.testName}.webm`);
        removePathIfExists(destination);
        fs.copyFileSync(videoPath, destination);
        artifacts.writeLog(`Saved video: ${destination}`);
      }
    }
  } catch (error) {
    artifacts.writeLog(`Video capture error: ${error.message}`);
  }

  try {
    if (context.__traceStarted) {
      const tracePath = path.join(traceDir, `${artifacts.testName}.zip`);
      removePathIfExists(tracePath);
      await context.tracing.stop({ path: tracePath });
      context.__traceStarted = false;
      artifacts.writeLog(`Saved trace: ${tracePath}`);
    }
  } catch (error) {
    artifacts.writeLog(`Trace save error: ${error.message}`);
  }

  artifacts.writeLog(`Completed test: ${testInfo.title}`);
}
