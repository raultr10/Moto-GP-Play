import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = Bun.env.DATABASE_URL!;

//Creamos el cliente de conexión
const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });