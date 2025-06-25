// hooks/useDatabase.ts - Correction du problème de chargement en boucle
import { and, desc, eq } from 'drizzle-orm';
import { useEffect, useState } from 'react';
import { db } from '../db/index';
import { collectionAnimes, episodesVus, listeARegarder } from '../db/schema';

export interface CollectionAnime {
  id: string;
  kitsuId: string;
  title: string;
  titre: string;
  episodeCount: number;
  nombreEpisodesTotal: number;
  watchedEpisodes: number;
  nombreEpisodesVus: number;
  status: 'watching' | 'completed' | 'plan_to_watch' | 'dropped';
  statut: 'watching' | 'completed' | 'plan_to_watch' | 'dropped';
  posterImage: string;
  imageUrl: string;
  synopsis: string;
  averageRating: number;
  noteApi: number;
  startDate: string;
  addedAt: string;
  dateAjout: string;
  titreOriginal?: string;
}

export interface WatchedEpisode {
  id: number;
  animeId: string;
  episodeNumber: number;
  numeroEpisode: number;
  episodeTitle?: string;
  titreEpisode?: string;
  watchedAt: string;
  dateVu: string;
}

export const useCollectionAnimes = () => {
  const [animes, setAnimes] = useState<CollectionAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCollectionAnimes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await db.select().from(collectionAnimes).orderBy(desc(collectionAnimes.dateAjout));
      
      const animesAvecAlias = result.map((anime): CollectionAnime => ({
        id: anime.id,
        kitsuId: anime.id,
        title: anime.titre,
        titre: anime.titre,
        episodeCount: anime.nombreEpisodesTotal || 0,
        nombreEpisodesTotal: anime.nombreEpisodesTotal || 0,
        watchedEpisodes: 0,
        nombreEpisodesVus: 0,
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
      const now = new Date().toISOString();
      
      // CORRECTION : Vérifier si l'anime existe déjà avant d'insérer
      const existingAnime = await db
        .select()
        .from(collectionAnimes)
        .where(eq(collectionAnimes.id, anime.kitsuId))
        .limit(1);
      
      if (existingAnime.length > 0) {
        console.log('Anime déjà dans la collection');
        return false;
      }
      
      await db.insert(collectionAnimes).values({
        id: anime.kitsuId,
        titre: anime.title,
        titreOriginal: anime.titleOriginal || null,
        synopsis: anime.synopsis,
        imageUrl: anime.posterImage, // CORRECTION : Bien stocker l'URL de l'image
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

  const markEpisodeAsWatched = async (animeId: string, episodeNumber: number, episodeTitle?: string) => {
    try {
      const now = new Date().toISOString();
      
      // CORRECTION : Vérifier si l'épisode est déjà marqué comme vu
      const existingEpisode = await db
        .select()
        .from(episodesVus)
        .where(
          and(
            eq(episodesVus.animeId, animeId),
            eq(episodesVus.numeroEpisode, episodeNumber)
          )
        )
        .limit(1);
      
      if (existingEpisode.length > 0) {
        console.log('Episode déjà marqué comme vu');
        return true; // Retourner true car l'épisode est effectivement "vu"
      }
      
      await db.insert(episodesVus).values({
        animeId: animeId,
        numeroEpisode: episodeNumber,
        titreEpisode: episodeTitle || null,
        dateVu: now,
        notePersonnelle: null
      });

      await db.update(collectionAnimes)
        .set({ dateModification: now })
        .where(eq(collectionAnimes.id, animeId));

      // CORRECTION : Ne pas recharger toute la collection, juste notifier le changement
      return true;
    } catch (err) {
      console.error('Erreur markEpisodeAsWatched:', err);
      return false;
    }
  };

  const removeAnimeFromCollection = async (animeId: string) => {
    try {
      await db.delete(episodesVus).where(eq(episodesVus.animeId, animeId));
      await db.delete(collectionAnimes).where(eq(collectionAnimes.id, animeId));
      
      await loadCollectionAnimes();
      return true;
    } catch (err) {
      console.error('Erreur removeAnimeFromCollection:', err);
      return false;
    }
  };

  const isAnimeInCollection = async (kitsuId: string): Promise<boolean> => {
    try {
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

  const verifierSiDansCollection = (kitsuId: string): boolean => {
    return animes.some(anime => anime.id === kitsuId);
  };

  useEffect(() => {
    loadCollectionAnimes();
  }, []);

  return {
    animes,
    loading,
    error,
    collection: animes,
    estEnChargement: loading,
    erreur: error,
    addAnimeToCollection,
    ajouterAnime,
    markEpisodeAsWatched,
    removeAnimeFromCollection,
    supprimerAnime: removeAnimeFromCollection,
    isAnimeInCollection,
    verifierSiDansCollection,
    refreshCollection: loadCollectionAnimes,
    recharger: loadCollectionAnimes
  };
};

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
      
      // CORRECTION : Vérifier si l'épisode est déjà marqué comme vu
      const existingEpisode = await db
        .select()
        .from(episodesVus)
        .where(
          and(
            eq(episodesVus.animeId, animeId),
            eq(episodesVus.numeroEpisode, numeroEpisode)
          )
        )
        .limit(1);
      
      if (existingEpisode.length > 0) {
        console.log('Episode déjà marqué comme vu');
        return true;
      }
      
      await db.insert(episodesVus).values({
        animeId: animeId,
        numeroEpisode: numeroEpisode,
        titreEpisode: titreEpisode || null,
        dateVu: now,
        notePersonnelle: null
      });

      await db.update(collectionAnimes)
        .set({ dateModification: now })
        .where(eq(collectionAnimes.id, animeId));

      // CORRECTION : Recharger seulement les épisodes vus de cet anime
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
      
      const animeResult = await db
        .select()
        .from(collectionAnimes)
        .where(eq(collectionAnimes.id, animeId))
        .limit(1);

      let episodesTotalValue = totalEpisodesFromCollection || 0;
      if (animeResult.length > 0) {
        episodesTotalValue = animeResult[0].nombreEpisodesTotal || totalEpisodesFromCollection || 0;
      }

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