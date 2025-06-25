// hooks/useAnimeApi.ts
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

// Hook pour récupérer les animes en cours de diffusion
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

// Hook pour récupérer les animes à venir
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

// Hook pour la recherche d'animes
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

// Hook pour récupérer les détails d'un anime
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

// Hook pour récupérer les épisodes d'un anime
export function useEpisodesAnime(animeId: string) {
  const [episodes, setEpisodes] = useState<KitsuEpisode[]>([]);
  const [estEnChargement, setEstEnChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const chargerEpisodes = async () => {
    if (!animeId) return;

    try {
      setEstEnChargement(true);
      setErreur(null);
      const resultats = await fetchEpisodesByAnimeId(animeId);
      setEpisodes(resultats);
    } catch (error) {
      setErreur('Impossible de charger les épisodes');
      console.error(error);
    } finally {
      setEstEnChargement(false);
    }
  };

  useEffect(() => {
    chargerEpisodes();
  }, [animeId]);

  return { episodes, estEnChargement, erreur, recharger: chargerEpisodes };
}

// Hook pour récupérer les détails d'un épisode
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