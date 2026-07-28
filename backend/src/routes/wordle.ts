import { Hono } from 'hono';
import { db } from '../db/db';
import { riders } from '../db/schema';

const wordleRoute = new Hono();

//Función auxiliar para quitar acentos y poner mayúsculas
function normalizeName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

//Devuelve un piloto aleatorio
wordleRoute.get('/random', async (c) => {
  try {
    //Sacamos a todos los pilotos
    const allRiders = await db.select().from(riders);

    //Filtramos los que cumplen la regla de las 3 a 7 letras
    const validRiders = [];

    for (const rider of allRiders) {
      const nameParts = rider.name.split(' ');
      const lastName = normalizeName(nameParts[nameParts.length - 1]!);
      const firstName = normalizeName(nameParts[0]!);

      let targetWord = null;

      //Prioridad 1: El apellido (entre 3 y 7 letras)
      if (lastName.length >= 3 && lastName.length <= 7) {
        targetWord = lastName;
      } 
      //Prioridad 2: El nombre (entre 3 y 7 letras)
      else if (firstName.length >= 3 && firstName.length <= 7) {
        targetWord = firstName;
      }

      //Si cumple alguna de las dos, entra a la bolsa de pilotos jugables
      if (targetWord) {
        validRiders.push({
          ...rider,
          wordleTarget: targetWord
        });
      }
    }

    if (validRiders.length === 0) {
      return c.json({ error: 'No hay pilotos con nombres/apellidos de esa longitud.' }, 500);
    }

    //Elegimos uno al azar de los que son válidos
    const randomRider = validRiders[Math.floor(Math.random() * validRiders.length)];

    return c.json(randomRider);
    
  } catch (error) {
    console.error("Error Wordle Random:", error);
    return c.json({ error: 'Fallo al cargar el reto aleatorio' }, 500);
  }
});

export default wordleRoute;