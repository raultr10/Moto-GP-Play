export const checkMatch = (rider: any, category: string, teamNames: string[]) => {
  const cat = category.toUpperCase();

  //Lógica de Países 
  if (rider.country?.toUpperCase() === cat) return true;

  //Lógica Estricta de Equipos
  const isTeamMatch = teamNames.some(team => {
    if (cat === 'KTM FACTORY') return team.includes('KTM FACTORY');
    if (cat === 'REPSOL HONDA') return team.includes('REPSOL');
    if (cat === 'DUCATI LENOVO') return team.includes('DUCATI LENOVO') || team === 'DUCATI TEAM';
    if (cat === 'YAMAHA OFICIAL') return team.includes('MONSTER ENERGY YAMAHA') || team.includes('YAMAHA FACTORY');
    if (cat === 'APRILIA RACING') return team === 'APRILIA RACING';
    if (cat === 'SUZUKI') return team.includes('SUZUKI ECSTAR') || team === 'SUZUKI'; 

    if (cat === 'PRAMAC') return team.includes('PRAMAC');
    if (cat === 'GRESINI') return team.includes('GRESINI');
    if (cat === 'TECH3') return team.includes('TECH3');
    if (cat === 'VR46') return team.includes('VR46');
    if (cat === 'TRACKHOUSE') return team.includes('TRACKHOUSE');
    if (cat === 'LCR HONDA') return team.includes('LCR');
    if (cat === 'PETRONAS') return team.includes('PETRONAS');
    if (cat === 'MARC VDS') return team.includes('MARC VDS');
    if (cat === 'AVINTIA') return team.includes('AVINTIA');
    if (cat === 'ASPAR') return team.includes('ASPAR');
    if (cat === 'FORWARD') return team.includes('FORWARD');
    if (cat === 'RNF') return team === 'RNF MOTOGP TEAM';
    if (cat === 'IODARACING') return team.includes('IODARACING');
    if (cat === 'CARDION AB') return team.includes('CARDION AB');

    return false;
  });

  if (isTeamMatch) return true;

  //Lógica de Títulos Base
  if (cat === 'CAMPEÓN' && rider.isChampion) return true;
  if (cat === 'CAMPEÓN MOTOGP' && rider.isChampionMotogp) return true;
  if (cat === 'CAMPEÓN MOTO2' && rider.isChampionMoto2) return true;
  if (cat === 'CAMPEÓN MOTO3' && rider.isChampionMoto3) return true;
  if (cat === 'GANADOR SPRINT' && rider.isSprintWinner) return true;
  if (cat === 'GANADOR CARRERA' && rider.isRaceWinner) return true;

  //LÓGICA DE LOGROS DINÁMICOS (Circuitos, Años, Top 10...)
  if (rider.achievements && rider.achievements.includes(cat)) return true;
  
  return false;
};