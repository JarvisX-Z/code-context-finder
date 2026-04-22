export const mockFiles = [
  {
    filename: "src/auth/jwt.ts",
    content: `import jwt from 'jsonwebtoken';

export function signToken(payload: any, secret: string, expiresIn: string = '1h') {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string, secret: string) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
}
`
  },
  {
    filename: "src/db/connection.ts",
    content: `import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
}
`
  },
  {
    filename: "src/api/routes/users.ts",
    content: `import { Router } from 'express';
import { query } from '../../db/connection';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT id, email, role FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', async (req, res) => {
  const { email, password } = req.body;
  // TODO: Hash password
  try {
    const result = await query(
      'INSERT INTO users(email, password) VALUES($1, $2) RETURNING id, email',
      [email, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  }
});

export default router;
`
  },
  {
    filename: "src/utils/formatting.ts",
    content: `export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

export function truncate(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
`
  },
  {
    filename: "src/components/Button.tsx",
    content: `import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export function Button({ variant = 'primary', isLoading, children, className = '', ...props }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  return (
    <button 
      className={\`\${baseClasses} \${variants[variant]} \${isLoading ? 'opacity-70 cursor-wait' : ''} \${className}\`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
`
  },
  {
    filename: "src/hooks/useUser.ts",
    content: `import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
}

export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const res = await fetch(\`/api/users/\${userId}\`);
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) fetchUser();
  }, [userId]);

  return { user, loading, error };
}
`
  },
  {
    filename: "tests/auth.test.ts",
    content: `import { signToken, verifyToken } from '../src/auth/jwt';

describe('JWT Auth', () => {
  const secret = 'test-secret-key';
  
  it('should sign and verify a token', () => {
    const payload = { userId: '123', role: 'admin' };
    const token = signToken(payload, secret);
    
    expect(token).toBeDefined();
    
    const decoded = verifyToken(token, secret) as any;
    expect(decoded.userId).toBe('123');
    expect(decoded.role).toBe('admin');
  });
  
  it('should throw on invalid token', () => {
    expect(() => verifyToken('invalid-token', secret)).toThrow('Invalid token');
  });
});
`
  },
  {
    filename: "package.json",
    content: `{
  "name": "example-project",
  "version": "1.0.0",
  "description": "An example project",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "pg": "^8.11.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.2",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/pg": "^8.10.2",
    "jest": "^29.5.0",
    "nodemon": "^2.0.22",
    "ts-jest": "^29.1.0",
    "typescript": "^5.1.3"
  }
}
`
  },
  {
    filename: "docker-compose.yml",
    content: `version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DB_HOST=db
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=myapp
    depends_on:
      - db
      
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=myapp
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
`
  },
  {
    filename: "src/middleware/rateLimiter.ts",
    content: `import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export function createRateLimiter(limit: number, windowMs: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const key = \`rate_limit:\${ip}\`;
    
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.pexpire(key, windowMs);
      }
      
      if (current > limit) {
        return res.status(429).json({ 
          error: 'Too many requests',
          retryAfter: await redis.pttl(key)
        });
      }
      
      next();
    } catch (err) {
      // Fail open if redis is down
      console.error('Rate limiter error:', err);
      next();
    }
  };
}
`
  }
];
