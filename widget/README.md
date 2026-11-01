# Widget

The Voicely chat widget is a real-time chat component that can be embedded in customer websites.

## Structure

- `backend/` - Socket.io server for real-time messaging
- `chat-widget/` - React-based frontend component
- `test-env/` - Nginx server for testing the widget

## Environment Setup

Create the following environment files in the `widget/` directory:

### `.env.dev` (Development)
```bash
# Backend Configuration
BACKEND_PORT=4000
CORS_ORIGIN=*

# Widget Configuration
WIDGET_PORT=5173
VITE_SOCKET_URL=http://localhost:4000

# Test Environment
TEST_ENV_PORT=8080

# Environment
NODE_ENV=development
```

### `.env.prod` (Production)
```bash
# Backend Configuration
BACKEND_PORT=4000
CORS_ORIGIN=https://yourdomain.com

# Widget Configuration
WIDGET_PORT=4173
VITE_SOCKET_URL=https://api.yourdomain.com

# Test Environment
TEST_ENV_PORT=8080

# Environment
NODE_ENV=production
```

## Development

### Using Makefile (from project root)
```bash
make widget-dev    # Start widget in development mode
make widget-build  # Build widget for production
make widget-test   # Run widget tests
make widget-clean  # Clean build artifacts
```

### Using Docker Compose directly
```bash
# Development
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose -f docker-compose.prod.yml up --build
```

## Configuration

The widget uses environment variables for configuration:

- `VITE_SOCKET_URL` - Socket.io server URL (used by chat-widget)
- `BACKEND_PORT` - Backend server port
- `WIDGET_PORT` - Widget frontend port
- `CORS_ORIGIN` - CORS origin for backend
- `TEST_ENV_PORT` - Test environment port

These can be set in `.env.dev` or `.env.prod` files, or passed directly to docker-compose.
