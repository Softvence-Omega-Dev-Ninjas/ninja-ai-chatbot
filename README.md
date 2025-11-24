# Ninja AI Backend

A modern Go backend for AI-powered chat applications with JWT authentication, conversation management, and seamless Ollama integration for local LLM inference.

## 🚀 Features

- **JWT Authentication** - Secure user registration and login with token-based authentication
- **Conversation Management** - Create, list, retrieve, and delete chat conversations
- **Ollama Integration** - Real-time streaming chat with local Ollama models
- **Persistent Storage** - File-based JSON storage for users and conversations
- **RESTful API** - Clean, well-documented API endpoints
- **Swagger Documentation** - Interactive API documentation at `/docs/`
- **Docker Support** - Production and development Docker configurations
- **Live Reload** - Hot reload in development with Air

## 📋 Table of Contents

- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Authentication Guide](#authentication-guide)
- [Frontend Integration](#frontend-integration)
- [Data Models](#data-models)
- [Development](#development)
- [Deployment](#deployment)

## 🏗️ Architecture

### Project Structure

```
ninja-ai-golang/
├── app/                    # Application layer
│   ├── handlers/          # HTTP request handlers
│   │   ├── auth.go       # Authentication endpoints
│   │   ├── chat.go       # Conversation & chat endpoints
│   │   └── default.go    # Health & info endpoints
│   ├── middleware/        # HTTP middleware
│   │   ├── auth.go       # JWT authentication middleware
│   │   ├── logger.go     # Request logging
│   │   └── recover.go    # Panic recovery
│   ├── models/           # Data models
│   │   ├── user.go       # User model
│   │   ├── conversation.go # Conversation & message models
│   │   ├── ollama.go     # Ollama request/response models
│   │   └── common.go     # Common models (API response, JWT claims)
│   └── store/            # Data persistence layer
│       ├── store.go      # Generic file store
│       ├── users.go      # User store operations
│       └── conversations.go # Conversation store operations
├── pkg/                   # Shared packages
│   ├── config/           # Configuration management
│   └── utils/            # Utility functions (JWT, hashing, response helpers)
├── docs/                  # Swagger documentation (auto-generated)
├── data/                  # JSON data files (users, conversations)
├── main.go               # Application entry point
└── Makefile              # Build and development commands
```

### Technology Stack

- **Language**: Go 1.23+
- **AI Model**: Ollama (local LLM inference)
- **Authentication**: JWT (JSON Web Tokens)
- **Storage**: File-based JSON storage
- **Documentation**: Swagger/OpenAPI
- **Development Tools**: Air (live reload), Lefthook (git hooks)

## 🚦 Getting Started

### Prerequisites

- **Go 1.25+** - [Download](https://golang.org/dl/)
- **Ollama** - [Install Ollama](https://ollama.ai/) and pull a model (e.g., `ollama pull llama2`)
- **Make** (optional) - For using Makefile commands

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ninja-ai-golang
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Install development tools** (optional, for live reload and git hooks)
   ```bash
   make install
   make hooks
   ```

4. **Configure environment variables**
   
   Copy the example below or modify the existing `.env` file:
   ```env
   GO_ENV=development
   PORT=8088
   JWT_SECRET=your-secret-key-here
   OLLAMA_URL=http://localhost:11434
   ```

   Generate a secure JWT secret:
   ```bash
   make g-jwt
   ```

5. **Start Ollama** (in a separate terminal)
   ```bash
   ollama serve
   ```

6. **Run the server**
   
   With live reload (development):
   ```bash
   make run
   ```
   
   Or build and run:
   ```bash
   make build-local
   ./tmp/server
   ```

7. **Access the application**
   - API: `http://localhost:8088`
   - Swagger UI: `http://localhost:8088/docs/`
   - Health check: `http://localhost:8088/health`

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GO_ENV` | Yes | - | Environment mode (`development`, `production`) |
| `PORT` | Yes | - | Server port (e.g., `8088`) |
| `JWT_SECRET` | Yes | - | Secret key for JWT token signing (use `make g-jwt` to generate) |
| `OLLAMA_URL` | Yes | - | Ollama API URL (e.g., `http://localhost:11434`) |

## 📚 API Documentation

### Base URL

```
http://localhost:8088
```

### Interactive Documentation

Visit `http://localhost:8088/docs/` for interactive Swagger UI documentation where you can test all endpoints.

### Endpoints Overview

#### Health & Info

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | API welcome message |
| GET | `/api` | No | API root information |
| GET | `/health` | No | Health check |

#### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and get JWT token |

#### Conversations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/conversations` | Yes | Create a new conversation |
| GET | `/api/conversations` | Yes | List all user conversations |
| GET | `/api/conversations/{id}` | Yes | Get a specific conversation |
| DELETE | `/api/conversations/{id}` | Yes | Delete a conversation |

#### Chat

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/conversations/{id}/chat` | Yes | Send a message and get AI response (streaming) |

### Detailed Endpoint Documentation

#### 1. Register User

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input or email already exists

---

#### 2. Login User

**POST** `/api/auth/login`

Login with email and password to receive a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials

---

#### 3. Create Conversation

**POST** `/api/conversations`

Create a new conversation for the authenticated user.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "My AI Chat"
}
```

**Response (200 OK):**
```json
{
  "id": "conv-123",
  "user_id": "user-456",
  "title": "My AI Chat",
  "messages": [],
  "created_at": "2025-11-25T03:00:00Z",
  "updated_at": "2025-11-25T03:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Server error

---

#### 4. List Conversations

**GET** `/api/conversations`

Get all conversations for the authenticated user.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200 OK):**
```json
[
  {
    "id": "conv-123",
    "user_id": "user-456",
    "title": "My AI Chat",
    "messages": [...],
    "created_at": "2025-11-25T03:00:00Z",
    "updated_at": "2025-11-25T03:00:00Z"
  }
]
```

---

#### 5. Get Conversation

**GET** `/api/conversations/{id}`

Get a specific conversation by ID.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200 OK):**
```json
{
  "id": "conv-123",
  "user_id": "user-456",
  "title": "My AI Chat",
  "messages": [
    {
      "role": "user",
      "content": "Hello!",
      "timestamp": "2025-11-25T03:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help you?",
      "timestamp": "2025-11-25T03:00:01Z"
    }
  ],
  "created_at": "2025-11-25T03:00:00Z",
  "updated_at": "2025-11-25T03:00:01Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not the conversation owner
- `404 Not Found` - Conversation doesn't exist

---

#### 6. Delete Conversation

**DELETE** `/api/conversations/{id}`

Delete a specific conversation.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (204 No Content)**

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not the conversation owner
- `404 Not Found` - Conversation doesn't exist

---

#### 7. Chat with AI

**POST** `/api/conversations/{id}/chat`

Send a message to the AI and receive a streaming response. The conversation history is automatically saved.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "model": "llama2",
  "messages": [
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ],
  "stream": true
}
```

**Response (200 OK - Streaming):**

The response is a stream of JSON objects:

```json
{"model":"llama2","created_at":"2025-11-25T03:00:00Z","message":{"role":"assistant","content":"The"},"done":false}
{"model":"llama2","created_at":"2025-11-25T03:00:00Z","message":{"role":"assistant","content":" capital"},"done":false}
{"model":"llama2","created_at":"2025-11-25T03:00:00Z","message":{"role":"assistant","content":" of"},"done":false}
{"model":"llama2","created_at":"2025-11-25T03:00:00Z","message":{"role":"assistant","content":" France"},"done":false}
{"model":"llama2","created_at":"2025-11-25T03:00:00Z","message":{"role":"assistant","content":" is"},"done":false}
{"model":"llama2","created_at":"2025-11-25T03:00:00Z","message":{"role":"assistant","content":" Paris"},"done":false}
{"model":"llama2","created_at":"2025-11-25T03:00:01Z","message":{"role":"assistant","content":"."},"done":true}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not the conversation owner
- `404 Not Found` - Conversation doesn't exist
- `500 Internal Server Error` - Ollama connection error

## 🔐 Authentication Guide

This API uses JWT (JSON Web Tokens) for authentication.

### Authentication Flow

1. **Register** a new account using `/api/auth/register`
2. **Login** with your credentials at `/api/auth/login` to receive a JWT token
3. **Include the token** in the `Authorization` header for all protected endpoints:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### Token Details

- **Expiration**: 24 hours from issuance
- **Format**: `Bearer <token>`
- **Header**: `Authorization`

### Example: Complete Authentication Flow

```javascript
// 1. Register
const registerResponse = await fetch('http://localhost:8088/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123'
  })
});

// 2. Login
const loginResponse = await fetch('http://localhost:8088/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securePassword123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// 3. Use token for authenticated requests
const conversationsResponse = await fetch('http://localhost:8088/api/conversations', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 💻 Frontend Integration

### Quick Start Example

Here's a complete example of integrating the Ninja AI Backend into a frontend application:

```javascript
class NinjaAIClient {
  constructor(baseURL = 'http://localhost:8088') {
    this.baseURL = baseURL;
    this.token = null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('ninja_ai_token', token);
  }

  // Get authentication token
  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('ninja_ai_token');
    }
    return this.token;
  }

  // Helper method for API requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response;
  }

  // Authentication
  async register(name, email, password) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    return response.json();
  }

  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    this.setToken(data.data.token);
    return data;
  }

  // Conversations
  async createConversation(title = 'New Conversation') {
    const response = await this.request('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
    return response.json();
  }

  async getConversations() {
    const response = await this.request('/api/conversations');
    return response.json();
  }

  async getConversation(id) {
    const response = await this.request(`/api/conversations/${id}`);
    return response.json();
  }

  async deleteConversation(id) {
    await this.request(`/api/conversations/${id}`, {
      method: 'DELETE'
    });
  }

  // Chat with streaming
  async chat(conversationId, message, model = 'llama2', onChunk) {
    const response = await this.request(`/api/conversations/${conversationId}/chat`, {
      method: 'POST',
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: message }],
        stream: true
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.message?.content) {
            fullResponse += data.message.content;
            if (onChunk) {
              onChunk(data.message.content, fullResponse, data.done);
            }
          }
        } catch (e) {
          console.error('Failed to parse chunk:', e);
        }
      }
    }

    return fullResponse;
  }
}

// Usage Example
const client = new NinjaAIClient();

// Login
await client.login('john@example.com', 'password123');

// Create a conversation
const conversation = await client.createConversation('My Chat');

// Send a message with streaming
await client.chat(
  conversation.id,
  'Tell me a joke',
  'llama2',
  (chunk, fullText, isDone) => {
    console.log('Chunk:', chunk);
    console.log('Full text so far:', fullText);
    console.log('Is done:', isDone);
    
    // Update UI with streaming text
    document.getElementById('response').textContent = fullText;
  }
);
```

### TypeScript Types

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  user_id: string;
  title: string;
  messages: ConversationMessage[];
  created_at: string;
  updated_at: string;
}

interface ChatRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
  };
}

interface ChatStreamEvent {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}
```

### Error Handling

```javascript
try {
  await client.chat(conversationId, message);
} catch (error) {
  if (error.message.includes('401')) {
    // Token expired or invalid - redirect to login
    window.location.href = '/login';
  } else if (error.message.includes('403')) {
    // Forbidden - user doesn't own this conversation
    alert('You do not have access to this conversation');
  } else if (error.message.includes('404')) {
    // Conversation not found
    alert('Conversation not found');
  } else {
    // Other errors
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}
```

## 📊 Data Models

### User

```go
type User struct {
    ID           string    `json:"id"`
    Name         string    `json:"name"`
    Email        string    `json:"email"`
    PasswordHash string    `json:"password_hash"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}
```

### Conversation

```go
type Conversation struct {
    ID        string                `json:"id"`
    UserID    string                `json:"user_id"`
    Title     string                `json:"title"`
    Messages  []ConversationMessage `json:"messages"`
    CreatedAt time.Time             `json:"created_at"`
    UpdatedAt time.Time             `json:"updated_at"`
}

type ConversationMessage struct {
    Role      string    `json:"role"` // "user" or "assistant"
    Content   string    `json:"content"`
    Timestamp time.Time `json:"timestamp"`
}
```

### Chat Request/Response (Ollama)

```go
type ChatRequest struct {
    Model    string        `json:"model"`
    Messages []ChatMessage `json:"messages"`
    Stream   *bool         `json:"stream,omitempty"`
    Options  *ModelOptions `json:"options,omitempty"`
}

type ChatMessage struct {
    Role    string `json:"role"` // system, user, assistant
    Content string `json:"content"`
}

type ChatStreamEvent struct {
    Model     string      `json:"model"`
    CreatedAt time.Time   `json:"created_at"`
    Message   ChatMessage `json:"message"`
    Done      bool        `json:"done"`
}
```

## 🛠️ Development

### Available Make Commands

```bash
make help           # Show all available commands
make install        # Install development tools (air, lefthook, swag)
make hooks          # Install git hooks
make run            # Run with live reload (development)
make build-local    # Build local binary
make fmt            # Format code
make vet            # Run go vet
make tidy           # Run go mod tidy
make swagger        # Generate Swagger documentation
make clean          # Clean build artifacts
```

### Project Structure Guidelines

- **`app/handlers/`** - HTTP request handlers, one file per resource
- **`app/middleware/`** - HTTP middleware (auth, logging, recovery)
- **`app/models/`** - Data structures and business models
- **`app/store/`** - Data persistence layer
- **`pkg/`** - Reusable packages (config, utils)

### Adding New Endpoints

1. Define the model in `app/models/`
2. Create handler function in appropriate `app/handlers/` file
3. Add Swagger annotations above the handler
4. Register route in `main.go`
5. Regenerate Swagger docs: `make swagger`

### Code Quality

The project uses:
- **Lefthook** for git hooks (pre-commit formatting)
- **go fmt** for code formatting
- **go vet** for static analysis

Run before committing:
```bash
make fmt
make vet
```

## 🚀 Deployment

### Docker Deployment

#### Production

```bash
# Build production image
make build

# Push to registry
make push

# Run with Docker Compose
make up
```

#### Development

```bash
# Build development image
make build-dev

# Run with Docker Compose (development profile)
make up-dev
```

### Environment Configuration

For production, ensure these environment variables are set:

```env
GO_ENV=production
PORT=8088
JWT_SECRET=<strong-secret-key>
OLLAMA_URL=http://ollama:11434
```

### Docker Compose

The project includes a `compose.yaml` with profiles for both production and development environments.

## 📖 Swagger Documentation

### Accessing Swagger UI

Once the server is running, visit:
```
http://localhost:8088/docs/
```

### Regenerating Documentation

After modifying Swagger annotations in the code:

```bash
make swagger
```

This will update the files in the `docs/` directory:
- `docs/swagger.yaml`
- `docs/swagger.json`
- `docs/docs.go`

## 📝 License

Apache 2.0

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `make fmt` and `make vet`
5. Commit your changes
6. Push to your fork
7. Create a Pull Request

## 📧 Support

For API support, contact: support@swagger.io

---

**Built with ❤️ using Go and Ollama**