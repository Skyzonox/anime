// services/databaseService.ts
import { and, desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import {
  categoriesAnimes,
  collectionAnimes,
  episodesVus,
  listeARegarder
} from '../db/schema';

// Types basés sur le schéma
export type AnimeCollection = typeof collectionAnimes.$inferSelect;
export type NewAnimeCollection = typeof collectionAnimes.$inferInsert;

export type EpisodeVu = typeof episodesVus.$inferSelect;
export type NewEpisodeVu = typeof episodesVus.$inferInsert;

export type AnimeARegarder = typeof listeARegarder.$inferSelect;
export type NewAnimeARegarder = typeof listeARegarder.$inferInsert;

export type CategorieAnime = typeof categoriesAnimes.$inferSelect;
export type NewCategorieAnime = typeof categoriesAnimes.$inferInsert;

// Configuration de la base de données
const expo = openDatabaseSync('animeCollect.db');
const db = drizzle(expo);

export class DatabaseService {
  private static instance: DatabaseService;
  
  private constructor() {}
  
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // === GESTION DE LA COLLECTION ===
  
  async ajouterALaListeARegarder(anime: NewAnimeARegarder): Promise<void> {
    try {
      await db.insert(listeARegarder).values({
        ...anime,
        dateAjout: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la liste:', error);
      throw new Error('Impossible d\'ajouter l\'anime à la liste');
    }
  }

  async ajouterAnimeALaCollection(anime: NewAnimeCollection): Promise<void> {
    try {
      const now = new Date().toISOString();
      await db.insert(collectionAnimes).values({
        ...anime,
        dateAjout: now,
        dateModification: now,
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la collection:', error);
      throw new Error('Impossible d\'ajouter l\'anime à la collection');
    }
  }

  async supprimerAnimeDeCollection(animeId: string): Promise<void> {
    try {
      // Supprimer l'anime de la collection
      await db.delete(collectionAnimes).where(eq(collectionAnimes.id, animeId));
      
      // Supprimer tous les épisodes vus associés
      await db.delete(episodesVus).where(eq(episodesVus.animeId, animeId));
      
      // Supprimer toutes les catégories associées
      await db.delete(categoriesAnimes).where(eq(categoriesAnimes.animeId, animeId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw new Error('Impossible de supprimer l\'anime de la collection');
    }
  }

  async getListeARegarder(): Promise<AnimeARegarder[]> {
    try {
      return await db.select().from(listeARegarder).orderBy(desc(listeARegarder.priorite), desc(listeARegarder.dateAjout));
    } catch (error) {
      console.error('Erreur lors de la récupération de la liste:', error);
      return [];
    }
  }

  async supprimerDeLaListeARegarder(id: number): Promise<void> {
    try {
      await db.delete(listeARegarder).where(eq(listeARegarder.id, id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la liste:', error);
      throw new Error('Impossible de supprimer l\'anime de la liste');
    }
  }

  // === GESTION DES ÉPISODES ===

  async marquerEpisodeCommeVu(episodeData: NewEpisodeVu): Promise<void> {
    try {
      await db.insert(episodesVus).values({
        ...episodeData,
        dateVu: new Date().toISOString(),
      });

      // Mettre à jour la date de modification de l'anime
      await db.update(collectionAnimes)
        .set({ dateModification: new Date().toISOString() })
        .where(eq(collectionAnimes.id, episodeData.animeId));
    } catch (error) {
      console.error('Erreur lors du marquage de l\'épisode:', error);
      throw new Error('Impossible de marquer l\'épisode comme vu');
    }
  }

  async getEpisodesVusPourAnime(animeId: string): Promise<EpisodeVu[]> {
    try {
      return await db.select()
        .from(episodesVus)
        .where(eq(episodesVus.animeId, animeId))
        .orderBy(episodesVus.numeroEpisode);
    } catch (error) {
      console.error('Erreur lors de la récupération des épisodes vus:', error);
      return [];
    }
  }

  async getNombreEpisodesVusPourAnime(animeId: string): Promise<number> {
    try {
      const episodes = await this.getEpisodesVusPourAnime(animeId);
      return episodes.length;
    } catch (error) {
      console.error('Erreur lors du comptage des épisodes:', error);
      return 0;
    }
  }

  async marquerEpisodeNonVu(animeId: string, numeroEpisode: number): Promise<void> {
    try {
      await db.delete(episodesVus)
        .where(
          and(
            eq(episodesVus.animeId, animeId),
            eq(episodesVus.numeroEpisode, numeroEpisode)
          )
        );

      // Mettre à jour la date de modification de l'anime
      await db.update(collectionAnimes)
        .set({ dateModification: new Date().toISOString() })
        .where(eq(collectionAnimes.id, animeId));
    } catch (error) {
      console.error('Erreur lors de l\'annulation du marquage:', error);
      throw new Error('Impossible d\'annuler le marquage de l\'épisode');
    }
  }

  // === GESTION DE LA COLLECTION ===

  async getCollection(): Promise<AnimeCollection[]> {
    try {
      return await db.select().from(collectionAnimes).orderBy(desc(collectionAnimes.dateModification));
    } catch (error) {
      console.error('Erreur lors de la récupération de la collection:', error);
      return [];
    }
  }

  async getAnimeById(id: string): Promise<AnimeCollection | null> {
    try {
      const result = await db.select().from(collectionAnimes).where(eq(collectionAnimes.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'anime:', error);
      return null;
    }
  }

  async isAnimeInCollection(animeId: string): Promise<boolean> {
    try {
      const anime = await this.getAnimeById(animeId);
      return anime !== null;
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return false;
    }
  }

  async isAnimeInListeARegarder(animeId: string): Promise<boolean> {
    try {
      const result = await db.select().from(listeARegarder).where(eq(listeARegarder.animeId, animeId));
      return result.length > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return false;
    }
  }

  async isEpisodeVu(animeId: string, numeroEpisode: number): Promise<boolean> {
    try {
      const result = await db.select()
        .from(episodesVus)
        .where(
          and(
            eq(episodesVus.animeId, animeId),
            eq(episodesVus.numeroEpisode, numeroEpisode)
          )
        );
      return result.length > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return false;
    }
  }

  // === GESTION DES CATÉGORIES ===

  async ajouterCategoriesAnime(animeId: string, categories: string[]): Promise<void> {
    try {
      const categoriesData = categories.map(categorie => ({
        animeId,
        categorie,
      }));

      if (categoriesData.length > 0) {
        await db.insert(categoriesAnimes).values(categoriesData);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout des catégories:', error);
      throw new Error('Impossible d\'ajouter les catégories');
    }
  }

  async getCategoriesAnime(animeId: string): Promise<string[]> {
    try {
      const result = await db.select()
        .from(categoriesAnimes)
        .where(eq(categoriesAnimes.animeId, animeId));
      
      return result.map(row => row.categorie);
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      return [];
    }
  }

  // === STATISTIQUES ===

  async getStatistiques() {
    try {
      const collection = await this.getCollection();
      const listeAttente = await this.getListeARegarder();
      
      let totalEpisodesVus = 0;
      let totalEpisodesDisponibles = 0;

      for (const anime of collection) {
        const episodesVus = await this.getNombreEpisodesVusPourAnime(anime.id);
        totalEpisodesVus += episodesVus;
        totalEpisodesDisponibles += anime.nombreEpisodesTotal || 0;
      }

      return {
        nombreAnimesCollection: collection.length,
        nombreAnimesARegarder: listeAttente.length,
        totalEpisodesVus,
        totalEpisodesDisponibles,
        pourcentageProgression: totalEpisodesDisponibles > 0 
          ? Math.round((totalEpisodesVus / totalEpisodesDisponibles) * 100) 
          : 0,
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {
        nombreAnimesCollection: 0,
        nombreAnimesARegarder: 0,
        totalEpisodesVus: 0,
        totalEpisodesDisponibles: 0,
        pourcentageProgression: 0,
      };
    }
  }

  // === UTILITAIRES ===

  async clear(): Promise<void> {
    try {
      await db.delete(episodesVus);
      await db.delete(categoriesAnimes);
      await db.delete(listeARegarder);
      await db.delete(collectionAnimes);
    } catch (error) {
      console.error('Erreur lors du nettoyage de la base:', error);
      throw new Error('Impossible de nettoyer la base de données');
    }
  }
}

// Export de l'instance singleton
export const databaseService = DatabaseService.getInstance();