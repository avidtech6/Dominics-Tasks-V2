#!/usr/bin/env node
/**
 * Universal cross-platform launcher for Dominic's Tasks application
 * Starts Vite dev server, extracts port from stdout, and opens browser
 */

import { spawn } from 'child_process';
import open from 'open';
import http from 'http';

// Configuration
const SERVER_TIMEOUT = 30000; // 30 seconds
const POLL_INTERVAL = 500; // 0.5 seconds
const FALLBACK_PORTS = [5173, 5174, 5175];

/**
 * Wait for the development server to be ready
 * Accept ANY HTTP response as ready (Vite returns 404 until client loads)
 */
function waitForServerReady(port, timeout) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      if (Date.now() - start > timeout) {
        reject(new Error(`Server did not become ready within ${timeout / 1000} seconds`));
        return;
      }

      const req = http.get(`http://localhost:${port}`, () => {
        resolve(); // ANY response means server is up
      });

      req.on('error', () => {
        setTimeout(check, POLL_INTERVAL);
      });

      req.setTimeout(POLL_INTERVAL, () => {
        req.destroy();
        setTimeout(check, POLL_INTERVAL);
      });
    };

    check();
  });
}

/**
 * Extract port from stdout
 */
function extractPortFromLine(line) {
  const match = line.match(/http:\/\/localhost:(\d+)/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Probe fallback ports
 */
async function probeFallbackPorts() {
  for (const port of FALLBACK_PORTS) {
    console.log(`🔍 Probing port ${port}...`);
    const isOpen = await new Promise((resolve) => {
      const req = http.get(`http://localhost:${port}`, () => resolve(true));
      req.on('error', () => resolve(false));
      req.setTimeout(300, () => {
        req.destroy();
        resolve(false);
      });
    });

    if (isOpen) {
      console.log(`✅ Fallback port detected: ${port}`);
      return port;
    }
  }

  return null;
}

/**
 * Main launcher
 */
async function launch() {
  try {
    console.log('🚀 Starting Dominic\'s Tasks development server...');
    console.log('==============================================');
    console.log('🌟 Starting Vite development server...');

    const serverProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true
    });

    let detectedPort = null;

    // Monitor stdout
    serverProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          console.log(`📝 STDOUT: ${line.trim()}`);
          const port = extractPortFromLine(line);
          if (port && !detectedPort) {
            detectedPort = port;
            console.log(`✅ Detected port from stdout: ${port}`);
          }
        }
      }
    });

    // Monitor stderr
    serverProcess.stderr.on('data', (data) => {
      console.error(`❌ STDERR: ${data.toString().trim()}`);
    });

    // Wait 3 seconds for stdout detection
    console.log('⏳ Waiting for port detection...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // If no port detected, probe fallback ports
    if (!detectedPort) {
      console.log('⚠️ No port detected from stdout. Probing fallback ports...');
      detectedPort = await probeFallbackPorts();
    }

    // If still no port, fail
    if (!detectedPort) {
      console.error('❌ Could not detect server port.');
      process.exit(1);
    }

    // Wait for server to be ready
    console.log(`⏳ Waiting for server on port ${detectedPort}...`);
    await waitForServerReady(detectedPort, SERVER_TIMEOUT);

    // Open browser
    console.log(`🌐 Opening browser to http://localhost:${detectedPort}...`);
    // Use platform-specific browser opening
    const { platform } = process;
    if (platform === 'win32') {
      // Windows - use start command
      const { spawn } = await import('child_process');
      spawn('start', ['http://localhost:' + detectedPort], { shell: true });
    } else if (platform === 'darwin') {
      // macOS - use open command
      const { spawn } = await import('child_process');
      spawn('open', ['http://localhost:' + detectedPort]);
    } else {
      // Linux and others - use open package
      await open(`http://localhost:${detectedPort}`);
    }

    console.log('==============================================');
    console.log('🎉 Development server is running!');
    console.log(`📍 URL: http://localhost:${detectedPort}`);
    console.log(`🔗 PID: ${serverProcess.pid}`);
    console.log('Press Ctrl+C to stop the server');

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down...');
      serverProcess.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down...');
      serverProcess.kill('SIGTERM');
      process.exit(0);
    });

  } catch (err) {
    console.error('❌ Launch failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

launch();
