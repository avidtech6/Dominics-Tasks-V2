#!/usr/bin/env node

/**
 * Cloudflare Pages Deployment Script for v1 Legacy Deployment
 * Deploys the dist folder to dominicstasks-legacy.pages.dev
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration for LEGACY deployment
const ACCOUNT_ID = '13943b867887b7e4d4df7f05cfae9100';
const PROJECT_NAME = 'dominicstasks-legacy';
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

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(json)}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${body}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    
    if (data) {
      if (isUpload) {
        // For file uploads
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    
    req.end();
  });
}

// Check if project exists
async function checkProjectExists() {
  try {
    await makeRequest('GET', `/pages/projects/${PROJECT_NAME}`);
    return true;
  } catch (error) {
    return false;
  }
}

// Create project if it doesn't exist
async function createProject() {
  console.log(`Creating new Pages project: ${PROJECT_NAME}`);
  
  const projectData = {
    name: PROJECT_NAME,
    source: {
      type: 'github',
    },
    deployment_configs: {
      preview: {
        environment_variables: [],
      },
      production: {
        environment_variables: [],
      }
    }
  };
  
  try {
    await makeRequest('POST', '/pages/projects', projectData);
    console.log('Project created successfully');
  } catch (error) {
    // If creation fails, it might already exist
    console.log('Note: Project may already exist, continuing with deployment...');
  }
}

// Upload a single file
async function uploadFile(filePath, fileName) {
  const fileContent = fs.readFileSync(filePath);
  const mimetype = getContentType(fileName);
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4/accounts/${ACCOUNT_ID}/pages/assets/upload`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': mimetype,
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode === 200) {
            resolve({ fileName, hash: json.hash });
          } else {
            reject(new Error(`Upload failed: ${body}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(fileContent);
    req.end();
  });
}

// Get upload URL from Cloudflare
async function getUploadURL() {
  const response = await makeRequest('POST', '/pages/assets/upload');
  return response.uploadURL;
}

// Main deployment function
async function deploy() {
  console.log('='.repeat(50));
  console.log('DOMINICS TASKS - v1 LEGACY DEPLOYMENT');
  console.log('='.repeat(50));
  console.log(`\nProject: ${PROJECT_NAME}`);
  console.log(`URL: https://${PROJECT_NAME}.pages.dev\n`);

  // Verify dist folder exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('Error: dist folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Check project exists
  const exists = await checkProjectExists();
  if (!exists) {
    await createProject();
  }

  // Get all files in dist
  const files = [];
  function traverseDir(dir, prefix = '') {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const relativePath = path.join(prefix, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        traverseDir(fullPath, relativePath);
      } else {
        files.push({
          path: fullPath,
          name: relativePath,
          size: fs.statSync(fullPath).size
        });
      }
    }
  }
  traverseDir(DIST_DIR);

  console.log(`Found ${files.length} files to upload\n`);

  // Upload files in parallel (batch of 10)
  const uploaded = [];
  const batchSize = 10;
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    console.log(`Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(files.length / batchSize)}...`);
    
    try {
      const results = await Promise.all(
        batch.map(f => uploadFile(f.path, f.name))
      );
      uploaded.push(...results);
    } catch (error) {
      console.error(`Batch upload failed: ${error.message}`);
      process.exit(1);
    }
  }

  console.log(`\nUploaded ${uploaded.length} files successfully!`);

  // Create deployment
  console.log('\nCreating deployment...');
  
  const manifest = {};
  for (const file of uploaded) {
    manifest[file.fileName] = { hash: file.hash };
  }

  const deploymentData = {
    manifest: manifest,
    branches: ['legacy-v1'],
    metadata: {
      deployment_id: `v1-legacy-${Date.now()}`,
      version: '1.0.0-legacy'
    }
  };

  try {
    const response = await makeRequest(
      'POST', 
      `/pages/projects/${PROJECT_NAME}/deployments`, 
      deploymentData
    );
    
    console.log('\n' + '='.repeat(50));
    console.log('DEPLOYMENT SUCCESSFUL!');
    console.log('='.repeat(50));
    console.log(`\nURL: https://${PROJECT_NAME}.pages.dev`);
    console.log(`Deployment ID: ${response.uid}`);
    console.log(`Created at: ${new Date(response.created_at).toLocaleString()}`);
    console.log('\nNote: It may take 1-2 minutes for the URL to become available.');
    
    // Save deployment info
    fs.writeFileSync(
      'deploy_legacy_info.json',
      JSON.stringify({
        project: PROJECT_NAME,
        url: `https://${PROJECT_NAME}.pages.dev`,
        deploymentId: response.uid,
        createdAt: response.created_at,
        timestamp: new Date().toISOString()
      }, null, 2)
    );
    console.log('\nDeployment info saved to deploy_legacy_info.json');
    
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
