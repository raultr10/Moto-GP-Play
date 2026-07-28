import { Hono } from 'hono';
import { db } from '../db/db';
import { riders, riderTeams, teams, circuits, circuitResults } from '../db/schema';
import { eq } from 'drizzle-orm';
import { checkMatch } from '../utils/gameLogic';

const connectionsRoute = new Hono();

//Recogemos el historial de resultados de un piloto y generamos una lista con todos sus logros en formato de texto
const buildAchievements = (riderResults: any[]) => {
  const achievements = new Set<string>();

  riderResults.forEach(res => {
    const circuit = res.circuitName.toUpperCase().trim();
    const year = res.year;

    if (res.position === 1) {
      achievements.add(`VICTORIA EN ${circuit}`);
      achievements.add(`VICTORIA EN ${year}`);
      achievements.add(`PODIO EN ${circuit}`);
      achievements.add(`PODIO EN ${year}`);
    } else if (res.position !== null && res.position <= 3) {
      achievements.add(`PODIO EN ${circuit}`);
      achievements.add(`PODIO EN ${year}`);
    } 
    
    if (res.position !== null && res.position <= 10) {
      achievements.add(`TOP 10 EN ${circuit}`);
      achievements.add(`TOP 10 EN ${year}`);
    }

    if (res.isPole) {
      achievements.add(`POLE EN ${circuit}`);
      achievements.add(`POLE EN ${year}`);
    }
    
    if (res.isFastestLap) {
      achievements.add(`VUELTA RÁPIDA EN ${circuit}`);
      achievements.add(`VUELTA RÁPIDA EN ${year}`);
    }
    
    if (res.isSprintWinner) {
      achievements.add(`SPRINT EN ${circuit}`);
      achievements.add(`SPRINT EN ${year}`);
    }
  });

  return Array.from(achievements);
};

//Función para darle color y texto a los logros generados
const getCategoryMeta = (ach: string) => {
  const isYear = !isNaN(Number(ach.split('EN ')[1]));
  const lugar = ach.split('EN ')[1];
  const contexto = isYear ? `en ${lugar}` : `en el circuito de ${lugar}`;

  if (ach.startsWith('VICTORIA EN')) return { color: '#FFD700', desc: `Han ganado una carrera ${contexto}` };
  if (ach.startsWith('POLE EN')) return { color: '#1E90FF', desc: `Hicieron la pole ${contexto}` };
  if (ach.startsWith('PODIO EN')) return { color: '#C0C0C0', desc: `Subieron al podio ${contexto}` };
  if (ach.startsWith('VUELTA RÁPIDA EN')) return { color: '#9370DB', desc: `Hicieron vuelta rápida ${contexto}` };
  if (ach.startsWith('TOP 10 EN')) return { color: '#20B2AA', desc: `Quedaron en el Top 10 ${contexto}` };
  if (ach.startsWith('SPRINT EN')) return { color: '#FF4500', desc: `Ganaron una Sprint ${contexto}` };
  
  return { color: '#888888', desc: ach };
};


connectionsRoute.get('/random', async (c) => {
  try {
    const allRiders = await db.select().from(riders);
    const allRiderTeams = await db.select({
      riderId: riderTeams.riderId,
      teamName: teams.name
    })
    .from(riderTeams)
    .innerJoin(teams, eq(riderTeams.teamId, teams.id));

    const allResults = await db.select({
      riderId: circuitResults.riderId,
      year: circuitResults.year,
      position: circuitResults.position,
      isPole: circuitResults.isPole,
      isFastestLap: circuitResults.isFastestLap,
      isSprintWinner: circuitResults.isSprintWinner,
      circuitName: circuits.name
    })
    .from(circuitResults)
    .innerJoin(circuits, eq(circuitResults.circuitId, circuits.id));

    const availableAchievements = new Set<string>();

    const ridersWithTeamsAndAchievements = allRiders.map(rider => {
      //Recogemos los equipos donde ha corrido ese piloto
      const tNames = allRiderTeams
        .filter(rt => rt.riderId === rider.id)
        .map(rt => rt.teamName.toUpperCase());
        
      //Recogemos los logros de ese piloto
      const rResults = allResults.filter(res => res.riderId === rider.id);
      const riderAchievements = buildAchievements(rResults);
      
      riderAchievements.forEach(ach => availableAchievements.add(ach));
      
      return { 
        ...rider, 
        teamNames: tNames,
        achievements: riderAchievements 
      };
    });

    //CATEGORÍAS (Estáticas + Dinámicas)
    let CATEGORIES_POOL: Record<string, any> = {
      'ESPAÑA': { color: '#FF69B4', desc: 'Pilotos nacidos en España' },
      'ITALIA': { color: '#87CEFA', desc: 'Pilotos nacidos en Italia' },
      'CAMPEÓN': { color: '#FFD700', desc: 'Han ganado algún mundial' },
      'REPSOL HONDA': { color: '#FF8C00', desc: 'Han corrido en el equipo oficial HRC' },
      'DUCATI LENOVO': { color: '#FF0000', desc: 'Han vestido de rojo oficial' },
      'YAMAHA OFICIAL': { color: '#0000FF', desc: 'Pilotos del equipo oficial Yamaha' },
      'GANADOR SPRINT': { color: '#32CD32', desc: 'Han ganado una carrera al sprint' },
      'PRAMAC': { color: '#8A2BE2', desc: 'Han pasado por el equipo Pramac' }
    };

    //Inyectamos las dinámicas de la base de datos
    Array.from(availableAchievements).forEach(ach => {
      CATEGORIES_POOL[ach] = getCategoryMeta(ach);
    });

    //Object.keys extrae solo las llaves de CATEGORIES_POOL y crea una lista: ESPAÑA, ITALIA, etc
    const categoryKeys = Object.keys(CATEGORIES_POOL);
    //Aquí se guardarán los 4 grupos de pilotos
    let finalGroups: any[] = [];
    //Lo dejaremos en false hasta que el bucle no devuelva un tablero perfecto
    let validBoard = false;
    //Para que no se forme un bucle infinito si hay algún error
    let attempts = 0;

    while (!validBoard && attempts < 300) {
      attempts++;
      
      //Barajamos las categorías y cogemos las 4 primeras 
      const shuffledKeys = [...categoryKeys].sort(() => 0.5 - Math.random()).slice(0, 4);
      
      //Guardaremos los grupos
      let currentBoardGroups: any[] = [];
      //Lo usaremos para apuntar que pilotos ya están en el tablero, para que un piloto no salga en dos grupos diferentes
      let usedRiderIds = new Set(); 
      let isAttemptValid = true;

      for (const cat of shuffledKeys) {
        //Buscamos pilotos que cumplan la categoría y que no hayamos usado ya
        const validRiders = ridersWithTeamsAndAchievements.filter(r => {
          if (usedRiderIds.has(r.id)) return false;
          return checkMatch(r, cat, r.teamNames);
        });

        //Si no llegamos a 4 pilotos para esta categoría, el tablero falla
        if (validRiders.length < 4) {
          isAttemptValid = false;
          break;
        }

        //Cogemos 4 al azar de los que han pasado el corte
        const selectedRiders = [...validRiders].sort(() => 0.5 - Math.random()).slice(0, 4);
        
        //Los bloqueamos para que no se repitan en las siguientes categorías
        selectedRiders.forEach(r => usedRiderIds.add(r.id));
        
        currentBoardGroups.push({
          category: cat,
          color: CATEGORIES_POOL[cat].color,
          desc: CATEGORIES_POOL[cat].desc,
          pilots: selectedRiders.map(r => ({
            id: r.id.toString(),
            name: r.name,
            category: cat, 
            imageUrl: r.imageUrl || (r as any).image_url
          }))
        });
      }

      if (isAttemptValid) {
        validBoard = true; 
        finalGroups = currentBoardGroups;
      }
    }

    if (!validBoard) {
      return c.json({ error: 'No se pudo generar un tablero sin ambigüedad en 300 intentos. Añade más pilotos o reinicia.' }, 500);
    }

    //EMPAQUETADO PARA EL FRONTEND
    let all16Pilots: any[] = [];
    let categoriesInfoToSend: Record<string, any> = {};

    finalGroups.forEach(group => {
      all16Pilots.push(...group.pilots);
      categoriesInfoToSend[group.category] = { color: group.color, desc: group.desc };
    });

    //Barajamos a los pilotos para que se muestren de manera aleatoria
    const shuffledPilots = all16Pilots.sort(() => 0.5 - Math.random());

    return c.json({
      pilots: shuffledPilots,
      categoriesInfo: categoriesInfoToSend
    });

  } catch (error) {
    console.error("Error generando Connections:", error);
    return c.json({ error: 'Fallo en el servidor al generar el juego' }, 500);
  }
});

export default connectionsRoute;