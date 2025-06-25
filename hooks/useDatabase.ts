// hooks/useDatabase.ts - Refactorisé pour utiliser Drizzle ORM
import { desc, eq } from 'drizzle-orm';
import { useEffect, useState } from 'react';
import { db } from '../db/index';
import { collectionAnimes, episodesVus, listeARegarder } from '../db/schema';

// Types pour la base de données
export interface CollectionAnime {
  id: string;
  kitsuId?: string;
  title: string;
  titre: string; // Alias pour correspondre à votre code
  episodeCount: number;
  nombreEpisodesTotal: number; // Alias pour correspondre à votre code
  watchedEpisodes: number;
  nombreEpisodesVus: number; // Alias pour correspondre à votre code
  status: 'watching' | 'completed' | 'plan_to_watch' | 'dropped';
  statut: 'watching' | 'completed' | 'plan_to_watch' | 'dropped'; // Alias
  posterImage: string;
  imageUrl: string; // Alias pour posterImage
  synopsis: string;
  averageRating: number;
  noteApi: number; // Alias pour averageRating
  startDate: string;
  addedAt: string;
  dateAjout: string; // Alias pour addedAt
  titreOriginal?: string;
}

export interface WatchedEpisode {
  id: number;
  animeId: string;
  episodeNumber: number;
  numeroEpisode: number; // Alias
  episodeTitle?: string;
  titreEpisode?: string; // Alias
  watchedAt: string;
  dateVu: string; // Alias
}

// Hook pour gérer les animes de la collection
export const useCollectionAnimes = () => {
  const [animes, setAnimes] = useState<CollectionAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les animes de la collection
  const loadCollectionAnimes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await db.select().from(collectionAnimes).orderBy(desc(collectionAnimes.dateAjout));
      
      // Transformer les données pour correspondre à l'interface
      const animesAvecAlias = result.map((anime): CollectionAnime => ({
        id: anime.id,
        kitsuId: anime.id, // Utiliser l'ID comme kitsuId
        title: anime.titre,
        titre: anime.titre,
        episodeCount: anime.nombreEpisodesTotal || 0,
        nombreEpisodesTotal: anime.nombreEpisodesTotal || 0,
        watchedEpisodes: 0, // Sera calculé séparément
        nombreEpisodesVus: 0, // Sera calculé séparément
        status: 'plan_to_watch',
        statut: 'plan_to_watch',
        posterImage: anime.imageUrl || '',
        imageUrl: anime.imageUrl || '',
        synopsis: anime.synopsis || '',
        averageRating: anime.noteApi || 0,
        noteApi: anime.noteApi || 0,
        startDate: '',
        addedAt: anime.dateAjout,
        dateAjout: anime.dateAjout,
        titreOriginal: anime.titreOriginal || undefined
      }));

      // Calculer le nombre d'épisodes vus pour chaque anime
      for (const anime of animesAvecAlias) {
        const episodesVusCount = await db
          .select()
          .from(episodesVus)
          .where(eq(episodesVus.animeId, anime.id));
        
        anime.watchedEpisodes = episodesVusCount.length;
        anime.nombreEpisodesVus = episodesVusCount.length;
      }
      
      setAnimes(animesAvecAlias);
    } catch (err) {
      setError('Erreur lors du chargement de la collection');
      console.error('Erreur loadCollectionAnimes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un anime à la collection
  const addAnimeToCollection = async (anime: {
    kitsuId: string;
    title: string;
    titleOriginal?: string;
    episodeCount: number;
    posterImage: string;
    synopsis: string;
    averageRating: number;
    startDate: string;
  }) => {
    try {
      const id = `anime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      await db.insert(collectionAnimes).values({
        id: id,
        titre: anime.title,
        titreOriginal: anime.titleOriginal || null,
        synopsis: anime.synopsis,
        imageUrl: anime.posterImage,
        noteApi: anime.averageRating,
        statut: 'plan_to_watch',
        nombreEpisodesTotal: anime.episodeCount,
        dateAjout: now,
        dateModification: now
      });

      await loadCollectionAnimes();
      return true;
    } catch (err) {
      console.error('Erreur addAnimeToCollection:', err);
      return false;
    }
  };

  // Ajouter un anime à la collection (version simplifiée)
  const ajouterAnime = async (anime: any) => {
    return await addAnimeToCollection({
      kitsuId: anime.id,
      title: anime.attributes.canonicalTitle,
      episodeCount: anime.attributes.episodeCount || 0,
      posterImage: anime.attributes.posterImage?.medium || '',
      synopsis: anime.attributes.synopsis || '',
      averageRating: anime.attributes.averageRating || 0,
      startDate: anime.attributes.startDate || ''
    });
  };

  // Marquer un épisode comme vu
  const markEpisodeAsWatched = async (animeId: string, episodeNumber: number, episodeTitle?: string) => {
    try {
      const now = new Date().toISOString();
      
      // Ajouter l'épisode aux vus (ou le remplacer)
      await db.insert(episodesVus).values({
        animeId: animeId,
        numeroEpisode: episodeNumber,
        titreEpisode: episodeTitle || null,
        dateVu: now,
        notePersonnelle: null
      });

      // Mettre à jour la date de modification de l'anime
      await db.update(collectionAnimes)
        .set({ dateModification: now })
        .where(eq(collectionAnimes.id, animeId));

      await loadCollectionAnimes();
      return true;
    } catch (err) {
      console.error('Erreur markEpisodeAsWatched:', err);
      return false;
    }
  };

  // Supprimer un anime de la collection
  const removeAnimeFromCollection = async (animeId: string) => {
    try {
      // Supprimer tous les épisodes vus associés
      await db.delete(episodesVus).where(eq(episodesVus.animeId, animeId));
      
      // Supprimer l'anime de la collection
      await db.delete(collectionAnimes).where(eq(collectionAnimes.id, animeId));
      
      await loadCollectionAnimes();
      return true;
    } catch (err) {
      console.error('Erreur removeAnimeFromCollection:', err);
      return false;
    }
  };

  // Vérifier si un anime est dans la collection
  const isAnimeInCollection = async (kitsuId: string): Promise<boolean> => {
    try {
      // Chercher par titre ou ID (car on stocke l'ID Kitsu comme ID principal)
      const result = await db
        .select()
        .from(collectionAnimes)
        .where(eq(collectionAnimes.id, kitsuId))
        .limit(1);
      
      return result.length > 0;
    } catch (err) {
      console.error('Erreur isAnimeInCollection:', err);
      return false;
    }
  };

  // Vérifier si un anime est dans la collection (version synchrone pour compatibilité)
  const verifierSiDansCollection = (kitsuId: string): boolean => {
    return animes.some(anime => anime.id === kitsuId || anime.kitsuId === kitsuId);
  };

  // Charger les données au démarrage
  useEffect(() => {
    loadCollectionAnimes();
  }, []);

  return {
    animes,
    loading,
    error,
    collection: animes, // Alias pour correspondre à votre code
    estEnChargement: loading, // Alias pour correspondre à votre code
    erreur: error, // Alias pour correspondre à votre code
    addAnimeToCollection,
    ajouterAnime, // Alias pour correspondre à votre code
    markEpisodeAsWatched,
    removeAnimeFromCollection,
    supprimerAnime: removeAnimeFromCollection, // Alias pour correspondre à votre code
    isAnimeInCollection,
    verifierSiDansCollection, // Version synchrone
    refreshCollection: loadCollectionAnimes,
    recharger: loadCollectionAnimes // Alias pour correspondre à votre code
  };
};

// Hook pour la liste à regarder
export const useListeARegarder = () => {
  const [liste, setListe] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadListe = async () => {
    try {
      setLoading(true);
      const result = await db.select().from(listeARegarder).orderBy(desc(listeARegarder.dateAjout));
      setListe(result);
    } catch (err) {
      console.error('Erreur loadListe:', err);
    } finally {
      setLoading(false);
    }
  };

  const ajouterALaListe = async (anime: any) => {
    try {
      const now = new Date().toISOString();
      
      await db.insert(listeARegarder).values({
        animeId: anime.id,
        titre: anime.attributes.canonicalTitle,
        imageUrl: anime.attributes.posterImage?.medium || null,
        dateAjout: now,
        priorite: 1
      });

      await loadListe();
      return true;
    } catch (err) {
      console.error('Erreur ajouterALaListe:', err);
      return false;
    }
  };

  const verifierSiDansListe = (animeId: string): boolean => {
    return liste.some(item => item.animeId === animeId);
  };

  useEffect(() => {
    loadListe();
  }, []);

  return {
    liste,
    loading,
    ajouterALaListe,
    verifierSiDansListe,
    recharger: loadListe
  };
};

// Hook pour les épisodes vus d'un anime spécifique
export const useEpisodesVus = (animeId: string) => {
  const [episodesVusData, setEpisodesVusData] = useState<WatchedEpisode[]>([]);

  const loadEpisodesVus = async () => {
    if (!animeId) return;

    try {
      const result = await db
        .select()
        .from(episodesVus)
        .where(eq(episodesVus.animeId, animeId))
        .orderBy(desc(episodesVus.dateVu));
      
      // Transformer les données pour correspondre à l'interface
      const episodesAvecAlias = result.map((episode): WatchedEpisode => ({
        id: episode.id!,
        animeId: episode.animeId,
        episodeNumber: episode.numeroEpisode,
        numeroEpisode: episode.numeroEpisode,
        episodeTitle: episode.titreEpisode || undefined,
        titreEpisode: episode.titreEpisode || undefined,
        watchedAt: episode.dateVu,
        dateVu: episode.dateVu
      }));
      
      setEpisodesVusData(episodesAvecAlias);
    } catch (err) {
      console.error('Erreur loadEpisodesVus:', err);
    }
  };

  const verifierSiVu = (numeroEpisode: number): boolean => {
    return episodesVusData.some(ep => ep.numeroEpisode === numeroEpisode);
  };

  const marquerCommeVu = async (numeroEpisode: number, titreEpisode?: string): Promise<boolean> => {
    if (!animeId) return false;

    try {
      const now = new Date().toISOString();
      
      await db.insert(episodesVus).values({
        animeId: animeId,
        numeroEpisode: numeroEpisode,
        titreEpisode: titreEpisode || null,
        dateVu: now,
        notePersonnelle: null
      });

      // Mettre à jour la date de modification dans la collection
      await db.update(collectionAnimes)
        .set({ dateModification: now })
        .where(eq(collectionAnimes.id, animeId));

      await loadEpisodesVus();
      return true;
    } catch (err) {
      console.error('Erreur marquerCommeVu:', err);
      return false;
    }
  };

  useEffect(() => {
    if (animeId) {
      loadEpisodesVus();
    }
  }, [animeId]);

  return {
    episodesVus: episodesVusData,
    verifierSiVu,
    marquerCommeVu,
    recharger: loadEpisodesVus
  };
};

// Hook pour les épisodes vus (version alternative pour compatibilité)
export const useWatchedEpisodes = (animeId: string) => {
  const { episodesVus, verifierSiVu, marquerCommeVu, recharger } = useEpisodesVus(animeId);
  
  const watchedEpisodes = episodesVus.map(ep => ep.numeroEpisode);

  return {
    watchedEpisodes,
    refreshWatchedEpisodes: recharger,
    isEpisodeWatched: verifierSiVu,
    markAsWatched: marquerCommeVu
  };
};

// Hook pour la progression d'un anime spécifique
export const useProgressionAnime = (animeId: string, totalEpisodesFromCollection?: number) => {
  const [episodesVusCount, setEpisodesVusCount] = useState(0);
  const [episodesTotal, setEpisodesTotal] = useState(0);
  const [pourcentage, setPourcentage] = useState(0);
  const [estTermine, setEstTermine] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProgression = async () => {
    if (!animeId) return;

    try {
      setLoading(true);
      
      // Récupérer les infos de l'anime dans la collection
      const animeResult = await db
        .select()
        .from(collectionAnimes)
        .where(eq(collectionAnimes.id, animeId))
        .limit(1);

      let episodesTotalValue = totalEpisodesFromCollection || 0;
      if (animeResult.length > 0) {
        episodesTotalValue = animeResult[0].nombreEpisodesTotal || totalEpisodesFromCollection || 0;
      }

      // Compter les épisodes vus
      const episodesVusResult = await db
        .select()
        .from(episodesVus)
        .where(eq(episodesVus.animeId, animeId));

      const episodesVusValue = episodesVusResult.length;
      const pourcentageValue = episodesTotalValue > 0 ? (episodesVusValue / episodesTotalValue) * 100 : 0;
      const estTermineValue = episodesTotalValue > 0 && episodesVusValue >= episodesTotalValue;

      setEpisodesVusCount(episodesVusValue);
      setEpisodesTotal(episodesTotalValue);
      setPourcentage(Math.round(pourcentageValue));
      setEstTermine(estTermineValue);
    } catch (err) {
      console.error('Erreur loadProgression:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (animeId) {
      loadProgression();
    }
  }, [animeId, totalEpisodesFromCollection]);

  return {
    episodesVus: episodesVusCount,
    episodesTotal,
    nombreEpisodesVus: episodesVusCount,
    nombreEpisodesTotal: episodesTotal,
    pourcentage,
    pourcentageProgression: pourcentage,
    estTermine,
    loading,
    refreshProgression: loadProgression
  };
};