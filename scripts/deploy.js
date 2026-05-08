#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEPLOY = path.join(ROOT, 'deploy');

console.log('Packaging for cPanel deployment...\n');

// Clean deploy directory
if (fs.existsSync(DEPLOY)) {
  fs.rmSync(DEPLOY, { recursive: true });
}

// Create deploy structure
const dirs = [
  'deploy/public_html',
  'deploy/public_html/api/app/Controllers',
  'deploy/public_html/api/app/Core',
  'deploy/public_html/api/app/Helpers',
  'deploy/public_html/api/app/Middleware',
  'deploy/public_html/api/app/Models',
  'deploy/public_html/api/config',
  'deploy/public_html/api/public',
  'deploy/public_html/api/routes',
  'deploy/public_html/api/uploads/requests',
  'deploy/public_html/api/uploads/campaigns',
  'deploy/database',
];

dirs.forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

// Copy backend files
const backendSrc = path.join(ROOT, 'backend');
const backendDirs = [
  'app/Controllers',
  'app/Core',
  'app/Helpers',
  'app/Middleware',
  'app/Models',
  'public',
  'routes',
  'uploads',
];

backendDirs.forEach((dir) => {
  const srcDir = path.join(backendSrc, dir);
  const destDir = path.join(DEPLOY, 'public_html/api', dir);
  if (fs.existsSync(srcDir)) {
    copyDirRecursive(srcDir, destDir);
  }
});

// Copy composer.json and .env.example
copyFile(path.join(backendSrc, 'composer.json'), path.join(DEPLOY, 'public_html/api/composer.json'));
copyFile(path.join(backendSrc, '.env.example'), path.join(DEPLOY, 'public_html/api/.env'));
copyFile(path.join(backendSrc, '.htaccess'), path.join(DEPLOY, 'public_html/api/.htaccess'));

// Copy .env for production (user needs to edit this)
const envContent = `APP_ENV=production
APP_DEBUG=false
APP_URL=https://anns.com.gracelandroyalacademy.com.ng

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

JWT_SECRET=change_this_to_a_secure_random_string_32chars
JWT_EXPIRATION=86400

MAIL_HOST=smtp.your-provider.com
MAIL_PORT=587
MAIL_USERNAME=your_email@domain.com
MAIL_PASSWORD=your_email_password
MAIL_FROM_ADDRESS=noreply@gracelandroyalacademy.com.ng
MAIL_FROM_NAME=CampusFund

PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx

UPLOAD_MAX_SIZE=5242880
UPLOAD_PATH=uploads
ALLOWED_TYPES=jpg,jpeg,png,pdf
`;
fs.writeFileSync(path.join(DEPLOY, 'public_html/api/.env'), envContent);

// Copy frontend build output
const distDir = path.join(ROOT, 'frontend/dist');
if (fs.existsSync(distDir)) {
  copyDirRecursive(distDir, path.join(DEPLOY, 'public_html'));
  console.log('✓ Frontend build copied');
} else {
  console.log('✗ Frontend build not found. Run "npm run build" in frontend/ first.');
}

// Copy root .htaccess
copyFile(path.join(ROOT, 'public_html/.htaccess'), path.join(DEPLOY, 'public_html/.htaccess'));

// Copy database
copyFile(path.join(ROOT, 'database/campus_fund.sql'), path.join(DEPLOY, 'database/campus_fund.sql'));

// Copy deployment guide
copyFile(path.join(ROOT, 'DEPLOYMENT.md'), path.join(DEPLOY, 'DEPLOYMENT.md'));

// Create .gitkeep files for uploads
fs.writeFileSync(path.join(DEPLOY, 'public_html/api/uploads/.gitkeep'), '');
fs.writeFileSync(path.join(DEPLOY, 'public_html/api/uploads/requests/.gitkeep'), '');
fs.writeFileSync(path.join(DEPLOY, 'public_html/api/uploads/campaigns/.gitkeep'), '');

console.log('\n✓ Deployment package ready in: deploy/');
console.log('\nNext steps:');
console.log('1. Edit deploy/public_html/api/.env with your credentials');
console.log('2. Upload deploy/public_html/ contents to your cPanel public_html/');
console.log('3. Import deploy/database/campus_fund.sql into MySQL');
console.log('4. Run composer install in deploy/public_html/api/ (or upload vendor/)');
console.log('5. Set folder permissions (uploads/ = 755)');
console.log('\nSee DEPLOYMENT.md for detailed instructions.');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}
