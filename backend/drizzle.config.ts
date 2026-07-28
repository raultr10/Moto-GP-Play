import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts', // Ruta hacia tu archivo schema
  out: './drizzle',             // Carpeta donde Drizzle guardará su historial
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});