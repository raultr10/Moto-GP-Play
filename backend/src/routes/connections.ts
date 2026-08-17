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

    //Contaremos cuántos pilotos hay en cada uno para asegurar que al menos hay 4
    const countryCounts: Record<string, number> = {};
    const teamCounts: Record<string, number> = {};

    ridersWithTeamsAndAchievements.forEach(r => {
      //Contamos los países (SOLO si el piloto tiene país en la base de datos)
      if (r.country) {
        const country = r.country.toUpperCase();
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }

      //Contamos los equipos
      r.teamNames.forEach(team => {
        teamCounts[team] = (teamCounts[team] || 0) + 1;
      });
    });

    //Filtramos los bombos: SOLO entran los países y equipos que tengan 4 o más pilotos
    const COUNTRY_CATS = Object.keys(countryCounts).filter(c => countryCounts[c]! >= 4);
    const TEAM_CATS = Object.keys(teamCounts).filter(t => teamCounts[t]! >= 4);
    const MISC_STATIC_CATS = [
      'CAMPEÓN',
      'CAMPEÓN MOTO2', 
      'CAMPEÓN MOTO3', 
      'GANADOR CARRERA', 
      'GANADOR SPRINT',
      'COMPAÑEROS DE MÁRQUEZ',
      'COMPAÑEROS DE ROSSI',
      'COMPAÑEROS DE LORENZO',
      'COMPAÑEROS DE PEDROSA'
    ];

    // 🔴 2. CREAMOS EL POOL Y GENERAMOS COLORES/TEXTOS AUTOMÁTICAMENTE
    let CATEGORIES_POOL: Record<string, any> = {
      'CAMPEÓN': { color: '#FFD700', desc: 'Han ganado un mundial en cualquier categoría' },
      'CAMPEÓN MOTO2': { color: '#C0C0C0', desc: 'Fueron campeones del mundo de Moto2' },
      'CAMPEÓN MOTO3': { color: '#CD7F32', desc: 'Fueron campeones del mundo de Moto3' },
      'GANADOR CARRERA': { color: '#00BFFF', desc: 'Han ganado una carrera en Moto GP' },
      'GANADOR SPRINT': { color: '#32CD32', desc: 'Han ganado una carrera al sprint' },
      'COMPAÑEROS DE MÁRQUEZ': { color: '#E65100', desc: 'Han compartido box con Marc Márquez' },
      'COMPAÑEROS DE ROSSI': { color: '#FFFF00', desc: 'Han sido compañeros de Valentino Rossi' },
      'COMPAÑEROS DE LORENZO': { color: '#8B0000', desc: 'Fueron compañeros de equipo de Jorge Lorenzo' },
      'COMPAÑEROS DE PEDROSA': { color: '#FF8C00', desc: 'Compartieron garaje con Dani Pedrosa' }
    };

    // Paleta de colores variada para que se asignen al azar a los nuevos países/equipos
    const randomColors = ['#FF69B4', '#87CEFA', '#FF8C00', '#FF0000', '#0000FF', '#8A2BE2', '#20B2AA', '#FF4500', '#9370DB', '#1E90FF'];

    // Inyectamos todos los países válidos
    COUNTRY_CATS.forEach(country => {
      CATEGORIES_POOL[country] = {
        color: randomColors[Math.floor(Math.random() * randomColors.length)],
        desc: `Pilotos de ${country.charAt(0) + country.slice(1).toLowerCase()}`
      };
    });

    // Inyectamos todos los equipos válidos
    TEAM_CATS.forEach(team => {
      CATEGORIES_POOL[team] = {
        color: randomColors[Math.floor(Math.random() * randomColors.length)],
        desc: `Han corrido en el equipo ${team}`
      };
    });

    // 🔴 3. RECOPILAMOS LAS DINÁMICAS (LOGROS)
    const dynamicAchievements = Array.from(availableAchievements);
    dynamicAchievements.forEach(ach => {
      CATEGORIES_POOL[ach] = getCategoryMeta(ach);
    });

    // El bombo de logros tendrá los dinámicos (Top10, poles...) + los estáticos sueltos (Campeón...)
    const ACHIEVEMENT_CATS = [...MISC_STATIC_CATS, ...dynamicAchievements];

    // Aquí se guardarán los 4 grupos de pilotos
    let finalGroups: any[] = [];
    let validBoard = false;
    let attempts = 0;

    while (!validBoard && attempts < 300) {
      attempts++;

      // 🔴 4. LÓGICA DE SELECCIÓN CONTROLADA
      // Cogemos 1 país, 1 equipo y 2 logros aleatorios de sus respectivos bombos
      const randomCountry = [...COUNTRY_CATS].sort(() => 0.5 - Math.random())[0];
      const randomTeam = [...TEAM_CATS].sort(() => 0.5 - Math.random())[0];
      const randomDynamic = [...ACHIEVEMENT_CATS].sort(() => 0.5 - Math.random())[0];
      const randomStatic = [...MISC_STATIC_CATS].sort(() => 0.5 - Math.random())[0];

      // Juntamos las 4 y las barajamos para que no salgan siempre en el mismo orden visual
      const selectedCategories = [randomCountry, randomTeam, randomDynamic, randomStatic];
      const shuffledKeys = selectedCategories.sort(() => 0.5 - Math.random());

      // Guardaremos los grupos
      let currentBoardGroups: any[] = [];
      //Lo usaremos para apuntar que pilotos ya están en el tablero, para que un piloto no salga en dos grupos diferentes
      let usedRiderIds = new Set();
      let isAttemptValid = true;

      for (const cat of shuffledKeys) {
        //Buscamos pilotos que cumplan la categoría y que no hayamos usado ya
        const validRiders = ridersWithTeamsAndAchievements.filter(r => {
          if (usedRiderIds.has(r.id)) return false;
          return checkMatch(r, cat!, r.teamNames);
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
          color: CATEGORIES_POOL[cat!].color,
          desc: CATEGORIES_POOL[cat!].desc,
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