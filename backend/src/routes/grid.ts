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
      achievements.add(`TOP 10 EN ${circuit}`);
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

    //Categorías base (Equipos, Países y Títulos generales)
    const baseCategories = [
      'DUCATI LENOVO', 'YAMAHA OFICIAL', 'REPSOL HONDA', 'APRILIA RACING', 'KTM FACTORY', 'SUZUKI', 'VR46', 'GRESINI', 'TRACKHOUSE', 'TECH3', 'PRAMAC', 'LCR HONDA', 'PETRONAS', 'MARC VDS', 'AVINTIA', 'ASPAR', 'FORWARD', 'RNF', 'IODARACING', 'CARDION AB',
      'ESPAÑA', 'ITALIA', 'FRANCIA', 'AUSTRALIA', 'JAPÓN', 'CAMPEÓN', 'CAMPEÓN MOTO2', 'CAMPEÓN MOTO3', 'GANADOR SPRINT', 'GANADOR CARRERA'
    ];

    //Juntamos las base con las que se han generado solas al leer la base de datos
    const ALL_CATEGORIES = [...baseCategories, ...dynamicCategories];

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
      
      const selectedCategories = getRandomElements(ALL_CATEGORIES, 6);
      const cols = selectedCategories.slice(0, 3);
      const rows = selectedCategories.slice(3, 6);

      let isGridPossible = true;
      let currentSolution = Array(9).fill(null); 
      let usedIds = new Set(); 

      for (let c = 0; c < 3; c++) {
        for (let r = 0; r < 3; r++) {
          const colCat = cols[c]!;
          const rowCat = rows[r]!;

          const validRidersForCell = ridersReady.filter(rider => {
            if (usedIds.has(rider.id)) return false; 
            return checkMatch(rider, colCat, rider.teamNames) && checkMatch(rider, rowCat, rider.teamNames);
          });

          if (validRidersForCell.length === 0) {
            isGridPossible = false;
            break; 
          } else {
            const solutionRider = validRidersForCell[0];
            usedIds.add(solutionRider!.id); 

            const nameParts = solutionRider!.name.split(' ');
            currentSolution[r * 3 + c] = {
              id: solutionRider!.id, 
              name: nameParts[nameParts.length - 1]!.toUpperCase(),
              imageUrl: solutionRider!.imageUrl || (solutionRider as any).image_url 
            };
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

    if (!validGridFound) {
      return c.json({ cols: ['DUCATI LENOVO', 'YAMAHA OFICIAL', 'ESPAÑA'], rows: ['CAMPEÓN', 'ITALIA', 'GANADOR SPRINT'], solution: Array(9).fill(null) });
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
          const validRiders = ridersReady.filter(rider => {
            if (usedIds.has(rider.id)) return false; 
            return checkMatch(rider, cols[c], rider.teamNames) && checkMatch(rider, rows[r], rider.teamNames);
          });

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