// db/index.ts
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// Création de la base de données SQLite
const expo = openDatabaseSync('anime-collect.db');
export const db = drizzle(expo, { schema });

export async function initDatabase() {
  try {
    console.log('🔄 Initialisation de la base de données...');
    
    // Créer les tables si elles n'existent pas
    await expo.execAsync(`
      CREATE TABLE IF NOT EXISTS collection_animes (
        id TEXT PRIMARY KEY,
        titre TEXT NOT NULL,
        titre_original TEXT,
        synopsis TEXT,
        image_url TEXT,
        note_api REAL,
        statut TEXT,
        nombre_episodes_total INTEGER,
        date_ajout TEXT NOT NULL,
        date_modification TEXT NOT NULL
      );
    `);

    await expo.execAsync(`
      CREATE TABLE IF NOT EXISTS episodes_vus (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        anime_id TEXT NOT NULL,
        numero_episode INTEGER NOT NULL,
        titre_episode TEXT,
        date_vu TEXT NOT NULL,
        note_personnelle INTEGER,
        UNIQUE(anime_id, numero_episode)
      );
    `);

    await expo.execAsync(`
      CREATE TABLE IF NOT EXISTS liste_a_regarder (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        anime_id TEXT NOT NULL,
        titre TEXT NOT NULL,
        image_url TEXT,
        date_ajout TEXT NOT NULL,
        priorite INTEGER DEFAULT 1
      );
    `);

    await expo.execAsync(`
      CREATE TABLE IF NOT EXISTS categories_animes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        anime_id TEXT NOT NULL,
        categorie TEXT NOT NULL
      );
    `);

    // Créer les index pour améliorer les performances
    await expo.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_episodes_vus_anime_id ON episodes_vus(anime_id);
    `);

    await expo.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_collection_date_ajout ON collection_animes(date_ajout);
    `);

    await expo.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_liste_a_regarder_anime_id ON liste_a_regarder(anime_id);
    `);

    console.log('✅ Base de données initialisée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

// Fonction pour vérifier si la base de données est prête
export async function isDatabaseReady(): Promise<boolean> {
  try {
    // Tester une simple requête pour vérifier si la DB est accessible
    await expo.execAsync('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Base de données non accessible:', error);
    return false;
  }
}

// Fonction pour nettoyer la base de données (utile pour les tests)
export async function clearDatabase() {
  try {
    await expo.execAsync('DELETE FROM episodes_vus');
    await expo.execAsync('DELETE FROM categories_animes');
    await expo.execAsync('DELETE FROM liste_a_regarder');
    await expo.execAsync('DELETE FROM collection_animes');
    console.log('🧹 Base de données nettoyée');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
}