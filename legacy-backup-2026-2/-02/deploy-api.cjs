#!/usr/bin/env node

/**
 * Cloudflare Pages Deployment Script
 * Deploys the dist folder to dominicstasks.pages.dev using the Cloudflare API
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const ACCOUNT_ID = '13943b867887b7e4d4df7f05cfae9100';
const PROJECT_NAME = 'dominicstasks';
const PROJECT_ID = 'd5a8fca7-dd27-41fd-8792-d6262ce0d8a4';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || 'snyg2OlbyiNstesI41E7zXyI2jlnhbCDSdny3gAy';

const DIST_DIR = path.join(__dirname, 'dist');

// Create a mapping of files for the deployment
function createFileMap(dir, prefix = '') {
  const files = {};
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const key = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      Object.assign(files, createFileMap(fullPath, key));
    } else if (entry.isFile()) {
      files[key] = {
        file: fs.readFileSync(fullPath),
        contentType: getContentType(entry.name)
      };
    }
  }

  return files;
}

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
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
  };
  return types[ext] || 'application/octet-stream';
}

// Create metadata for the deployment
function createMetadata(files) {
  const metadata = {
    bundling: {
      config: {
        commands: [],
        environment: {}
      }
    }
  };

  // Create manifest of files
  const manifest = {};
  for (const [key, value] of Object.entries(files)) {
    manifest[key] = {
      size: value.file.length,
      hashes: {}
    };
  }

  metadata.manifest = manifest;
  return metadata;
}

// Make API request
function makeRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4/accounts/${ACCOUNT_ID}${endpoint}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(json)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function uploadFilesToR2(files) {
  // First, we need to upload files to R2 storage (Cloudflare's asset storage)
  // This is done by creating a direct upload session
  
  console.log('Creating direct upload session...');
  
  const response = await makeRequest('POST', `/pages/projects/${PROJECT_NAME}/upload-params`, {
    filename: 'deployment'
  });

  if (!response.success) {
    throw new Error(`Failed to get upload params: ${JSON.stringify(response.errors)}`);
  }

  console.log('Got upload session parameters');
  
  // Upload each file
  const uploadUrl = response.result.uploadURL;
  const manifest = response.result.manifest;

  for (const [key, value] of Object.entries(files)) {
    console.log(`Uploading ${key}...`);
    
    const fileData = value.file;
    
    const uploadOptions = {
      hostname: new URL(uploadUrl).hostname,
      port: 443,
      path: new URL(uploadUrl).pathname,
      method: 'POST',
      headers: {
        'Content-Type': value.contentType,
        'Tus-Resumable': 'true',
        'Upload-Length': fileData.length.toString(),
        'Upload-Metadata': `manifest ${manifest[key]}`
      }
    };

    await new Promise((resolve, reject) => {
      const req = https.request(uploadOptions, (res) => {
        if (res.statusCode === 204 || res.statusCode === 201) {
          console.log(`✓ Uploaded ${key}`);
          resolve();
        } else {
          reject(new Error(`Upload failed for ${key}: ${res.statusCode}`));
        }
      });
      req.on('error', reject);
      req.write(fileData);
      req.end();
    });
  }

  return manifest;
}

async function createDeployment(manifest) {
  console.log('\nCreating deployment...');
  
  const response = await makeRequest('POST', `/pages/projects/${PROJECT_NAME}/deployments`, {
    branch: 'main',
    metadata: {
      changed_slugs: {},
      creation_step: {
        kind: 'upload',
        mode: 'build_failed',
        uploaded_assets: Object.keys(manifest)
      },
      deployment_trigger: {
        metadata: {
          branch: 'main',
          commit_hash: 'api-deployment'
        },
        type: 'push'
      }
    },
    skipGitOpsSetup: true
  });

  if (!response.success) {
    throw new Error(`Failed to create deployment: ${JSON.stringify(response.errors)}`);
  }

  return response.result;
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
    console.log('Preparing files from dist folder...');
    const files = createFileMap(DIST_DIR);
    console.log(`Found ${Object.keys(files).length} files\n`);

    // Upload files
    const manifest = await uploadFilesToR2(files);

    // Create deployment
    const deployment = await createDeployment(manifest);

    console.log('\n=== Deployment Successful ===');
    console.log(`URL: https://${PROJECT_NAME}.pages.dev`);
    console.log(`Project: ${PROJECT_NAME}`);
    console.log(`Environment: production`);
    
    // Wait for deployment to be ready
    console.log('\nWaiting for deployment to be ready...');
    await waitForDeployment(deployment.id);

  } catch (error) {
    console.error('\n=== Deployment Failed ===');
    console.error(error.message);
    process.exit(1);
  }
}

async function waitForDeployment(deploymentId, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await makeRequest('GET', `/pages/projects/${PROJECT_NAME}/deployments/${deploymentId}`);
    
    if (response.success && response.result) {
      const deployment = response.result;
      const status = deployment.latest_stage?.status || deployment.status;
      
      console.log(`Deployment status: ${status}`);
      
      if (status === 'success') {
        console.log('\n✓ Deployment is live!');
        return true;
      } else if (status === 'failed' || status === 'canceled') {
        throw new Error(`Deployment ${status}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  throw new Error('Deployment verification timed out');
}

main();
