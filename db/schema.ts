// db/schema.ts
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Table pour les animes dans la collection de l'utilisateur
export const collectionAnimes = sqliteTable('collection_animes', {
  id: text('id').primaryKey(), // ID de l'anime depuis l'API Kitsu
  titre: text('titre').notNull(),
  titreOriginal: text('titre_original'),
  synopsis: text('synopsis'),
  imageUrl: text('image_url'),
  noteApi: real('note_api'), // Note depuis l'API
  statut: text('statut'), // "current", "finished", etc.
  nombreEpisodesTotal: integer('nombre_episodes_total'),
  dateAjout: text('date_ajout').notNull(), // Date d'ajout à la collection
  dateModification: text('date_modification').notNull()
});

// Table pour les épisodes regardés par l'utilisateur
export const episodesVus = sqliteTable('episodes_vus', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  animeId: text('anime_id').notNull(), // Référence vers l'anime
  numeroEpisode: integer('numero_episode').notNull(),
  titreEpisode: text('titre_episode'),
  dateVu: text('date_vu').notNull(), // Date où l'utilisateur a marqué l'épisode comme vu
  notePersonnelle: integer('note_personnelle') // Note sur 10 donnée par l'utilisateur
});

// Table pour la liste "à regarder"
export const listeARegarder = sqliteTable('liste_a_regarder', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  animeId: text('anime_id').notNull(),
  titre: text('titre').notNull(),
  imageUrl: text('image_url'),
  dateAjout: text('date_ajout').notNull(),
  priorite: integer('priorite').default(1) // 1=basse, 2=moyenne, 3=haute
});

// Table pour les catégories/genres des animes
export const categoriesAnimes = sqliteTable('categories_animes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  animeId: text('anime_id').notNull(),
  categorie: text('categorie').notNull()
});