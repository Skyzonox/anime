// Types Kitsu
export interface KitsuAnime {
  id: string;
  type: string;
  attributes: {
    canonicalTitle: string;
    titles: {
      en?: string;
      en_jp?: string;
      ja_jp?: string;
      [key: string]: string | undefined;
    };
    synopsis: string;
    averageRating: number;
    episodeCount: number;
    status: string;
    subtype: string;
    startDate: string;
    endDate?: string;
    posterImage: {
      tiny?: string;
      small?: string;
      medium?: string;
      large?: string;
      original?: string;
    };
    coverImage?: {
      tiny?: string;
      small?: string;
      large?: string;
      original?: string;
    };
  };
  relationships: any;
}

export interface KitsuEpisode {
  id: string;
  type: string;
  attributes: {
    canonicalTitle: string;
    titles: {
      en?: string;
      en_jp?: string;
      ja_jp?: string;
      [key: string]: string | undefined;
    };
    synopsis: string;
    number: number;
    seasonNumber?: number;
    length?: number;
    airdate?: string;
    thumbnail?: {
      tiny?: string;
      small?: string;
      medium?: string;
      large?: string;
      original?: string;
    };
  };
  relationships: any;
}

export interface KitsuCategory {
  id: string;
  type: string;
  attributes: {
    title: string;
    description?: string;
    slug: string;
    childCount: number;
  };
}

// Base URL de l'API Kitsu
const BASE_URL = 'https://kitsu.io/api/edge';

// Fonction utilitaire pour récupérer l'URL d'une image
export const getImageUrl = (
  imageObj?: { tiny?: string; small?: string; medium?: string; large?: string; original?: string },
  size: 'tiny' | 'small' | 'medium' | 'large' | 'original' = 'medium'
): string => {
  if (!imageObj) {
    return 'https://via.placeholder.com/300x400?text=Pas+d%27image';
  }

  return imageObj[size] || 
         imageObj.medium || 
         imageObj.large || 
         imageObj.small || 
         imageObj.original || 
         'https://via.placeholder.com/300x400?text=Pas+d%27image';
};

// Fonction utilitaire pour récupérer le meilleur titre
export const getBestTitle = (
  titles?: { en?: string; en_jp?: string; ja_jp?: string; [key: string]: string | undefined },
  canonicalTitle?: string
): string => {
  if (!titles && !canonicalTitle) {
    return 'Titre non disponible';
  }

  // Priorité : en > en_jp > canonicalTitle > ja_jp > premier titre disponible
  return titles?.en || 
         titles?.en_jp || 
         canonicalTitle || 
         titles?.ja_jp || 
         Object.values(titles || {})[0] || 
         'Titre non disponible';
};

// Fonction générique pour faire des requêtes à l'API
const fetchFromAPI = async (endpoint: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la requête API:', error);
    throw error;
  }
};

// 1. Animes actuellement en cours de diffusion
export const fetchCurrentlyAiringAnime = async (): Promise<KitsuAnime[]> => {
  try {
    const data = await fetchFromAPI('/anime?filter[status]=current&sort=-startDate&page[limit]=20&include=categories');
    return data.data || [];
  } catch (error) {
    console.error('Erreur fetchCurrentlyAiringAnime:', error);
    return [];
  }
};

// 2. Animes à venir
export const fetchUpcomingAnime = async (): Promise<KitsuAnime[]> => {
  try {
    const data = await fetchFromAPI('/anime?filter[status]=upcoming&sort=startDate&page[limit]=20&include=categories');
    return data.data || [];
  } catch (error) {
    console.error('Erreur fetchUpcomingAnime:', error);
    return [];
  }
};

// 3. Recherche d'animes par titre
export const searchAnime = async (query: string): Promise<KitsuAnime[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    const encodedQuery = encodeURIComponent(query);
    const data = await fetchFromAPI(`/anime?filter[text]=${encodedQuery}&page[limit]=20`);
    return data.data || [];
  } catch (error) {
    console.error('Erreur searchAnime:', error);
    return [];
  }
};

// 4. Détails d'un anime par son ID
export const fetchAnimeById = async (id: string): Promise<KitsuAnime | null> => {
  try {
    if (!id) {
      return null;
    }

    const data = await fetchFromAPI(`/anime/${id}`);
    return data.data || null;
  } catch (error) {
    console.error('Erreur fetchAnimeById:', error);
    return null;
  }
};

// 5. Détails d'un épisode par son ID
export const fetchEpisodeById = async (id: string): Promise<KitsuEpisode | null> => {
  try {
    if (!id) {
      return null;
    }

    const data = await fetchFromAPI(`/episodes/${id}?include=media`);
    return data.data || null;
  } catch (error) {
    console.error('Erreur fetchEpisodeById:', error);
    return null;
  }
};

// 6. Épisodes d'un anime
export const fetchEpisodesByAnimeId = async (animeId: string): Promise<KitsuEpisode[]> => {
  try {
    if (!animeId) {
      return [];
    }

    const data = await fetchFromAPI(`/anime/${animeId}/episodes?sort=number&page[limit]=20`);
    return data.data || [];
  } catch (error) {
    console.error('Erreur fetchEpisodesByAnimeId:', error);
    return [];
  }
};

// 7. Catégories d'un anime
export const fetchAnimeCategories = async (animeId: string): Promise<KitsuCategory[]> => {
  try {
    if (!animeId) {
      return [];
    }

    const data = await fetchFromAPI(`/anime/${animeId}/categories`);
    return data.data || [];
  } catch (error) {
    console.error('Erreur fetchAnimeCategories:', error);
    return [];
  }
};

// 8. Toutes les catégories disponibles
export const fetchAllCategories = async (): Promise<KitsuCategory[]> => {
  try {
    const data = await fetchFromAPI('/categories?page[limit]=40&sort=title');
    return data.data || [];
  } catch (error) {
    console.error('Erreur fetchAllCategories:', error);
    return [];
  }
};

// 9. Recherche d'animes par catégorie
export const searchAnimeByCategory = async (categoryId: string): Promise<KitsuAnime[]> => {
  try {
    if (!categoryId) {
      return [];
    }

    const data = await fetchFromAPI(`/categories/${categoryId}/anime?page[limit]=20`);
    return data.data || [];
  } catch (error) {
    console.error('Erreur searchAnimeByCategory:', error);
    return [];
  }
};

// Fonction utilitaire pour les nouveautés (combine current + upcoming)
export const fetchLatestAnime = async (): Promise<KitsuAnime[]> => {
  try {
    const [current, upcoming] = await Promise.all([
      fetchCurrentlyAiringAnime(),
      fetchUpcomingAnime()
    ]);

    // Mélanger et limiter à 20 résultats
    const combined = [...current, ...upcoming];
    return combined.slice(0, 20);
  } catch (error) {
    console.error('Erreur fetchLatestAnime:', error);
    return [];
  }
};

// Fonction pour vérifier la connectivité à l'API
export const checkAPIConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/anime?page[limit]=1`);
    return response.ok;
  } catch (error) {
    console.error('Pas de connexion à l\'API Kitsu:', error);
    return false;
  }
};