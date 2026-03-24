#!/usr/bin/env node

/**
 * Cloudflare Pages Deployment Script - Updated API
 * Deploys the dist folder to dominicstasks.pages.dev
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const ACCOUNT_ID = '13943b867887b7e4d4df7f05cfae9100';
const PROJECT_NAME = 'dominicstasks';
const API_TOKEN = 'snyg2OlbyiNstesI41E7zXyI2jlnhbCDSdny3gAy';

const DIST_DIR = path.join(__dirname, 'dist');

// Get content type
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };
  return types[ext] || 'application/octet-stream';
}

// Make API request
function makeRequest(method, endpoint, data = null, isUpload = false) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4/accounts/${ACCOUNT_ID}${endpoint}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
      }
    };

    if (!isUpload) {
      options.headers['Content-Type'] = 'application/json';
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          if (isUpload) {
            // For uploads, just check status
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ success: true });
            } else {
              reject(new Error(`Upload failed: ${res.statusCode} - ${body}`));
            }
          } else {
            const json = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(json);
            } else {
              reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(json)}`));
            }
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      if (isUpload) {
        data.pipe(req);
      } else {
        req.write(JSON.stringify(data));
      }
    }

    req.end();
  });
}

async function uploadFile(filePath, filename, contentType, uploadURL) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    
    const url = new URL(uploadURL);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': contentType,
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${res.statusCode}`));
      }
    });

    req.on('error', reject);
    fileStream.pipe(req);
  });
}

async function main() {
  try {
    console.log('=== Cloudflare Pages Deployment ===\n');
    console.log(`Project: ${PROJECT_NAME}`);
    console.log(`Account: ${ACCOUNT_ID}\n`);

    // Check if dist folder exists
    if (!fs.existsSync(DIST_DIR)) {
      throw new Error('dist folder not found. Please build the project first.');
    }

    // Get files from dist folder
    const files = {};
    const entries = fs.readdirSync(DIST_DIR, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(DIST_DIR, entry.name);
      if (entry.isFile()) {
        files[entry.name] = {
          path: fullPath,
          contentType: getContentType(entry.name)
        };
      } else if (entry.isDirectory() && entry.name === 'assets') {
        const assetEntries = fs.readdirSync(fullPath, { withFileTypes: true });
        for (const asset of assetEntries) {
          const assetPath = path.join(fullPath, asset.name);
          if (asset.isFile()) {
            files[`assets/${asset.name}`] = {
              path: assetPath,
              contentType: getContentType(asset.name)
            };
          }
        }
      }
    }

    console.log(`Found ${Object.keys(files).length} files to upload\n`);

    // Get upload parameters
    console.log('Getting upload parameters...');
    const uploadParams = await makeRequest('POST', `/pages/projects/${PROJECT_NAME}/upload-params`);
    
    if (!uploadParams.success) {
      throw new Error(`Failed to get upload params: ${JSON.stringify(uploadParams.errors)}`);
    }

    const uploadURL = uploadParams.result.uploadURL;
    const manifest = uploadParams.result.manifest;

    // Upload each file
    console.log('Uploading files...');
    for (const [key, fileData] of Object.entries(files)) {
      console.log(`  Uploading ${key}...`);
      await uploadFile(fileData.path, key, fileData.contentType, uploadURL);
      console.log(`    ✓ ${key}`);
    }

    // Create deployment
    console.log('\nCreating deployment...');
    const deployedAt = new Date().toISOString();
    
    const deployment = await makeRequest('POST', `/pages/projects/${PROJECT_NAME}/deployments`, {
      branch: 'main',
      metadata: {
        changed_slugs: {},
        deployment_trigger: {
          metadata: {
            branch: 'main',
            commit_hash: 'fix-' + Date.now().toString(36)
          },
          type: 'push'
        }
      },
      skipGitOpsSetup: true
    });

    if (!deployment.success) {
      throw new Error(`Failed to create deployment: ${JSON.stringify(deployment.errors)}`);
    }

    console.log('\n=== Deployment Successful ===');
    console.log(`URL: https://${PROJECT_NAME}.pages.dev`);
    console.log(`Environment: production`);
    console.log(`Deployed at: ${deployedAt}`);
    
  } catch (error) {
    console.error('\n=== Deployment Failed ===');
    console.error(error.message);
    process.exit(1);
  }
}

main();
