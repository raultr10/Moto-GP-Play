import { Hono } from 'hono';
import { db } from '../db/db';
import { riders, riderTeams, teams, circuits, circuitResults } from '../db/schema';
import { eq } from 'drizzle-orm';
import { checkMatch } from '../utils/gameLogic';

const gridRoute = new Hono();

//LOGROS DINÁMICOS
const buildAchievements = (riderResults: any[]) => {
  const achievements = new Set<string>();

  riderResults.forEach(res => {
    //Sacamos el nombre del circuito
    const circuit = res.circuitName.toUpperCase().trim();
    //Sacamos el año del logro
    const year = res.year;

    //Victorias y Podios
    if (res.position === 1) {
      achievements.add(`VICTORIA EN ${circuit}`);
      achievements.add(`VICTORIA EN ${year}`);
      achievements.add(`PODIO EN ${circuit}`);
      achievements.add(`PODIO EN ${year}`);
    } else if (res.position !== null && res.position <= 3) {
      achievements.add(`PODIO EN ${circuit}`);
      achievements.add(`PODIO EN ${year}`);
    } 
    
    //Top 10
    if (res.position !== null && res.position <= 10) {
      achievements.add(`TOP 10 EN ${year}`);
    }

    //Poles y Vueltas Rápidas
    if (res.isPole) {
      achievements.add(`POLE EN ${circuit}`);
      achievements.add(`POLE EN ${year}`);
    }
    if (res.isFastestLap) {
      achievements.add(`VUELTA RÁPIDA EN ${circuit}`);
      achievements.add(`VUELTA RÁPIDA EN ${year}`);
    }
    
    //Sprints
    if (res.isSprintWinner) {
      achievements.add(`SPRINT EN ${circuit}`);
      achievements.add(`SPRINT EN ${year}`);
    }
  });

  return Array.from(achievements);
};

const getRidersReady = async () => {
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

  //Aquí guardaremos todos los logros reales que vayamos encontrando
  const availableAchievements = new Set<string>();

  const mappedRiders = allRiders.map(rider => {
    const riderTeamsList = allRiderTeams
      .filter(rt => rt.riderId === rider.id)
      .map(rt => rt.teamName.toUpperCase());
      
    const rResults = allResults.filter(res => res.riderId === rider.id);
    const riderAchievements = buildAchievements(rResults);
    
    //Metemos los logros de este piloto en la bolsa global
    riderAchievements.forEach(ach => availableAchievements.add(ach));
    
    return { 
      ...rider, 
      teamNames: riderTeamsList,
      achievements: riderAchievements 
    };
  });

  //Devolvemos tanto los pilotos preparados como la lista de categorías reales
  return { 
    ridersReady: mappedRiders, 
    dynamicCategories: Array.from(availableAchievements) 
  };
};

//Ruta de prueba
gridRoute.get('/', async (c) => {
  return c.json({ cols: ['ESPAÑA', 'DUCATI LENOVO', 'APRILIA RACING'], rows: ['CAMPEÓN', 'GANADOR SPRINT', 'TECH3'] });
});

//Ruta aleatoria
gridRoute.get('/random', async (c) => {
  try {
    //Obtenemos los pilotos y TODAS las categorías que existen en la BD
    const { ridersReady, dynamicCategories } = await getRidersReady();

    const countryCounts: Record<string, number> = {};
    const teamCounts: Record<string, number> = {};

    ridersReady.forEach(r => {
      if (r.country) {
        const country = r.country.toUpperCase();
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }
      r.teamNames.forEach(team => {
        teamCounts[team] = (teamCounts[team] || 0) + 1;
      });
    });

    const COUNTRY_CATS = Object.keys(countryCounts).filter(cat => countryCounts[cat]! >= 3);
    const TEAM_CATS = Object.keys(teamCounts).filter(t => teamCounts[t]! >= 3);

    const STATIC_CATS = [
      'CAMPEÓN', 'CAMPEÓN MOTOGP', 'CAMPEÓN MOTO2', 'CAMPEÓN MOTO3',
      'GANADOR CARRERA', 'GANADOR SPRINT',
      'COMPAÑEROS DE MÁRQUEZ', 'COMPAÑEROS DE ROSSI',
      'COMPAÑEROS DE LORENZO', 'COMPAÑEROS DE PEDROSA'
    ];

    const getRandomElements = (arr: string[], count: number) => {
      return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
    };

    let validGridFound = false;
    let attempts = 0;
    let finalCols: string[] = [];
    let finalRows: string[] = [];
    let finalSolution: any[] = []; 

    //Al haber tantísimas combinaciones posibles, el servidor puede necesitar probar más veces
    while (!validGridFound && attempts < 500) {
      attempts++;

      // Eje 1 (Países y Equipos): Sacamos 3 en total (ej: 2 equipos y 1 país, o 1 equipo y 2 países)
      const numTeams = Math.random() > 0.5 ? 2 : 1; 
      const numCountries = 3 - numTeams;
      const safeTeams = TEAM_CATS.length >= numTeams ? getRandomElements(TEAM_CATS, numTeams) : getRandomElements(TEAM_CATS, TEAM_CATS.length);
      const safeCountries = COUNTRY_CATS.length >= numCountries ? getRandomElements(COUNTRY_CATS, numCountries) : getRandomElements(COUNTRY_CATS, COUNTRY_CATS.length);
      const axis1 = [...safeTeams, ...safeCountries];

      // Eje 2 (Estáticas y Dinámicas): Sacamos 3 en total (ej: 2 estáticas y 1 dinámica, o 1 estática y 2 dinámicas)
      const numStatics = Math.random() > 0.5 ? 2 : 1; 
      const numDynamics = 3 - numStatics;
      const axis2 = [
        ...getRandomElements(STATIC_CATS, numStatics),
        ...getRandomElements(dynamicCategories, numDynamics)
      ];

      //Si faltan elementos en el eje 1, rellenamos con estáticas
      while(axis1.length < 3) axis1.push(getRandomElements(STATIC_CATS, 1)[0]!);
      //Si faltan elementos en el eje 2, rellenamos con dinámicas
      while(axis2.length < 3) axis2.push(getRandomElements(dynamicCategories, 1)[0]!);

      //Asignamos un eje a las columnas y otro a las filas aleatoriamente
      let colsSource = Math.random() > 0.5 ? axis1 : axis2;
      let rowsSource = colsSource === axis1 ? axis2 : axis1;

      //Barajamos el orden para que visualmente sea impredecible
      const cols = getRandomElements(colsSource, 3);
      const rows = getRandomElements(rowsSource, 3);

      let isGridPossible = true;
      let currentSolution = Array(9).fill(null); 
      let usedIds = new Set(); 

      //Cambiamos las variables 'c' y 'r' por 'cIndex' y 'rIndex' para que no hagan conflicto con el '(c)' del parámetro principal de Hono.
      //Recorremos todas las casillas
      for (let cIndex = 0; cIndex < 3; cIndex++) {
        for (let rIndex = 0; rIndex < 3; rIndex++) {
          const colCat = cols[cIndex]!;
          const rowCat = rows[rIndex]!;

          //Comprobamos que cumpla la categoría de la columna y de la fila, y que no se haya usado aún
          const hasValidRider = ridersReady.some(rider =>
            checkMatch(rider, colCat, rider.teamNames) && checkMatch(rider, rowCat, rider.teamNames)  
          );

          if (!hasValidRider) {
            isGridPossible = false;
            break; 
          } 
        }
        if (!isGridPossible) break;
      }

      if (isGridPossible) {
        validGridFound = true;
        finalCols = cols;
        finalRows = rows;
        finalSolution = currentSolution; 
      }
    }
    return c.json({ cols: finalCols, rows: finalRows, solution: finalSolution });

  } catch (error) {
    console.error("Error generando Grid:", error);
    return c.json({ error: 'Fallo al mezclar las categorías' }, 500);
  }
});

//Validador de intentos
gridRoute.post('/guess', async (c) => {
  try {
    const { riderId, rowCategory, colCategory, cols, rows } = await c.req.json();
    const { ridersReady } = await getRidersReady();

    const rider = ridersReady.find(r => r.id === riderId);
    if (!rider) return c.json({ valid: false, error: 'Piloto fantasma' });

    const isRowValid = checkMatch(rider, rowCategory, rider.teamNames);
    const isColValid = checkMatch(rider, colCategory, rider.teamNames);

    if (!isRowValid || !isColValid) {
      return c.json({ valid: false, error: 'Ese piloto no encaja en esta casilla' });
    }

    //Lógica para el autocompletado
    //Si una casilla solo tiene un piloto como solución y se utiliza en otra casilla, se autocompletará esta también
    const autoFillIndexes: number[] = [];
    if (cols && rows) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const validRidersForThisCell = ridersReady.filter(dbRider => {
            return checkMatch(dbRider, rows[r], dbRider.teamNames) && checkMatch(dbRider, cols[c], dbRider.teamNames);
          });

          if (validRidersForThisCell.length === 1 && validRidersForThisCell[0]!.id === riderId) {
            autoFillIndexes.push(r * 3 + c);
          }
        }
      }
    }

    return c.json({ 
      valid: true, 
      riderName: rider.name,
      imageUrl: rider.imageUrl || (rider as any).image_url,
      autoFillIndexes 
    });

  } catch (error) {
    return c.json({ valid: false, error: 'Fallo en la telemetría' }, 500);
  }
});

//Lógica del give up
gridRoute.post('/giveup', async (c) => {
  try {
    const { cols, rows, currentAnswers } = await c.req.json();
    const { ridersReady } = await getRidersReady();

    //Para no repetir pilotos
    const usedIds = new Set(currentAnswers.filter((a: any) => a !== null).map((a: any) => a.id));
    const finalBoard = [...currentAnswers];

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const index = r * 3 + c;
        
        //Para que rellene solo las casillas que están vacías
        if (finalBoard[index] === null) {
          let validRiders = ridersReady.filter(rider => {
            if (usedIds.has(rider.id)) return false; 
            return checkMatch(rider, cols[c], rider.teamNames) && checkMatch(rider, rows[r], rider.teamNames);
          });

          //Salvavidas por si ha habido un error y se agotan las opciones de pilotos
          //Mejor que salga uno repetido a una casilla vacía
          if (validRiders.length === 0) {
            validRiders = ridersReady.filter(rider => {
              return checkMatch(rider, cols[c], rider.teamNames) && checkMatch(rider, rows[r], rider.teamNames);
            });
          }

          if (validRiders.length > 0) {
            const solutionRider = validRiders[0];
            usedIds.add(solutionRider!.id); 
            
            const nameParts = solutionRider!.name.split(' ');
            finalBoard[index] = {
              id: solutionRider!.id,
              name: nameParts[nameParts.length - 1]!.toUpperCase(),
              imageUrl: solutionRider!.imageUrl || (solutionRider as any).image_url
            };
          }
        }
      }
    }

    return c.json({ completedBoard: finalBoard });

  } catch (error) {
    return c.json({ error: 'Fallo al resolver el tablero' }, 500);
  }
});

export default gridRoute;