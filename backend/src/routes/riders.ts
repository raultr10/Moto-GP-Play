import { Hono } from 'hono';
import { db } from '../db/db';
import { riders } from '../db/schema';

//Creamos una mini-instancia de Hono solo para esta ruta
const ridersRoute = new Hono();

ridersRoute.get('/', async (c) => {
  try {
    const allRiders = await db.select().from(riders);
    return c.json(allRiders);
  } catch (error) {
    console.error("Error al obtener pilotos:", error);
    return c.json({ error: 'Fallo en boxes al obtener los pilotos' }, 500);
  }
});

export default ridersRoute;