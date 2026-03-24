#!/usr/bin/env node

/**
 * Check Cloudflare Pages projects
 */

import https from 'https';

const ACCOUNT_ID = '13943b867887b7e4d4df7f05cfae9100';
const API_TOKEN = 'snyg2OlbyiNstesI41E7zXyI2jlnhbCDSdny3gAy';

function makeRequest(method, endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4/accounts/${ACCOUNT_ID}${endpoint}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          console.log(`Response: ${res.statusCode}`, body);
          const json = JSON.parse(body);
          resolve(json);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    console.log('=== Checking Cloudflare Pages Projects ===\n');
    
    // List projects
    console.log('Listing projects...');
    const result = await makeRequest('GET', '/pages/projects');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
