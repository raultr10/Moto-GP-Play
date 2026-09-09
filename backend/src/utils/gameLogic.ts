export const checkMatch = (rider: any, category: string, teamNames: string[]) => {
  const cat = category.toUpperCase();

  if (rider.country?.toUpperCase() === cat) return true;

  if (cat === 'CAMPEÓN' && rider.isChampion) return true;
  if (cat === 'CAMPEÓN MOTOGP' && rider.isChampionMotogp) return true;
  if (cat === 'CAMPEÓN MOTO2' && rider.isChampionMoto2) return true;
  if (cat === 'CAMPEÓN MOTO3' && rider.isChampionMoto3) return true;
  if (cat === 'GANADOR SPRINT' && rider.isSprintWinner) return true;
  if (cat === 'GANADOR CARRERA' && rider.isRaceWinner) return true;

  if (cat === 'COMPAÑEROS DE MÁRQUEZ') {
    const teammates = ['Dani Pedrosa', 'Jorge Lorenzo', 'Pol Espargaró', 'Joan Mir', 'Alex Márquez', 'Francesco Bagnaia'];
    return teammates.includes(rider.name);
  }

  if (cat === 'COMPAÑEROS DE ROSSI') {
    const teammates = ['Colin Edwards', 'Jorge Lorenzo', 'Maverick Viñales', 'Nicky Hayden', 'Franco Morbidelli'];
    return teammates.includes(rider.name);
  }

  if (cat === 'COMPAÑEROS DE LORENZO') {
    const teammates = ['Valentino Rossi', 'Ben Spies', 'Andrea Dovizioso', 'Marc Márquez'];
    return teammates.includes(rider.name);
  }

  if (cat === 'COMPAÑEROS DE PEDROSA') {
    const teammates = ['Nicky Hayden', 'Andrea Dovizioso', 'Casey Stoner', 'Marc Márquez'];
    return teammates.includes(rider.name);
  }

  //Lógica Dinámica (Equipos, Circuitos, Años, Top 10...)
  if (teamNames.some(team => team.toUpperCase() === cat)) return true;
  if (rider.achievements?.includes(cat)) return true;
  
  return false;
};