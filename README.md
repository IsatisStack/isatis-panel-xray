# Railway VLESS One-Click Panel v1.0

A production-ready web application for deploying and managing Xray (VLESS + WebSocket) servers on Railway with a simple web interface.

## Features

- **Dashboard**: Real-time server status, resource usage, and configuration overview
- **Configuration Generator**: Create VLESS client configurations with one click
- **Multiple Browser Fingerprints**: Chrome, Firefox, Safari, Edge, Android, iOS, Random
- **HTTP Version Support**: Auto, HTTP/1.1, HTTP/2, HTTP/3
- **QR Code Generation**: Scan to import configuration on mobile
- **One-Click Reload**: Apply configuration changes without restarting
- **Automatic Railway Integration**: Auto-detects domain and port
- **Dark Mode UI**: Modern glassmorphism design with Tailwind CSS
- **RESTful API**: Full CRUD operations for configurations
- **Dockerized**: Single command deployment with Docker Compose
- **Railway Ready**: Deploy directly to Railway with zero configuration

## Tech Stack

### Backend
- **Go 1.24+** - Gin web framework, GORM ORM, SQLite
- **Xray-core** - VLESS WebSocket TLS implementation

### Frontend
- **React 18+** - Vite, TypeScript, Tailwind CSS
- **State Management** - React Query (or custom hooks)
- **UI Components** - Custom glassmorphism cards, lucide-icons

### DevOps
- **Docker** - Multi-stage build with Alpine Linux
- **Docker Compose** - Orchestration
- **Railway** - One-click deployment

## Quick Start

### Local Development

1. **Prerequisites**
   - Go 1.24+
   - Node.js 18+ and npm
   - Docker and Docker Compose
   - Git

2. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/railway-vless-panel.git
   cd railway-vless-panel
   ```

3. **Backend Setup**
   ```bash
   cd backend
   go mod tidy
   go run ./cmd/server
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Xray Binary**
   Ensure Xray is installed and available in PATH, or it will be downloaded automatically in Docker.

6. **Visit**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080/api/status

### Docker Deployment

```bash
docker compose up -d
```

The application will be available at http://localhost:8080

### Railway Deployment

1. Fork this repository
2. Create a new Railway project
3. Connect your GitHub repository
4. Railway will auto-detect the Dockerfile and deploy
5. Set environment variables if needed (see below)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port to run the server on | `8080` |
| `DB_PATH` | Path to SQLite database file | `./data/panel.db` |
| `RAYWAY_PUBLIC_DOMAIN` | Railway public domain (auto-set) | Auto-detected |
| `XRAY_PATH` | Path to Xray binary | `/usr/local/bin/xray` |
| `XRAY_CONFIG_PATH` | Path to Xray config | `/etc/xray/config.json` |
| `LOG_DIR` | Directory for logs | `./data/logs` |

## API Endpoints

### Server Status
- `GET /api/status` - Get server status, version, and resource usage

### Configurations
- `GET /api/configs` - List all configurations
- `POST /api/config` - Create a new configuration
- `GET /api/config/:id` - Get configuration by ID
- `PUT /api/config/:id` - Update configuration
- `DELETE /api/config/:id` - Delete configuration
- `POST /api/reload` - Reload Xray configuration
- `GET /api/version` - Get Xray version

## Project Structure

```
railway-vless-panel/
├── backend/                 # Go backend
│   ├── cmd/                 # Application entrypoint
│   ├── internal/            # Private application code
│   │   ├── api/             # HTTP handlers and routes
│   │   ├── config/          # Configuration loading
│   │   ├── db/              # Database initialization and migrations
│   │   ├── middleware/      # HTTP middleware
│   │   ├── models/          # Data models
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── data/                # SQLite database and logs
│   └── go.mod               # Go dependencies
├── frontend/                # React frontend
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript interfaces
│   │   ├── assets/          # Static assets
│   │   ├── App.tsx          # Router and layout
│   │   └── main.tsx         # Entry point
│   ├── index.html           # HTML template
│   ├── package.json         # npm dependencies
│   ├── vite.config.ts       # Vite configuration
│   └── tsconfig.json        # TypeScript configuration
├── xray/                    # Xray configuration templates
├── docker/                  # Docker and deployment files
│   ├── Dockerfile           # Multi-stage Docker build
│   ├── start.sh             # Entrypoint script
│   └── docker-compose.yml   # Docker Compose orchestration
├── scripts/                 # Helper scripts
├── docs/                    # Additional documentation
└── README.md                # This file
```

## Screenshots

*(Add screenshots here)*

## Development Guidelines

### Backend
- Follow clean architecture principles
- Use dependency injection
- Write unit tests for services and handlers
- Validate all inputs
- Use structured logging
- Handle errors gracefully

### Frontend
- Use functional components with hooks
- Implement proper TypeScript typing
- Follow Tailwind CSS utility-first approach
- Create reusable components
- Implement loading states and error boundaries
- Use React Query for data fetching (or similar)

## Testing

### Backend Tests
```bash
cd backend
go test ./...
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment to Railway

1. Push code to GitHub
2. In Railway dashboard, click "New Project"
3. Select "Deploy from GitHub"
4. Choose this repository
5. Railway will automatically:
   - Detect Dockerfile
   - Build and deploy the container
   - Set PORT environment variable
   - Provide a public domain

## Troubleshooting

### Common Issues

1. **Xray not starting**
   - Check logs: `docker compose logs panel`
   - Ensure xray binary has execute permissions
   - Verify config.json is valid JSON

2. **Database connection failed**
   - Check if data directory is writable
   - Ensure SQLite3 is available in the container

3. **Frontend not connecting to backend**
   - Verify CORS settings in backend
   - Check API proxy in vite.config.ts
   - Confirm backend is running on correct port

4. **Port already in use**
   - Change PORT environment variable
   - Or stop the conflicting process

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and process.

## Acknowledgments

- [Xray-core](https://github.com/XTLS/Xray-core) for the proxy core
- [Gin](https://github.com/gin-gonic/gin) for the Go web framework
- [React](https://reactjs.org/) for the UI library
- [Tailwind CSS](https://tailwindcss.com/) for the styling
- [Vite](https://vitejs.dev/) for the frontend tooling
- [Railway](https://railway.app/) for the deployment platform

---
**Magic Number**: 20260706
**Last Updated**: 2026-07-07