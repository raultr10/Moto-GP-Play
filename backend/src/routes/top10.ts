import { Hono } from 'hono';
import { db } from '../db/db';
import { circuitResults, circuits, riders } from '../db/schema';
import { eq, lte } from 'drizzle-orm';

const top10Route = new Hono();

top10Route.get('/random', async (c) => {
  try {
    //Extraemos de la BD todos los resultados que sean posición 10 o superior
    const allTop10Results = await db
      .select({
        circuitId: circuitResults.circuitId,
        circuitName: circuits.name,
        year: circuitResults.year,
        position: circuitResults.position,
        riderId: riders.id,
        riderName: riders.name,
        country: riders.country,
        imageUrl: riders.imageUrl,
      })
      .from(circuitResults)
      .innerJoin(circuits, eq(circuitResults.circuitId, circuits.id))
      .innerJoin(riders, eq(circuitResults.riderId, riders.id))
      .where(lte(circuitResults.position, 10));

    //Agrupamos los resultados por carrera (Circuito + Año)
    const racesMap = new Map();
    
    allTop10Results.forEach(row => {
      //Creamos una clave única para cada carrera, ej: "5-2026"
      const raceKey = `${row.circuitId}-${row.year}`; 
      
      if (!racesMap.has(raceKey)) {
        racesMap.set(raceKey, {
          circuitName: row.circuitName,
          year: row.year,
          results: []
        });
      }
      
      //Metemos al piloto en el array de resultados de esa carrera
      racesMap.get(raceKey).results.push({
        position: row.position,
        id: row.riderId.toString(),
        name: row.riderName,
        country: row.country,
        imageUrl: row.imageUrl
      });
    });

    //Filtramos para quedarnos SOLO con las carreras que tienen exactamente 10 pilotos
    //(Así evitamos que el minijuego se rompa si a una carrera le faltan datos)
    const validRaces = Array.from(racesMap.values()).filter(race => race.results.length === 10);

    if (validRaces.length === 0) {
      return c.json({ error: 'No hay carreras con un Top 10 completo en la base de datos.' }, 500);
    }

    //Elegimos una carrera al azar de entre las válidas
    const randomRace = validRaces[Math.floor(Math.random() * validRaces.length)];

    //Ordenamos el array de pilotos por posición (del 1 al 10) 
    randomRace.results.sort((a: any, b: any) => a.position - b.position);

    //Enviamos el paquete completo al frontend
    return c.json(randomRace);

  } catch (error) {
    console.error("Error generando Top 10:", error);
    return c.json({ error: 'Fallo en el servidor al generar el minijuego' }, 500);
  }
});

export default top10Route;