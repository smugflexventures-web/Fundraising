# cPanel Deployment Guide — CampusFund

## Domain: anns.com.gracelandroyalacademy.com.ng

---

### Step 1: Build the Frontend

```bash
cd frontend
npm install
npm run build
```

This generates the `dist/` folder with production-ready files.

---

### Step 2: Create MySQL Database in cPanel

1. Log into cPanel → **MySQL Databases**
2. Create a new database: `campus_fund`
3. Create a MySQL user with a strong password
4. Add the user to the database with **ALL PRIVILEGES**
5. Open **phpMyAdmin** → Select the database → **Import** → Upload `database/campus_fund.sql`

---

### Step 3: Upload Files to cPanel

Using **File Manager** or **FTP/SFTP**:

Upload the following to `public_html/` (or your subdomain document root):

```
public_html/
├── api/                    ← Backend (rename "backend" folder to "api")
│   ├── app/
│   ├── config/
│   ├── public/
│   │   └── index.php
│   ├── routes/
│   ├── uploads/
│   ├── vendor/             ← Run composer install locally or on server
│   ├── .env                ← Configure for production
│   ├── .htaccess
│   └── composer.json
├── assets/                 ← Frontend build assets
├── index.html              ← Frontend build index
├── vite.svg
└── .htaccess               ← Root .htaccess (routing)
```

**Important**: Copy all files from `frontend/dist/` to `public_html/`
**Important**: Copy the entire `backend/` folder contents to `public_html/api/`

---

### Step 4: Configure Backend .env

Edit `public_html/api/.env`:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://anns.com.gracelandroyalacademy.com.ng

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_cpanel_db_name
DB_USERNAME=your_cpanel_db_user
DB_PASSWORD=your_cpanel_db_password

JWT_SECRET=your_secure_random_string_at_least_32_chars
JWT_EXPIRATION=86400

MAIL_HOST=smtp.your-provider.com
MAIL_PORT=587
MAIL_USERNAME=your_email@domain.com
MAIL_PASSWORD=your_email_password
MAIL_FROM_ADDRESS=noreply@gracelandroyalacademy.com.ng
MAIL_FROM_NAME=CampusFund

PAYSTACK_SECRET_KEY=sk_live_xxx
PAYSTACK_PUBLIC_KEY=pk_live_xxx

UPLOAD_MAX_SIZE=5242880
UPLOAD_PATH=uploads
ALLOWED_TYPES=jpg,jpeg,png,pdf
```

---

### Step 5: Install Composer Dependencies

**Option A**: If SSH access is available:
```bash
cd public_html/api
composer install --no-dev --optimize-autoloader
```

**Option B**: Install locally before uploading:
```bash
cd backend
composer install --no-dev --optimize-autoloader
```
Then upload the `vendor/` folder along with other files.

---

### Step 6: Set Folder Permissions

Via SSH or cPanel File Manager:

```bash
chmod 755 public_html/api/
chmod 755 public_html/api/public/
chmod 755 public_html/api/uploads/
chmod 755 public_html/api/uploads/requests/
chmod 755 public_html/api/uploads/campaigns/
chmod 644 public_html/api/.env
chmod 644 public_html/api/public/index.php
```

---

### Step 7: Configure .htaccess Files

The root `.htaccess` and API `.htaccess` are already configured.
See the files created in the project root.

---

### Step 8: Update Frontend API Base URL

The frontend is pre-configured to proxy `/api` requests.
In production, the root `.htaccess` routes `/api/*` to the PHP backend.

---

### Step 9: SSL Certificate

1. In cPanel → **SSL/TLS** or **Let's Encrypt**
2. Enable SSL for the domain
3. Force HTTPS redirect (already in .htaccess)

---

### Step 10: Verify Deployment

1. Visit: `https://anns.com.gracelandroyalacademy.com.ng`
2. Test API: `https://anns.com.gracelandroyalacademy.com.ng/api/auth/me`
3. Test login with seed accounts

---

### Troubleshooting

| Issue | Solution |
|-------|----------|
| 500 Internal Server Error | Check `api/.env` DB credentials, check error logs in cPanel |
| API returns 404 | Verify `.htaccess` files are uploaded, check `mod_rewrite` is enabled |
| CORS errors | Verify `App.php` CORS headers match your domain |
| Upload fails | Check `uploads/` folder permissions (755) |
| Blank page | Check browser console, verify all `dist/` files are uploaded |
| Composer missing | Install locally and upload `vendor/` folder |
