#!/usr/bin/env node
/**
 * EcoCircuit / Green Loop — Automated Git Development-to-Production Sync Engine
 * 
 * Watches local project file modifications, debounces rapid edits,
 * stages non-sensitive files safely, generates descriptive commits,
 * and pushes to 'origin main' to trigger Vercel production deployments.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Configuration
const DEBOUNCE_MS = 5000; // 5-second silence period before committing
const TARGET_BRANCH = 'main';

// Patterns to ignore during watch & pre-commit safety check
const IGNORED_PATH_PATTERNS = [
  /(^|[\\/])\.git([\\/]|$)/i,
  /(^|[\\/])node_modules([\\/]|$)/i,
  /(^|[\\/])dist([\\/]|$)/i,
  /(^|[\\/])build([\\/]|$)/i,
  /(^|[\\/])\.dart_tool([\\/]|$)/i,
  /(^|[\\/])\.pub-cache([\\/]|$)/i,
  /(^|[\\/])logs([\\/]|$)/i,
  /\.log$/i,
  /\.tmp$/i,
  /(^|[\\/])\.env(\.|$)/i,
  /\.local$/i,
  /\.(pem|key|cert|secret)$/i
];

const SENSITIVE_STAGED_PATTERNS = [
  /^\.env/i,
  /[\\/]\.env/i,
  /\.local$/i,
  /\.(pem|key|cert|secret)$/i,
  /id_rsa/i
];

let debounceTimer = null;
let isSyncing = false;
let pendingChanges = new Set();

function log(prefix, msg) {
  const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
  console.log(`[${ts}] [${prefix}] ${msg}`);
}

function runGit(cmd, options = {}) {
  try {
    return execSync(`git ${cmd}`, {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    }).trim();
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString().trim() : err.message;
    throw new Error(stderr || err.message);
  }
}

/**
 * Validates current repository configuration and remote setup
 */
function validateRepository() {
  log('INIT', 'Checking Git repository state...');

  try {
    const isInside = runGit('rev-parse --is-inside-work-tree');
    if (isInside !== 'true') throw new Error('Not inside a Git work tree');
  } catch (e) {
    console.error('❌ Error: Current directory is not a valid Git repository.');
    process.exit(1);
  }

  let remoteUrl = '';
  try {
    remoteUrl = runGit('config --get remote.origin.url');
    log('INIT', `Remote origin: ${remoteUrl}`);
  } catch (e) {
    console.warn('⚠️ Notice: No remote named "origin" configured. Auto-sync is currently in detached/local mode.');
    console.warn('👉 Connect your new independent Git remote to resume automated push-to-deploy.');
    process.exit(0);
  }

  if (remoteUrl.includes('mathavanwork18-tech/sample')) {
    console.error('🚨 DANGER: Remote origin still points to the original project repository!');
    console.error('🚨 Push aborted to protect original repository. Update git remote origin first.');
    process.exit(1);
  }

  let branch = '';
  try {
    branch = runGit('rev-parse --abbrev-ref HEAD');
  } catch (e) {
    branch = 'main';
  }
  log('INIT', `Current branch: ${branch}`);

  if (branch !== TARGET_BRANCH) {
    log('WARN', `Current branch is '${branch}', expected '${TARGET_BRANCH}'.`);
  }
}

/**
 * Checks if a relative or absolute path should be ignored
 */
function isIgnored(filepath) {
  return IGNORED_PATH_PATTERNS.some((pattern) => pattern.test(filepath));
}

/**
 * Executes safety verification on staged files.
 * If any sensitive file (.env, secrets, keys) is staged, unstage all and abort.
 */
function verifyStagedSafety() {
  const stagedFiles = runGit('diff --name-only --cached')
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);

  const sensitiveFiles = stagedFiles.filter((file) => {
    // Allow example templates
    if (file.endsWith('.env.example') || file.endsWith('.env.sample')) return false;
    return SENSITIVE_STAGED_PATTERNS.some((pattern) => pattern.test(file));
  });

  if (sensitiveFiles.length > 0) {
    log('ALERT', `🚨 DANGER: Sensitive files detected in staging area: ${sensitiveFiles.join(', ')}`);
    runGit('reset');
    throw new Error(`Aborted commit due to sensitive files: ${sensitiveFiles.join(', ')}`);
  }

  return stagedFiles;
}

/**
 * Generates an informative commit message summarizing changed files
 */
function generateCommitMessage(stagedFiles) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  if (stagedFiles.length === 1) {
    return `auto: update ${stagedFiles[0]} (${ts})`;
  } else if (stagedFiles.length <= 4) {
    return `auto: update ${stagedFiles.join(', ')} (${ts})`;
  } else {
    const preview = stagedFiles.slice(0, 3).join(', ');
    return `auto: update ${stagedFiles.length} files (${preview}, ...) (${ts})`;
  }
}

/**
 * Stages changes, creates a commit, and pushes to origin main
 */
async function performSync() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    // Check if there are changes
    const status = runGit('status --porcelain');
    if (!status) {
      log('SYNC', 'Working tree is clean. Nothing to commit.');
      pendingChanges.clear();
      isSyncing = false;
      return;
    }

    log('SYNC', 'Staging changes with git add -A...');
    runGit('add -A');

    // Run pre-commit safety check
    const stagedFiles = verifyStagedSafety();
    if (stagedFiles.length === 0) {
      log('SYNC', 'No staged changes after safety filters.');
      isSyncing = false;
      return;
    }

    // Create commit
    const commitMsg = generateCommitMessage(stagedFiles);
    log('COMMIT', `Committing: "${commitMsg}"`);
    runGit(`commit -m "${commitMsg.replace(/"/g, '\\"')}"`);

    const commitSha = runGit('rev-parse --short HEAD');
    log('COMMIT', `Created commit ${commitSha}`);

    // Push to remote
    log('PUSH', `Pushing to origin ${TARGET_BRANCH}...`);
    runGit(`push origin ${TARGET_BRANCH}`);
    log('SUCCESS', `Successfully pushed commit ${commitSha} to origin/${TARGET_BRANCH}`);
    log('SUCCESS', '🚀 Vercel will now build and deploy the update automatically.');
    pendingChanges.clear();
  } catch (err) {
    log('ERROR', `Sync failed: ${err.message}`);
  } finally {
    isSyncing = false;
  }
}

/**
 * Debounces incoming file modification events
 */
function queueSync(filename) {
  if (filename && isIgnored(filename)) return;

  if (filename) pendingChanges.add(filename);

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  log('WATCH', `Change detected in ${filename || 'project'}. Waiting ${DEBOUNCE_MS / 1000}s for quiet period...`);

  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    performSync();
  }, DEBOUNCE_MS);
}

/**
 * Starts watching project files
 */
function startWatcher() {
  validateRepository();

  log('START', `Watching for file modifications in ${ROOT_DIR}`);
  log('START', `Debounce delay: ${DEBOUNCE_MS}ms | Target: origin ${TARGET_BRANCH}`);

  // Watch directories
  try {
    fs.watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      if (isIgnored(filename)) return;
      queueSync(filename);
    });
  } catch (err) {
    console.error(`Watcher failed to initialize: ${err.message}`);
    process.exit(1);
  }

  // Handle graceful exit
  const shutdown = () => {
    log('SHUTDOWN', 'Stopping auto-sync watcher...');
    if (debounceTimer) clearTimeout(debounceTimer);
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--once')) {
  validateRepository();
  performSync();
} else {
  startWatcher();
}
