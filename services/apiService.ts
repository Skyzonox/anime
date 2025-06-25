// services/apiService.ts - Version avec uniquement l'API Kitsu
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

// URL de l'API Kitsu
const KITSU_BASE_URL = 'https://kitsu.io/api/edge';

// Fonction utilitaire pour créer un timeout compatible React Native
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

// Fonction utilitaire pour récupérer l'URL d'une image
export const getImageUrl = (
  imageObj?: { tiny?: string; small?: string; medium?: string; large?: string; original?: string },
  size: 'tiny' | 'small' | 'medium' | 'large' | 'original' = 'medium'
): string => {
  if (!imageObj) {
    return 'https://picsum.photos/300/400?random=1';
  }

  const kitsuUrl = imageObj[size] || imageObj.medium || imageObj.large || imageObj.small || imageObj.original;
  
  if (kitsuUrl && kitsuUrl.includes('kitsu.io')) {
    return kitsuUrl;
  }
  
  return 'https://picsum.photos/300/400?random=2';
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

// Données de fallback avec images qui fonctionnent vraiment
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
        posterImage: {
          tiny: 'https://picsum.photos/150/200?random=1',
          small: 'https://picsum.photos/200/280?random=1',
          medium: 'https://picsum.photos/300/400?random=1',
          large: 'https://picsum.photos/400/560?random=1',
          original: 'https://picsum.photos/500/700?random=1'
        }
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
        posterImage: {
          tiny: 'https://picsum.photos/150/200?random=2',
          small: 'https://picsum.photos/200/280?random=2',
          medium: 'https://picsum.photos/300/400?random=2',
          large: 'https://picsum.photos/400/560?random=2',
          original: 'https://picsum.photos/500/700?random=2'
        }
      },
      relationships: {}
    },
    {
      id: 'fallback-3',
      type: 'anime',
      attributes: {
        canonicalTitle: 'My Hero Academia',
        titles: { en: 'My Hero Academia', en_jp: 'Boku no Hero Academia', ja_jp: '僕のヒーローアカデミア' },
        synopsis: 'In a world where most people have superpowers called Quirks, a boy without them dreams of becoming a hero.',
        averageRating: 82,
        episodeCount: 138,
        status: 'current',
        subtype: 'TV',
        startDate: '2016-04-03',
        posterImage: {
          tiny: 'https://picsum.photos/150/200?random=3',
          small: 'https://picsum.photos/200/280?random=3',
          medium: 'https://picsum.photos/300/400?random=3',
          large: 'https://picsum.photos/400/560?random=3',
          original: 'https://picsum.photos/500/700?random=3'
        }
      },
      relationships: {}
    },
    {
      id: 'fallback-4',
      type: 'anime',
      attributes: {
        canonicalTitle: 'Demon Slayer: Kimetsu no Yaiba',
        titles: { en: 'Demon Slayer', en_jp: 'Kimetsu no Yaiba', ja_jp: '鬼滅の刃' },
        synopsis: 'A young boy becomes a demon slayer to save his sister who has been turned into a demon.',
        averageRating: 88,
        episodeCount: 26,
        status: 'finished',
        subtype: 'TV',
        startDate: '2019-04-06',
        posterImage: {
          tiny: 'https://picsum.photos/150/200?random=4',
          small: 'https://picsum.photos/200/280?random=4',
          medium: 'https://picsum.photos/300/400?random=4',
          large: 'https://picsum.photos/400/560?random=4',
          original: 'https://picsum.photos/500/700?random=4'
        }
      },
      relationships: {}
    },
    {
      id: 'fallback-5',
      type: 'anime',
      attributes: {
        canonicalTitle: 'Jujutsu Kaisen',
        titles: { en: 'Jujutsu Kaisen', en_jp: 'Jujutsu Kaisen', ja_jp: '呪術廻戦' },
        synopsis: 'Students fight cursed spirits in this supernatural action series about sorcery and dark magic.',
        averageRating: 86,
        episodeCount: 24,
        status: 'upcoming',
        subtype: 'TV',
        startDate: '2024-07-01',
        posterImage: {
          tiny: 'https://picsum.photos/150/200?random=5',
          small: 'https://picsum.photos/200/280?random=5',
          medium: 'https://picsum.photos/300/400?random=5',
          large: 'https://picsum.photos/400/560?random=5',
          original: 'https://picsum.photos/500/700?random=5'
        }
      },
      relationships: {}
    },
    {
      id: 'fallback-6',
      type: 'anime',
      attributes: {
        canonicalTitle: 'Naruto',
        titles: { en: 'Naruto', en_jp: 'Naruto', ja_jp: 'ナルト' },
        synopsis: 'A young ninja with dreams of becoming the strongest ninja and leader of his village.',
        averageRating: 84,
        episodeCount: 220,
        status: 'finished',
        subtype: 'TV',
        startDate: '2002-10-03',
        posterImage: {
          tiny: 'https://picsum.photos/150/200?random=6',
          small: 'https://picsum.photos/200/280?random=6',
          medium: 'https://picsum.photos/300/400?random=6',
          large: 'https://picsum.photos/400/560?random=6',
          original: 'https://picsum.photos/500/700?random=6'
        }
      },
      relationships: {}
    }
  ];
};

// Fonction pour fetch avec Kitsu
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

// 1. Animes actuellement en cours de diffusion
export const fetchCurrentlyAiringAnime = async (): Promise<KitsuAnime[]> => {
  try {
    console.log('🔍 Récupération des animes en cours depuis Kitsu...');
    
    const data = await fetchFromKitsu('/anime?filter[status]=current&sort=-startDate&page[limit]=20&include=categories');
    const animes = data.data || [];
    
    console.log(`✅ ${animes.length} animes en cours récupérés depuis Kitsu`);
    return animes;
  } catch (error) {
    console.error('❌ Erreur fetchCurrentlyAiringAnime:', error);
    console.log('🔄 Utilisation des données de fallback');
    return getFallbackAnimes().filter(anime => anime.attributes.status === 'current');
  }
};

// 2. Animes à venir
export const fetchUpcomingAnime = async (): Promise<KitsuAnime[]> => {
  try {
    console.log('🔍 Récupération des animes à venir depuis Kitsu...');
    
    const data = await fetchFromKitsu('/anime?filter[status]=upcoming&sort=startDate&page[limit]=20&include=categories');
    const animes = data.data || [];
    
    console.log(`✅ ${animes.length} animes à venir récupérés depuis Kitsu`);
    return animes;
  } catch (error) {
    console.error('❌ Erreur fetchUpcomingAnime:', error);
    console.log('🔄 Utilisation des données de fallback');
    return getFallbackAnimes().filter(anime => anime.attributes.status === 'upcoming');
  }
};

// 3. Recherche d'animes par titre
export const searchAnime = async (query: string): Promise<KitsuAnime[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    console.log(`🔍 Recherche: "${query}" sur Kitsu`);
    
    const encodedQuery = encodeURIComponent(query);
    const data = await fetchFromKitsu(`/anime?filter[text]=${encodedQuery}&page[limit]=20`);
    const animes = data.data || [];
    
    console.log(`✅ ${animes.length} résultats trouvés avec Kitsu`);
    return animes;
  } catch (error) {
    console.error('❌ Erreur searchAnime:', error);
    
    // Fallback: recherche dans les données locales
    const fallbackAnimes = getFallbackAnimes();
    const results = fallbackAnimes.filter(anime => 
      anime.attributes.canonicalTitle.toLowerCase().includes(query.toLowerCase()) ||
      anime.attributes.titles.en?.toLowerCase().includes(query.toLowerCase())
    );
    
    console.log(`🔄 ${results.length} résultats de fallback trouvés`);
    return results;
  }
};

// 4. Détails d'un anime par son ID
export const fetchAnimeById = async (id: string): Promise<KitsuAnime | null> => {
  try {
    if (!id) return null;

    console.log(`🔍 Récupération anime ID: ${id} depuis Kitsu`);
    
    // Si c'est un ID de fallback, retourner directement
    if (id.startsWith('fallback-')) {
      const fallbackAnimes = getFallbackAnimes();
      const anime = fallbackAnimes.find(anime => anime.id === id) || null;
      console.log(`✅ Anime fallback récupéré: ${anime?.attributes.canonicalTitle}`);
      return anime;
    }
    
    const data = await fetchFromKitsu(`/anime/${id}`);
    const anime = data.data || null;
    
    if (anime) {
      console.log(`✅ Anime récupéré depuis Kitsu: ${anime.attributes.canonicalTitle}`);
    }
    
    return anime;
  } catch (error) {
    console.error('❌ Erreur fetchAnimeById:', error);
    return null;
  }
};

// 5. Détails d'un épisode par son ID
export const fetchEpisodeById = async (id: string): Promise<KitsuEpisode | null> => {
  try {
    if (!id) return null;

    console.log(`🔍 Récupération épisode ID: ${id} depuis Kitsu`);
    
    const data = await fetchFromKitsu(`/episodes/${id}?include=media`);
    const episode = data.data || null;
    
    if (episode) {
      console.log(`✅ Épisode récupéré depuis Kitsu: ${episode.attributes.canonicalTitle}`);
      return episode;
    }
    
    // Fallback si pas trouvé
    return {
      id,
      type: 'episode',
      attributes: {
        canonicalTitle: `Épisode ${id}`,
        titles: { en: `Episode ${id}` },
        synopsis: 'Synopsis de l\'épisode non disponible',
        number: parseInt(id.split('-').pop() || '1') || 1,
        length: 24,
        airdate: new Date().toISOString().split('T')[0],
        thumbnail: {
          medium: `https://picsum.photos/320/180?random=${id.slice(-3)}`
        }
      },
      relationships: {}
    };
  } catch (error) {
    console.error('❌ Erreur fetchEpisodeById:', error);
    return null;
  }
};

// 6. Épisodes d'un anime
export const fetchEpisodesByAnimeId = async (animeId: string): Promise<KitsuEpisode[]> => {
  try {
    if (!animeId) return [];

    console.log(`🔍 Récupération épisodes pour anime ${animeId} depuis Kitsu`);
    
    const data = await fetchFromKitsu(`/anime/${animeId}/episodes?sort=number&page[limit]=20`);
    const episodes = data.data || [];
    
    if (episodes.length > 0) {
      console.log(`✅ ${episodes.length} épisodes récupérés depuis Kitsu`);
      return episodes;
    }
    
    // Fallback: générer des épisodes de test
    const fallbackEpisodes: KitsuEpisode[] = [];
    for (let i = 1; i <= 12; i++) {
      fallbackEpisodes.push({
        id: `${animeId}-ep-${i}`,
        type: 'episode',
        attributes: {
          canonicalTitle: `Épisode ${i}`,
          titles: { en: `Episode ${i}` },
          synopsis: `Synopsis de l'épisode ${i} - Une aventure passionnante continue...`,
          number: i,
          length: 24,
          airdate: new Date(Date.now() - (12 - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          thumbnail: {
            medium: `https://picsum.photos/320/180?random=${animeId.slice(-1)}${i}`
          }
        },
        relationships: {}
      });
    }
    
    console.log(`🔄 ${fallbackEpisodes.length} épisodes de fallback générés`);
    return fallbackEpisodes;
  } catch (error) {
    console.error('❌ Erreur fetchEpisodesByAnimeId:', error);
    return [];
  }
};

// 7. Catégories d'un anime
export const fetchAnimeCategories = async (animeId: string): Promise<KitsuCategory[]> => {
  try {
    console.log(`🔍 Récupération catégories pour anime ${animeId} depuis Kitsu`);
    
    const data = await fetchFromKitsu(`/anime/${animeId}/categories`);
    const categories = data.data || [];
    
    console.log(`✅ ${categories.length} catégories récupérées depuis Kitsu`);
    return categories;
  } catch (error) {
    console.error('❌ Erreur fetchAnimeCategories:', error);
    
    // Catégories de fallback
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
      },
      {
        id: 'adventure',
        type: 'category',
        attributes: {
          title: 'Adventure',
          description: 'Adventure anime',
          slug: 'adventure',
          childCount: 0
        }
      }
    ];
  }
};

// 8. Toutes les catégories disponibles
export const fetchAllCategories = async (): Promise<KitsuCategory[]> => {
  try {
    console.log('🔍 Récupération de toutes les catégories depuis Kitsu');
    
    const data = await fetchFromKitsu('/categories?page[limit]=40&sort=title');
    const categories = data.data || [];
    
    console.log(`✅ ${categories.length} catégories récupérées depuis Kitsu`);
    return categories;
  } catch (error) {
    console.error('❌ Erreur fetchAllCategories:', error);
    
    return [
      { id: 'action', type: 'category', attributes: { title: 'Action', slug: 'action', childCount: 0 } },
      { id: 'adventure', type: 'category', attributes: { title: 'Adventure', slug: 'adventure', childCount: 0 } },
      { id: 'comedy', type: 'category', attributes: { title: 'Comedy', slug: 'comedy', childCount: 0 } },
      { id: 'drama', type: 'category', attributes: { title: 'Drama', slug: 'drama', childCount: 0 } },
      { id: 'fantasy', type: 'category', attributes: { title: 'Fantasy', slug: 'fantasy', childCount: 0 } },
      { id: 'romance', type: 'category', attributes: { title: 'Romance', slug: 'romance', childCount: 0 } },
      { id: 'sci-fi', type: 'category', attributes: { title: 'Sci-Fi', slug: 'sci-fi', childCount: 0 } },
      { id: 'thriller', type: 'category', attributes: { title: 'Thriller', slug: 'thriller', childCount: 0 } }
    ];
  }
};

// 9. Recherche d'animes par catégorie
export const searchAnimeByCategory = async (categoryId: string): Promise<KitsuAnime[]> => {
  try {
    console.log(`🔍 Recherche par catégorie: ${categoryId} sur Kitsu`);
    
    const data = await fetchFromKitsu(`/categories/${categoryId}/anime?page[limit]=20`);
    const animes = data.data || [];
    
    console.log(`✅ ${animes.length} animes trouvés pour la catégorie ${categoryId}`);
    return animes;
  } catch (error) {
    console.error('❌ Erreur searchAnimeByCategory:', error);
    
    // Retourner quelques animes de fallback
    return getFallbackAnimes().slice(0, 3);
  }
};

// Fonction utilitaire pour les nouveautés
export const fetchLatestAnime = async (): Promise<KitsuAnime[]> => {
  try {
    console.log('🔍 Récupération des nouveautés depuis Kitsu...');
    
    // Récupérer à la fois les animes en cours et à venir
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

    // Si on n'a rien, utiliser les données de fallback
    if (allAnimes.length === 0) {
      console.log('🔄 Utilisation des données de fallback complètes');
      allAnimes = getFallbackAnimes();
    }

    console.log(`✅ ${allAnimes.length} nouveautés récupérées`);
    return allAnimes.slice(0, 20);
  } catch (error) {
    console.error('❌ Erreur fetchLatestAnime:', error);
    return getFallbackAnimes();
  }
};

// Fonction pour vérifier la connectivité à l'API Kitsu
export const checkAPIConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Test de connectivité à Kitsu...');
    
    const { promise: timeoutPromise, controller } = createTimeout(5000);
    
    const fetchPromise = fetch(`${KITSU_BASE_URL}/anime?page[limit]=1`, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    const isConnected = response.ok;
    
    console.log(`🌐 Kitsu API: ${isConnected ? '✅ Connecté' : '❌ Indisponible'}`);
    return isConnected;
  } catch (error) {
    console.error('❌ Erreur de connectivité Kitsu:', error);
    return false;
  }
};