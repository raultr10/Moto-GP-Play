export const countryFlags: Record<string, any> = {
  'ALE': require('../../assets/flags/Alemania.png'),
  'ARG': require('../../assets/flags/Argentina.png'),
  'AUS': require('../../assets/flags/Australia.png'),
  'BRA': require('../../assets/flags/Brazil.png'),
  'COL': require('../../assets/flags/Colombia.png'),
  'ESP': require('../../assets/flags/Espana.png'),
  'FIN': require('../../assets/flags/Finlandia.png'),
  'FRA': require('../../assets/flags/Francia.png'),
  'IND': require('../../assets/flags/Indonesia.png'),
  'IRL': require('../../assets/flags/Irlanda.png'),
  'ITA': require('../../assets/flags/Italia.png'),
  'JAP': require('../../assets/flags/Japon.png'),
  'POR': require('../../assets/flags/Portugal.png'),
  'REI': require('../../assets/flags/ReinoUnido.png'),
  'REP': require('../../assets/flags/RepublicaCheca.png'),
  'SUD': require('../../assets/flags/Sudafrica.png'), 
  'TAI': require('../../assets/flags/Tailandia.png'),
  'TUR': require('../../assets/flags/Turquia.png'),
  'EST': require('../../assets/flags/USA.png'),
};

export const getFlag = (countryCode: string) => {
  //Si encuentra la bandera te la da, si no, te da la imagen por defecto
  return countryFlags[countryCode] || require('../../assets/flags/Default.png'); 
};