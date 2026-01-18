# Cloudflare Demos

A modular platform demonstrating Cloudflare product behavior through executable tests.

## 🧩 Modules

- **⚡ Caching** - Learn Cloudflare caching behavior through 11 comprehensive tests

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Cloudflare account with a tunnel token

### 1. Clone and Setup

```bash
git clone https://github.com/cougz/awesome-cloudflare-demos.git
cd awesome-cloudflare-demos
```

### 2. Configure Tunnel Token

The `.env` file is pre-configured with a tunnel token. To use your own:

```bash
cp .env.example .env
# Add your TUNNEL_TOKEN to .env
```

### 3. Deploy

```bash
./deploy.sh
```

That's it! The platform will:
- Validate all modules
- Build nginx configurations
- Start Docker containers (nginx + cloudflared)
- Run health checks

### 5. Access

- **Cloudflare Tunnel**: Check your Cloudflare dashboard for the public URL
- **Local**: http://localhost:8080

## ➕ Adding New Modules

Adding a new module is simple - just copy the template and edit 4 files:

### 1. Copy Template

```bash
cp -r modules/_template modules/your-module
```

### 2. Edit Module Files

Edit the 4 files in `modules/your-module/`:

#### `config.json` - Module metadata

```json
{
  "name": "Your Module Name",
  "icon": "📦",
  "description": "Brief description",
  "order": 10,
  "enabled": true,
  "docs_url": "https://developers.cloudflare.com/docs-link"
}
```

#### `tests.json` - Test definitions

```json
{
  "module": "Your Module Name",
  "description": "Description of what this module tests",
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "tests": [
    {
      "id": 1,
      "name": "Test Name",
      "description": "What this test demonstrates",
      "endpoint": "/test-endpoint/resource",
      "behavior": "What the endpoint does",
      "expected": "What you should observe",
      "commands": ["curl -sIL https://YOUR_DOMAIN/test-endpoint/resource"]
    }
  ]
}
```

#### `nginx.conf` - Backend routes

```nginx
location /test-endpoint/ {
    alias /usr/share/nginx/html/test-files/modules/your-module/;
    add_header Cache-Control "public";
}
```

#### `ui.html` - Frontend UI

HTML with test descriptions, curl commands, and expected behaviors.

### 3. Add Test Files (optional)

```bash
mkdir -p test-files/modules/your-module
# Add your test files here
```

### 4. Redeploy

```bash
./deploy.sh
```

Your module will automatically appear on the landing page!

## 📁 Module Structure

```
modules/your-module/
├── config.json    # Name, icon, order, enabled status
├── tests.json     # Test definitions with endpoints and commands
├── nginx.conf     # Backend nginx routes
└── ui.html        # Frontend UI with test guide
```

## 🛠️ Development

### Validate Modules

```bash
./scripts/validate-modules.sh
```

Checks that all modules have required files and valid JSON.

### Build Nginx Configs

```bash
./scripts/build-nginx.sh
```

Generates nginx configuration files from all module `nginx.conf` files.

### View Logs

```bash
docker-compose logs -f
```

### Restart Services

```bash
docker-compose restart
```

### Stop Services

```bash
docker-compose down
```

## 📦 Current Modules

### Caching (⚡)

11 comprehensive tests covering:
- Default caching behavior
- Origin TTL handling
- Private/Set-Cookie header handling
- Origin Cache Control rules
- Cache key configuration
- Cookie-based authentication
- Image resizing transformations

[View Caching Test Guide](#caching-module-details)

## 🔧 Architecture

### Auto-Discovery System

The platform automatically discovers and loads modules:

1. **Frontend**: `module-loader.js` fetches all `/modules/*/config.json`
2. **Backend**: `build-nginx.sh` generates nginx configs from `modules/*/nginx.conf`
3. **Zero Configuration**: Add a module folder, edit 4 files, and it appears automatically

### Docker Services

- **nginx**: Serves the web app and all test endpoints
- **cloudflared**: Cloudflare Tunnel for public access

### Directory Layout

```
awesome-cloudflare-demos/
├── html/                    # Frontend
│   ├── index.html          # Landing page
│   ├── styles.css          # Styles
│   ├── app-header.html     # Header component
│   └── module-loader.js    # Auto-discovery
├── modules/                # All modules
│   ├── caching/           # Caching module
│   └── _template/         # Module template
├── nginx/                 # Nginx configs
│   ├── nginx.conf         # Base config
│   └── conf.d/
│       ├── _base.conf     # Server config
│       └── modules/       # Generated configs
├── scripts/               # Build scripts
│   ├── validate-modules.sh
│   ├── build-nginx.sh
│   └── download-images.sh
├── test-files/            # Test assets
│   └── modules/
│       └── caching/
├── Dockerfile
├── docker-compose.yml
└── deploy.sh             # One-command deployment
```

## 🧪 Caching Module Details

### Test Overview

The caching module provides 11 tests demonstrating Cloudflare's caching behavior:

1. **Default Cache** - Test standard file caching
2. **404 Cache** - Test error response caching
3. **Origin TTL** - Observe ignored origin TTL
4. **Private Header** - Test private directive handling
5. **Set-Cookie** - Test Set-Cookie header handling
6. **Origin Cache Control** - Dashboard configuration
7. **Validate Fixes** - Verify Origin Cache Control works
8. **Cache Poisoning** - Discover cookie auth vulnerability
9. **Cache Key Rule** - Fix the vulnerability
10. **DYNAMIC Status** - Test non-cacheable files
11. **Image Resizing** - Practice Cloudflare transformations

### Prerequisites

Before running the caching tests:
1. Start with no Cache Rules for this host
2. Purge Everything in Cloudflare dashboard
3. Enable Image Transformations (for Task 12)

### Running the Tests

1. Navigate to the Caching module
2. Follow each task in order
3. Copy and paste the curl commands
4. Observe the results
5. Create cache rules as instructed (Tasks 6 & 9)

### Expected Behaviors

Each test includes:
- **Endpoint**: The test URL
- **Behavior**: What the endpoint does
- **Expected**: What you should observe
- **Curl Command**: Ready-to-use command
- **Observations**: Key points to look for

### Cache Poisoning Demo

Tasks 8-9 demonstrate a real cache poisoning vulnerability:
- Without Cache Key rule: Authenticated response cached and served to unauthenticated users
- With Cache Key rule: Proper separation of authenticated/unauthenticated requests

## 📚 Documentation

- [Cloudflare Caching Documentation](https://developers.cloudflare.com/cache/about/cache-control/)
- [Cloudflare Cache Rules](https://developers.cloudflare.com/cache/about/cache-rules/)
- [Cloudflare Image Resizing](https://developers.cloudflare.com/images/image-resizing/)
- [Cloudflare Tunnels](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

## 🐛 Troubleshooting

### Module not appearing

1. Run `./scripts/validate-modules.sh`
2. Check that `config.json` has `"enabled": true`
3. Rebuild nginx configs: `./scripts/build-nginx.sh`
4. Redeploy: `./deploy.sh`

### Health check failing

1. Check logs: `docker-compose logs`
2. Verify nginx is running: `docker ps`
3. Test locally: `curl http://localhost:8080/health`

### Cloudflare Tunnel not connecting

1. Verify TUNNEL_TOKEN in `.env`
2. Check tunnel logs: `docker-compose logs cloudflared`
3. Verify tunnel exists in Cloudflare dashboard

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! To add a new module:
1. Copy `modules/_template/`
2. Edit the 4 module files
3. Add test files if needed
4. Submit a pull request

## 🌟 Credits

Built to help developers understand Cloudflare's products through hands-on experimentation.
