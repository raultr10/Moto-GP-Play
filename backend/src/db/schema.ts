import { pgTable, serial, varchar, integer, date, boolean, foreignKey, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ==========================================
// TABLA DE PILOTOS
// ==========================================
export const riders = pgTable("riders", {
  id: serial("id").primaryKey().notNull(),
  name: varchar("name", { length: 100 }).notNull(), 
  number: integer("number").notNull(),              
  country: varchar("country", { length: 50 }),               
  isActive: boolean("is_active").default(true),
  isChampion: boolean('is_champion').default(false),
  isChampionMotogp: boolean('is_champion_motogp').default(false),
  isChampionMoto2: boolean('is_champion_moto2').default(false),
  isChampionMoto3: boolean('is_champion_moto3').default(false),
  titlesMotogp: integer('titles_motogp').default(0),
  isRaceWinner: boolean('is_race_winner').default(false),
  isSprintWinner: boolean('is_sprint_winner').default(false),
  imageUrl: varchar("image_url", { length: 255 }),
});

// ==========================================
// TABLA DE RETOS DIARIOS
// ==========================================
//Esta tabla dicta qué piloto o qué reto toca cada día.
//Todavia no se utiliza
export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey().notNull(),
  gameType: varchar("game_type", { length: 50 }).notNull(),
  playDate: date("play_date").notNull(), //La fecha exacta en la que este reto está activo
  targetRiderId: integer("target_rider_id"), //La respuesta correcta de ese día (FK a riders)
  gridData: jsonb('grid_data')
}, (table) => [
  foreignKey({
    columns: [table.targetRiderId],
    foreignColumns: [riders.id],
    name: "daily_challenges_target_rider_fkey"
  }).onDelete("cascade"),
]);
// ==========================================
// TABLA DE CIRCUITOS
// ==========================================
export const circuits = pgTable("circuits", {
  id: serial("id").primaryKey().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  country: varchar("country", { length: 50 }),
});

// ==========================================
// TABLA DE RESULTADOS EN CIRCUITO
// ==========================================
export const circuitResults = pgTable("circuit_results", {
  id: serial("id").primaryKey().notNull(),
  circuitId: integer("circuit_id").references(() => circuits.id, { onDelete: 'cascade' }),
  riderId: integer("rider_id").references(() => riders.id, { onDelete: 'cascade' }),
  year: integer("year").notNull(),
  //Usamos números para la posición final de carrera
  position: integer("position"),
  isPole: boolean("is_pole").default(false),
  isFastestLap: boolean("is_fastest_lap").default(false),
  isSprintWinner: boolean("is_sprint_winner").default(false)
});

// ==========================================
// TABLA DE EQUIPOS
// ==========================================
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  logoUrl: varchar("logo_url", { length: 255 }),
});

// ==========================================
// TABLA DE EQUIPOS DEL PILOTO
// ==========================================
export const riderTeams = pgTable("rider_teams", {
  riderId: integer("rider_id").references(() => riders.id, { onDelete: 'cascade' }).notNull(),
  teamId: integer("team_id").references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  isCurrentTeam: boolean("is_current_team").default(false),
}, (t) => ({
  pk: primaryKey({ columns: [t.riderId, t.teamId] }) 
}));