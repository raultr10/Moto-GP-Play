import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db } from './db/db'; 
import { riders } from './db/schema'; 
import ridersRoute from './routes/riders';
import wordleRoute from './routes/wordle';
import gridRoute from './routes/grid';
import connectionsRoute from './routes/connections';
import top10Route from './routes/top10';

const app = new Hono();

//El middleware CORS es vital para que tu frontend móvil pueda hacer peticiones sin que el navegador/emulador lo bloquee
app.use('/*', cors());

//Ruta de prueba rápida
app.get('/', (c) => {
  return c.text('¡Servidor de MotogoPlay rugiendo! 🏍️');
});

app.route('/api/riders', ridersRoute);
app.route('/api/daily/wordle', wordleRoute);
app.route('/api/daily/grid', gridRoute);
app.route('/api/daily/connections', connectionsRoute);
app.route('/api/daily/top10', top10Route)

//Bun arranca el servidor automáticamente exportando la app
export default {
  port: Bun.env.PORT || 3000,
  fetch: app.fetch,
};