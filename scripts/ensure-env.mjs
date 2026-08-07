import { existsSync, copyFileSync } from 'node:fs';

if (existsSync('.env')) {
  console.log('.env already exists.');
} else {
  copyFileSync('.env.example', '.env');
  console.log('Created .env from .env.example.');
}
