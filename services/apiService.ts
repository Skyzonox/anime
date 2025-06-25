// services/apiService.ts - Version corrigée sans emojis
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

const KITSU_BASE_URL = 'https://kitsu.io/api/edge';

// Fonction pour obtenir une image par défaut basée sur le titre
const getDefaultImage = (title: string = '', size: string = 'medium'): string => {
  const colors = ['4F46E5', '7C3AED', 'DB2777', 'DC2626', 'EA580C', '16A34A', '0891B2'];
  const colorIndex = title.length % colors.length;
  const color = colors[colorIndex];
  
  const dimensions = {
    tiny: '110x156',
    small: '284x402', 
    medium: '390x554',
    large: '550x780',
    original: '550x780'
  };
  
  const dim = dimensions[size as keyof typeof dimensions] || dimensions.medium;
  const encodedTitle = encodeURIComponent(title.substring(0, 20));
  
  return `https://via.placeholder.com/${dim}/${color}/FFFFFF?text=${encodedTitle}`;
};

// Fonction utilitaire pour récupérer l'URL d'une image
export const getImageUrl = (
  imageObj?: { tiny?: string; small?: string; medium?: string; large?: string; original?: string },
  size: 'tiny' | 'small' | 'medium' | 'large' | 'original' = 'medium',
  fallbackTitle: string = ''
): string => {
  // Essayer d'abord l'image de la taille demandée
  if (imageObj && imageObj[size]) {
    return imageObj[size]!;
  }
  
  // Essayer les autres tailles
  if (imageObj) {
    const alternatives = [imageObj.medium, imageObj.large, imageObj.small, imageObj.original, imageObj.tiny];
    for (const alt of alternatives) {
      if (alt) return alt;
    }
  }
  
  // Retourner une image par défaut
  return getDefaultImage(fallbackTitle, size);
};

// Fonction utilitaire pour récupérer le meilleur titre
export const getBestTitle = (
  titles?: { en?: string; en_jp?: string; ja_jp?: string; [key: string]: string | undefined },
  canonicalTitle?: string
): string => {
  if (!titles && !canonicalTitle) {
    return 'Titre non disponible';
  }

  return titles?.en || 
         titles?.en_jp || 
         canonicalTitle || 
         titles?.ja_jp || 
         Object.values(titles || {})[0] || 
         'Titre non disponible';
};

// Données de fallback
const getFallbackAnimes = (): KitsuAnime[] => {
  return [
    {
      id: 'fallback-1',
      type: 'anime',
      attributes: {
        canonicalTitle: 'Attack on Titan',
        titles: { en: 'Attack on Titan', en_jp: 'Shingeki no Kyojin', ja_jp: '進撃の巨人' },
        synopsis: 'Humanity fights for survival against giant humanoid Titans that have brought civilization to the brink of extinction.',
        averageRating: 87,
        episodeCount: 25,
        status: 'finished',
        subtype: 'TV',
        startDate: '2013-04-07',
        posterImage: {}
      },
      relationships: {}
    },
    {
      id: 'fallback-2',
      type: 'anime',
      attributes: {
        canonicalTitle: 'One Piece',
        titles: { en: 'One Piece', en_jp: 'One Piece', ja_jp: 'ワンピース' },
        synopsis: 'Follow Monkey D. Luffy on his quest to become the Pirate King with his diverse crew of Straw Hat Pirates.',
        averageRating: 85,
        episodeCount: 1000,
        status: 'current',
        subtype: 'TV',
        startDate: '1999-10-20',
        posterImage: {}
      },
      relationships: {}
    }
  ];
};

const createTimeout = (ms: number): { promise: Promise<never>; controller: AbortController } => {
  const controller = new AbortController();
  const promise = new Promise<never>((_, reject) => {
    const timeout = setTimeout(() => {
      controller.abort();
      reject(new Error('Request timeout'));
    }, ms);
    
    controller.signal.addEventListener('abort', () => {
      clearTimeout(timeout);
    });
  });
  
  return { promise, controller };
};

const fetchFromKitsu = async (endpoint: string): Promise<any> => {
  try {
    const { promise: timeoutPromise, controller } = createTimeout(10000);
    
    const fetchPromise = fetch(`${KITSU_BASE_URL}${endpoint}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      }
    });
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (!response.ok) {
      throw new Error(`Kitsu API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur Kitsu:', error);
    throw error;
  }
};

export const fetchCurrentlyAiringAnime = async (): Promise<KitsuAnime[]> => {
  try {
    console.log('Récupération des animes en cours depuis Kitsu...');
    
    const data = await fetchFromKitsu('/anime?filter[status]=current&sort=-startDate&page[limit]=20&include=categories');
    const animes = data.data || [];
    
    console.log(`${animes.length} animes en cours récupérés depuis Kitsu`);
    return animes;
  } catch (error) {
    console.error('Erreur fetchCurrentlyAiringAnime:', error);
    console.log('Utilisation des données de fallback');
    return getFallbackAnimes().filter(anime => anime.attributes.status === 'current');
  }
};

export const fetchUpcomingAnime = async (): Promise<KitsuAnime[]> => {
  try {
    console.log('Récupération des animes à venir depuis Kitsu...');
    
    const data = await fetchFromKitsu('/anime?filter[status]=upcoming&sort=startDate&page[limit]=20&include=categories');
    const animes = data.data || [];
    
    console.log(`${animes.length} animes à venir récupérés depuis Kitsu`);
    return animes;
  } catch (error) {
    console.error('Erreur fetchUpcomingAnime:', error);
    console.log('Utilisation des données de fallback');
    return getFallbackAnimes().filter(anime => anime.attributes.status === 'upcoming');
  }
};

export const searchAnime = async (query: string): Promise<KitsuAnime[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    console.log(`Recherche: "${query}" sur Kitsu`);
    
    const encodedQuery = encodeURIComponent(query);
    const data = await fetchFromKitsu(`/anime?filter[text]=${encodedQuery}&page[limit]=20`);
    const animes = data.data || [];
    
    console.log(`${animes.length} résultats trouvés avec Kitsu`);
    return animes;
  } catch (error) {
    console.error('Erreur searchAnime:', error);
    
    const fallbackAnimes = getFallbackAnimes();
    const results = fallbackAnimes.filter(anime => 
      anime.attributes.canonicalTitle.toLowerCase().includes(query.toLowerCase()) ||
      anime.attributes.titles.en?.toLowerCase().includes(query.toLowerCase())
    );
    
    console.log(`${results.length} résultats de fallback trouvés`);
    return results;
  }
};

export const fetchAnimeById = async (id: string): Promise<KitsuAnime | null> => {
  try {
    if (!id) return null;

    console.log(`Récupération anime ID: ${id} depuis Kitsu`);
    
    if (id.startsWith('fallback-')) {
      const fallbackAnimes = getFallbackAnimes();
      const anime = fallbackAnimes.find(anime => anime.id === id) || null;
      console.log(`Anime fallback récupéré: ${anime?.attributes.canonicalTitle}`);
      return anime;
    }
    
    const data = await fetchFromKitsu(`/anime/${id}`);
    const anime = data.data || null;
    
    if (anime) {
      console.log(`Anime récupéré depuis Kitsu: ${anime.attributes.canonicalTitle}`);
    }
    
    return anime;
  } catch (error) {
    console.error('Erreur fetchAnimeById:', error);
    return null;
  }
};

export const fetchEpisodeById = async (id: string): Promise<KitsuEpisode | null> => {
  try {
    if (!id) return null;

    console.log(`Récupération épisode ID: ${id} depuis Kitsu`);
    
    const data = await fetchFromKitsu(`/episodes/${id}?include=media`);
    const episode = data.data || null;
    
    if (episode) {
      console.log(`Episode récupéré depuis Kitsu: ${episode.attributes.canonicalTitle}`);
      return episode;
    }
    
    return {
      id,
      type: 'episode',
      attributes: {
        canonicalTitle: `Episode ${id}`,
        titles: { en: `Episode ${id}` },
        synopsis: 'Synopsis de l\'épisode non disponible',
        number: parseInt(id.split('-').pop() || '1') || 1,
        length: 24,
        airdate: new Date().toISOString().split('T')[0],
        thumbnail: {}
      },
      relationships: {}
    };
  } catch (error) {
    console.error('Erreur fetchEpisodeById:', error);
    return null;
  }
};

// Fonction modifiée pour supporter la pagination
export const fetchEpisodesByAnimeId = async (
  animeId: string, 
  page: number = 1, 
  limit: number = 10
): Promise<{episodes: KitsuEpisode[], hasMore: boolean, total: number}> => {
  try {
    if (!animeId) return { episodes: [], hasMore: false, total: 0 };

    console.log(`Récupération épisodes pour anime ${animeId}, page ${page}, limite ${limit}`);
    
    const offset = (page - 1) * limit;
    const data = await fetchFromKitsu(`/anime/${animeId}/episodes?sort=number&page[limit]=${limit}&page[offset]=${offset}`);
    const episodes = data.data || [];
    
    // Estimer s'il y a plus d'épisodes
    const hasMore = episodes.length === limit;
    const total = episodes.length > 0 ? (offset + episodes.length + (hasMore ? 1 : 0)) : 0;
    
    if (episodes.length > 0) {
      console.log(`${episodes.length} épisodes récupérés depuis Kitsu (page ${page})`);
      return { episodes, hasMore, total };
    }
    
    // Fallback: générer des épisodes de test
    const fallbackEpisodes: KitsuEpisode[] = [];
    const startEpisode = offset + 1;
    const endEpisode = Math.min(startEpisode + limit - 1, 12); // Max 12 épisodes de test
    
    for (let i = startEpisode; i <= endEpisode; i++) {
      fallbackEpisodes.push({
        id: `${animeId}-ep-${i}`,
        type: 'episode',
        attributes: {
          canonicalTitle: `Episode ${i}`,
          titles: { en: `Episode ${i}` },
          synopsis: `Synopsis de l'épisode ${i} - Une aventure passionnante continue...`,
          number: i,
          length: 24,
          airdate: new Date(Date.now() - (12 - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          thumbnail: {}
        },
        relationships: {}
      });
    }
    
    const fallbackHasMore = endEpisode < 12;
    console.log(`${fallbackEpisodes.length} épisodes de fallback générés`);
    return { episodes: fallbackEpisodes, hasMore: fallbackHasMore, total: 12 };
  } catch (error) {
    console.error('Erreur fetchEpisodesByAnimeId:', error);
    return { episodes: [], hasMore: false, total: 0 };
  }
};

export const fetchAnimeCategories = async (animeId: string): Promise<KitsuCategory[]> => {
  try {
    console.log(`Récupération catégories pour anime ${animeId} depuis Kitsu`);
    
    const data = await fetchFromKitsu(`/anime/${animeId}/categories`);
    const categories = data.data || [];
    
    console.log(`${categories.length} catégories récupérées depuis Kitsu`);
    return categories;
  } catch (error) {
    console.error('Erreur fetchAnimeCategories:', error);
    
    return [
      {
        id: 'action',
        type: 'category',
        attributes: {
          title: 'Action',
          description: 'Action anime',
          slug: 'action',
          childCount: 0
        }
      }
    ];
  }
};

export const fetchAllCategories = async (): Promise<KitsuCategory[]> => {
  try {
    console.log('Récupération de toutes les catégories depuis Kitsu');
    
    const data = await fetchFromKitsu('/categories?page[limit]=40&sort=title');
    const categories = data.data || [];
    
    console.log(`${categories.length} catégories récupérées depuis Kitsu`);
    return categories;
  } catch (error) {
    console.error('Erreur fetchAllCategories:', error);
    
    return [
      { id: 'action', type: 'category', attributes: { title: 'Action', slug: 'action', childCount: 0 } },
      { id: 'adventure', type: 'category', attributes: { title: 'Adventure', slug: 'adventure', childCount: 0 } },
      { id: 'comedy', type: 'category', attributes: { title: 'Comedy', slug: 'comedy', childCount: 0 } }
    ];
  }
};

export const searchAnimeByCategory = async (categoryId: string): Promise<KitsuAnime[]> => {
  try {
    console.log(`Recherche par catégorie: ${categoryId} sur Kitsu`);
    
    const data = await fetchFromKitsu(`/categories/${categoryId}/anime?page[limit]=20`);
    const animes = data.data || [];
    
    console.log(`${animes.length} animes trouvés pour la catégorie ${categoryId}`);
    return animes;
  } catch (error) {
    console.error('Erreur searchAnimeByCategory:', error);
    return getFallbackAnimes().slice(0, 3);
  }
};

export const fetchLatestAnime = async (): Promise<KitsuAnime[]> => {
  try {
    console.log('Récupération des nouveautés depuis Kitsu...');
    
    const [currentAnimes, upcomingAnimes] = await Promise.allSettled([
      fetchCurrentlyAiringAnime(),
      fetchUpcomingAnime()
    ]);

    let allAnimes: KitsuAnime[] = [];

    if (currentAnimes.status === 'fulfilled') {
      allAnimes = [...allAnimes, ...currentAnimes.value.slice(0, 10)];
    }

    if (upcomingAnimes.status === 'fulfilled') {
      allAnimes = [...allAnimes, ...upcomingAnimes.value.slice(0, 10)];
    }

    if (allAnimes.length === 0) {
      console.log('Utilisation des données de fallback complètes');
      allAnimes = getFallbackAnimes();
    }

    console.log(`${allAnimes.length} nouveautés récupérées`);
    return allAnimes.slice(0, 20);
  } catch (error) {
    console.error('Erreur fetchLatestAnime:', error);
    return getFallbackAnimes();
  }
};

export const checkAPIConnection = async (): Promise<boolean> => {
  try {
    console.log('Test de connectivité à Kitsu...');
    
    const { promise: timeoutPromise, controller } = createTimeout(5000);
    
    const fetchPromise = fetch(`${KITSU_BASE_URL}/anime?page[limit]=1`, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    const isConnected = response.ok;
    
    console.log(`Kitsu API: ${isConnected ? 'Connecté' : 'Indisponible'}`);
    return isConnected;
  } catch (error) {
    console.error('Erreur de connectivité Kitsu:', error);
    return false;
  }
};