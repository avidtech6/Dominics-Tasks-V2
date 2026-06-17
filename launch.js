#!/usr/bin/env node
/**
 * Universal cross-platform launcher for Dominic's Tasks application
 * Starts Vite dev server, extracts port from stdout, and opens browser
 */

import { spawn } from 'child_process';
import open from 'open';
import http from 'http';
import { exec } from 'child_process';

// Configuration
const SERVER_TIMEOUT = 45000; // 45 seconds
const POLL_INTERVAL = 300; // 0.3 seconds
const FALLBACK_PORTS = [5176, 5174, 5173, 5175, 5177, 5178, 5179];

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

      const req = http.get(`http://localhost:${port}`, (res) => {
        // Vite returns 404 until the client loads, but that's okay
        // Any response means the server is listening
        resolve();
      });

      req.on('error', (err) => {
        // Connection refused means server isn't up yet
        if (err.code === 'ECONNREFUSED') {
          setTimeout(check, POLL_INTERVAL);
        } else {
          // Other errors might indicate server is up but client not ready
          resolve();
        }
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
  // Look for various patterns that might contain the port
  const patterns = [
    /➜\s+Local:\s+http:\/\/localhost:(\d+)/,
    /Local:\s+http:\/\/localhost:(\d+)/,
    /Network:\s+http:\/\/localhost:(\d+)/,
    /Dominic's Tasks.*?http:\/\/localhost:(\d+)/,
    /Development server.*?http:\/\/localhost:(\d+)/,
    /Vite.*?http:\/\/localhost:(\d+)/,
    /Local:\s+http:\/\/127\.0\.0\.1:(\d+)/,
    /Network:\s+http:\/\/127\.0\.0\.1:(\d+)/,
    /http:\/\/localhost:(\d+)/,
    /port\s+(\d+)/,
    /:(\d+)\//
  ];
  
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      const port = parseInt(match[1]);
      if (port >= 1024 && port <= 65535) { // Valid port range
        console.log(`🎯 Port detected using pattern: ${pattern.source}`);
        return port;
      }
    }
  }
  
  return null;
}

/**
 * Probe fallback ports
 */
async function killProcessesOnPort(port) {
  return new Promise((resolve) => {
    const command = process.platform === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -ti:${port}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error || !stdout) {
        console.log(`🔍 No processes found on port ${port}`);
        resolve();
        return;
      }
      
      const pids = process.platform === 'win32'
        ? stdout.trim().split('\n').map(line => line.trim().split(/\s+/).pop()).filter(pid => pid)
        : stdout.trim().split('\n').filter(pid => pid);
      
      if (pids.length === 0) {
        console.log(`🔍 No processes found on port ${port}`);
        resolve();
        return;
      }
      
      console.log(`🗑️  Found ${pids.length} process(es) on port ${port}: ${pids.join(', ')}`);
      
      pids.forEach(pid => {
        const killCommand = process.platform === 'win32'
          ? `taskkill /F /PID ${pid}`
          : `kill -9 ${pid}`;
        
        exec(killCommand, (killError) => {
          if (killError) {
            console.log(`⚠️  Failed to kill process ${pid}: ${killError.message}`);
          } else {
            console.log(`✅ Successfully killed process ${pid}`);
          }
        });
      });
      
      // Give processes time to terminate
      setTimeout(resolve, 1000);
    });
  });
}

async function probeFallbackPorts() {
  console.log('🔍 Probing fallback ports for existing dev servers...');
  
  // First, try to kill any existing processes on fallback ports
  for (const port of FALLBACK_PORTS) {
    await killProcessesOnPort(port);
  }
  
  // Wait a moment for processes to fully terminate
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Now check if any ports are still in use
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

    // Wait 5 seconds for stdout detection
    console.log('⏳ Waiting for port detection...');
    console.log('   (This allows Vite time to start and display the port information)');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // If no port detected, probe fallback ports
    if (!detectedPort) {
      console.log('⚠️ No port detected from stdout. Probing fallback ports...');
      detectedPort = await probeFallbackPorts();
      
      // If still no port found, probe a broader range of ports
      if (!detectedPort) {
        console.log('🔍 Probing broader port range (5180-5190)...');
        for (let port = 5180; port <= 5190; port++) {
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
            console.log(`✅ Found server on port ${port}`);
            detectedPort = port;
            break;
          }
        }
      }
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
