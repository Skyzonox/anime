// hooks/useAnimeApi.ts - Version corrigée pour les épisodes
import { useEffect, useState } from 'react';
import {
  KitsuAnime,
  KitsuEpisode,
  fetchAnimeById,
  fetchCurrentlyAiringAnime,
  fetchEpisodeById,
  fetchEpisodesByAnimeId,
  fetchUpcomingAnime,
  searchAnime
} from '../services/apiService';

export function useAnimesEnCours() {
  const [animes, setAnimes] = useState<KitsuAnime[]>([]);
  const [estEnChargement, setEstEnChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const chargerAnimes = async () => {
    try {
      setEstEnChargement(true);
      setErreur(null);
      const resultats = await fetchCurrentlyAiringAnime();
      setAnimes(resultats);
    } catch (error) {
      setErreur('Impossible de charger les animes en cours');
      console.error(error);
    } finally {
      setEstEnChargement(false);
    }
  };

  useEffect(() => {
    chargerAnimes();
  }, []);

  return { animes, estEnChargement, erreur, recharger: chargerAnimes };
}

export function useAnimesAVenir() {
  const [animes, setAnimes] = useState<KitsuAnime[]>([]);
  const [estEnChargement, setEstEnChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const chargerAnimes = async () => {
    try {
      setEstEnChargement(true);
      setErreur(null);
      const resultats = await fetchUpcomingAnime();
      setAnimes(resultats);
    } catch (error) {
      setErreur('Impossible de charger les animes à venir');
      console.error(error);
    } finally {
      setEstEnChargement(false);
    }
  };

  useEffect(() => {
    chargerAnimes();
  }, []);

  return { animes, estEnChargement, erreur, recharger: chargerAnimes };
}

export function useRechercheAnime() {
  const [animes, setAnimes] = useState<KitsuAnime[]>([]);
  const [estEnChargement, setEstEnChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const rechercherAnimes = async (requete: string) => {
    if (!requete.trim()) {
      setAnimes([]);
      return;
    }

    try {
      setEstEnChargement(true);
      setErreur(null);
      const resultats = await searchAnime(requete);
      setAnimes(resultats);
    } catch (error) {
      setErreur('Erreur lors de la recherche');
      console.error(error);
    } finally {
      setEstEnChargement(false);
    }
  };

  const viderRecherche = () => {
    setAnimes([]);
    setErreur(null);
  };

  return { 
    animes, 
    estEnChargement, 
    erreur, 
    rechercherAnimes, 
    viderRecherche 
  };
}

export function useDetailsAnime(animeId: string) {
  const [anime, setAnime] = useState<KitsuAnime | null>(null);
  const [estEnChargement, setEstEnChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const chargerAnime = async () => {
    if (!animeId) return;

    try {
      setEstEnChargement(true);
      setErreur(null);
      const resultat = await fetchAnimeById(animeId);
      setAnime(resultat);
    } catch (error) {
      setErreur('Impossible de charger les détails de l\'anime');
      console.error(error);
    } finally {
      setEstEnChargement(false);
    }
  };

  useEffect(() => {
    chargerAnime();
  }, [animeId]);

  return { anime, estEnChargement, erreur, recharger: chargerAnime };
}

// Hook modifié pour mieux gérer les erreurs d'épisodes
export function useEpisodesAnime(animeId: string) {
  const [episodes, setEpisodes] = useState<KitsuEpisode[]>([]);
  const [estEnChargement, setEstEnChargement] = useState(true);
  const [estEnChargementPlus, setEstEnChargementPlus] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [pageActuelle, setPageActuelle] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const chargerEpisodes = async (page: number = 1, append: boolean = false) => {
    if (!animeId) return;

    // Vérifier si l'animeId ressemble à un ID Kitsu valide
    if (animeId.startsWith('anime_') || animeId.includes('_')) {
      console.log('ID non valide pour l\'API Kitsu:', animeId);
      setErreur('Episodes non disponibles pour cet anime');
      setEstEnChargement(false);
      setEstEnChargementPlus(false);
      return;
    }

    try {
      if (page === 1) {
        setEstEnChargement(true);
        setEpisodes([]);
      } else {
        setEstEnChargementPlus(true);
      }
      setErreur(null);
      
      const { episodes: nouveauxEpisodes, hasMore: hasMoreResults, total: totalEpisodes } = 
        await fetchEpisodesByAnimeId(animeId, page, 10);
      
      if (append && page > 1) {
        setEpisodes(prev => [...prev, ...nouveauxEpisodes]);
      } else {
        setEpisodes(nouveauxEpisodes);
      }
      
      setHasMore(hasMoreResults);
      setTotal(totalEpisodes);
      setPageActuelle(page);
    } catch (error) {
      console.error('Erreur lors du chargement des épisodes:', error);
      setErreur('Episodes non disponibles pour cet anime');
      
      // Générer des épisodes de fallback uniquement si c'est la première page
      if (page === 1) {
        const fallbackEpisodes: KitsuEpisode[] = [];
        for (let i = 1; i <= 12; i++) {
          fallbackEpisodes.push({
            id: `fallback-${animeId}-ep-${i}`,
            type: 'episode',
            attributes: {
              canonicalTitle: `Episode ${i}`,
              titles: { en: `Episode ${i}` },
              synopsis: `Synopsis de l'épisode ${i}`,
              number: i,
              length: 24,
              airdate: new Date(Date.now() - (12 - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              thumbnail: {}
            },
            relationships: {}
          });
        }
        setEpisodes(fallbackEpisodes);
        setHasMore(false);
        setTotal(12);
      }
    } finally {
      setEstEnChargement(false);
      setEstEnChargementPlus(false);
    }
  };

  const chargerEpisodesSuivants = async () => {
    if (hasMore && !estEnChargementPlus) {
      await chargerEpisodes(pageActuelle + 1, true);
    }
  };

  const rechargerEpisodes = async () => {
    setPageActuelle(1);
    await chargerEpisodes(1, false);
  };

  useEffect(() => {
    if (animeId) {
      chargerEpisodes(1, false);
    }
  }, [animeId]);

  return { 
    episodes, 
    estEnChargement, 
    estEnChargementPlus,
    erreur, 
    hasMore,
    total,
    pageActuelle,
    chargerEpisodesSuivants,
    recharger: rechargerEpisodes 
  };
}

export function useDetailsEpisode(episodeId: string) {
  const [episode, setEpisode] = useState<KitsuEpisode | null>(null);
  const [estEnChargement, setEstEnChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const chargerEpisode = async () => {
    if (!episodeId) return;

    try {
      setEstEnChargement(true);
      setErreur(null);
      const resultat = await fetchEpisodeById(episodeId);
      setEpisode(resultat);
    } catch (error) {
      setErreur('Impossible de charger les détails de l\'épisode');
      console.error(error);
    } finally {
      setEstEnChargement(false);
    }
  };

  useEffect(() => {
    chargerEpisode();
  }, [episodeId]);

  return { episode, estEnChargement, erreur, recharger: chargerEpisode };
}