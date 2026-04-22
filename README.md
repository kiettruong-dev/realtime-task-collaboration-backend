````md
# Backend - Realtime Task Collaboration System

NestJS backend for realtime task collaboration system.

---

## Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 7.x
- **WebSocket**: Socket.io 4.x
- **Authentication**: JWT + Passport
- **Validation**: class-validator + class-transformer
- **Password Hash**: bcrypt

---

## Installation

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- pnpm >= 8.0.0

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment (.env)
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET, etc.

# 3. Setup database
pnpm run makemigrations:deploy

# 4. Run development server
pnpm run start:dev
```
````

---

## Project Structure

```bash
src/
├── apis/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── local-auth.guard.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── dto/
│   │       └── register.dto.ts
│   │
│   ├── workspace/
│   │   ├── workspace.controller.ts
│   │   ├── workspace.service.ts
│   │   ├── workspace.module.ts
│   │   └── dto/
│   │       ├── create-workspace.dto.ts
│   │       ├── query-workspace.dto.ts
│   │       └── invite-workspace.dto.ts
│   │
│   └── task/
│       ├── task.controller.ts
│       ├── task.service.ts
│       ├── task.module.ts
│       └── dto/
│           ├── create-task.dto.ts
│           ├── update-task.dto.ts
│           ├── delete-task.dto.ts
│           └── query-task.dto.ts
│
├── gateways/
│   └── realtime/
│       ├── realtime.gateway.ts
│       └── realtime.module.ts
│
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── public.decorator.ts
│   ├── enums/
│   │   ├── task.enum.ts
│   │   └── workspace.enum.ts
│   ├── constants/
│   │   ├── auth.ts
│   │   └── pagination.constant.ts
│   └── dto/
│       └── paginate.dto.ts
│
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
├── utils/
│   └── helpers.util.ts
│
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts
```

---

## API Endpoints

### Authentication

```http
POST /auth/register
POST /auth/login
GET /auth/profile
```

### Workspace

```http
POST /workspaces
GET /workspaces?page=1&pageSize=10
POST /workspaces/:id/invite
```

### Task

```http
POST /tasks
GET /tasks/:workspaceId?page=1&pageSize=20
PATCH /tasks/:taskId
DELETE /tasks/:taskId
```

---

## WebSocket Events

### Connection

```ts
io('http://localhost:3000', {
  auth: { token: 'jwt-token' },
});
```

### Workspace Events

```ts
socket.emit('join_workspace', { workspaceId });
socket.emit('leave_workspace', { workspaceId });
```

### Task Events

```ts
server.to('workspace:uuid').emit('task_created', taskData);
server.to('workspace:uuid').emit('task_updated', taskData);
server.to('workspace:uuid').emit('task_deleted', taskId);
server.to('workspace:uuid').emit('task_error', { type, message });
```

---

## Running

### Development

```bash
pnpm run start:dev
pnpm run start:debug
pnpm run start:watch
```

### Production

```bash
pnpm run build
pnpm run start:prod
```

---

## Database

### Migrations

```bash
pnpm run makemigrations:create -- name
pnpm run makemigrations:deploy
pnpm run makemigrations:reset
```

---

## Testing

```bash
pnpm run test
pnpm run test:watch
pnpm run test:cov
pnpm run test:e2e
```

---

## Linting

```bash
pnpm run lint
pnpm run format
```

---

## Environment Variables

```env
PORT=3000

DATABASE_URL="postgresql://user:password@localhost:5432/task_realtime"

JWT_SECRET="your-secret-key"
JWT_EXPIRATION="1d"

CORS_ORIGIN=http://localhost:5173

SALT_ROUNDS=10
```

---

## Key Features

- JWT Authentication
- Workspace management (owner/member roles)
- Task CRUD with version control
- Realtime updates via WebSocket
- Conflict detection
- Secure password hashing (bcrypt)
- Request validation

---

## Troubleshooting

### Port already in use

```bash
lsof -i :3000 | xargs kill -9
```

### Database connection failed

```bash
psql -c "SELECT version();"
```

### Migration issues

```bash
pnpm run makemigrations:reset
```

---

## References

- [https://docs.nestjs.com/](https://docs.nestjs.com/)
- [https://www.prisma.io/docs/](https://www.prisma.io/docs/)
- [https://socket.io/docs/](https://socket.io/docs/)
- [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)

---

```

```
