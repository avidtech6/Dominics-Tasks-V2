#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const ACCOUNT_ID = '13943b867887b7e4d4df7f05cfae9100';
const API_TOKEN = 'snyg2OlbyiNstesI41E7zXyI2jlnhbCDSdny3gAy';
const PROJECT_NAME = 'dominics-tasks';

async function uploadToCloudflare() {
  const distPath = './dist';
  
  console.log('Creating deployment...');
  
  // Step 1: Create deployment
  const createResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        branch: 'main',
        skipContentIfHashNotMatched: false,
      }),
    }
  );
  
  const createData = await createResponse.json();
  
  if (!createData.success) {
    console.error('Failed to create deployment:', createData);
    process.exit(1);
  }
  
  const deployment = createData.result;
  console.log('Deployment created:', deployment.id);
  
  // Step 2: Upload files
  const files = getAllFiles(distPath);
  console.log(`Uploading ${files.length} files...`);
  
  for (const file of files) {
    const relativePath = path.relative(distPath, file);
    const content = fs.readFileSync(file);
    
    console.log(`Uploading ${relativePath} (${content.length} bytes)...`);
    
    const uploadResponse = await fetch(deployment.urls[relativePath], {
      method: 'PUT',
      headers: {
        'Content-Type': getContentType(relativePath),
      },
      body: content,
    });
    
    if (!uploadResponse.ok) {
      console.error(`Failed to upload ${relativePath}:`, uploadResponse.status);
      process.exit(1);
    }
    
    console.log(`✓ Uploaded ${relativePath}`);
  }
  
  console.log('All files uploaded successfully!');
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });
  
  return arrayOfFiles;
}

function getContentType(filename) {
  if (filename.endsWith('.html')) return 'text/html';
  if (filename.endsWith('.css')) return 'text/css';
  if (filename.endsWith('.js')) return 'application/javascript';
  if (filename.endsWith('.json')) return 'application/json';
  if (filename.endsWith('.png')) return 'image/png';
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
  if (filename.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

uploadToCloudflare().catch(console.error);
