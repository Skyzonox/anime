// utils/validators.ts

// Valider si une chaîne n'est pas vide
export function estNonVide(valeur: string): boolean {
  return valeur !== null && valeur !== undefined && valeur.trim().length > 0;
}

// Valider un ID d'anime
export function estIdAnimeValide(id: string): boolean {
  if (!estNonVide(id)) return false;
  
  // L'ID doit être alphanumérique avec des tirets autorisés
  const regex = /^[a-zA-Z0-9-]+$/;
  return regex.test(id) && id.length <= 50;
}

// Valider une URL d'image
export function estUrlImageValide(url: string): boolean {
  if (!estNonVide(url)) return false;
  
  try {
    const urlObj = new URL(url);
    
    // Doit être HTTPS
    if (urlObj.protocol !== 'https:') return false;
    
    // Domaines autorisés pour les images
    const domainesAutorises = [
      'kitsu.io',
      'media.kitsu.io',
      'via.placeholder.com',
      'placeholder.com'
    ];
    
    return domainesAutorises.some(domaine => 
      urlObj.hostname === domaine || urlObj.hostname.endsWith('.' + domaine)
    );
  } catch {
    return false;
  }
}

// Valider une requête de recherche
export function estRequeteRechercheValide(requete: string): boolean {
  if (!estNonVide(requete)) return false;
  
  // Entre 1 et 100 caractères
  const requetePropre = requete.trim();
  return requetePropre.length >= 1 && requetePropre.length <= 100;
}

// Valider un numéro d'épisode
export function estNumeroEpisodeValide(numero: number): boolean {
  return Number.isInteger(numero) && numero > 0 && numero <= 99999;
}

// Valider une note personnelle (1-10)
export function estNoteValide(note: number): boolean {
  return Number.isInteger(note) && note >= 1 && note <= 10;
}

// Valider une priorité (1-3)
export function estPrioriteValide(priorite: number): boolean {
  return [1, 2, 3].includes(priorite);
}

// Valider une note d'API (0-100)
export function estNoteApiValide(note: number): boolean {
  return typeof note === 'number' && note >= 0 && note <= 100;
}

// Valider un nombre d'épisodes
export function estNombreEpisodesValide(nombre: number): boolean {
  return Number.isInteger(nombre) && nombre >= 0 && nombre <= 99999;
}

// Valider une date
export function estDateValide(dateString: string): boolean {
  if (!estNonVide(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// Valider un statut d'anime
export function estStatutAnimeValide(statut: string): boolean {
  const statutsValides = [
    'current',
    'finished', 
    'upcoming',
    'tba',
    'unreleased',
    'cancelled'
  ];
  
  return statutsValides.includes(statut);
}

// Valider un type d'anime
export function estTypeAnimeValide(type: string): boolean {
  const typesValides = [
    'TV',
    'movie',
    'OVA',
    'ONA',
    'special',
    'music'
  ];
  
  return typesValides.includes(type);
}

// Valider une durée en minutes
export function estDureeValide(duree: number): boolean {
  return Number.isInteger(duree) && duree > 0 && duree <= 1440; // Max 24h
}

// Valider un titre
export function estTitreValide(titre: string): boolean {
  if (!estNonVide(titre)) return false;
  
  // Entre 1 et 200 caractères
  return titre.trim().length >= 1 && titre.trim().length <= 200;
}

// Valider un synopsis
export function estSynopsisValide(synopsis: string): boolean {
  if (!synopsis) return true; // Le synopsis peut être vide
  
  // Maximum 5000 caractères
  return synopsis.length <= 5000;
}

// Valider les données complètes d'un anime
export function estAnimeValide(anime: any): boolean {
  try {
    // Vérifier la structure de base
    if (!anime || !anime.id || !anime.attributes) {
      return false;
    }
    
    // Valider l'ID
    if (!estIdAnimeValide(anime.id)) {
      return false;
    }
    
    // Valider le titre
    if (!estTitreValide(anime.attributes.canonicalTitle)) {
      return false;
    }
    
    // Valider la note si elle existe
    if (anime.attributes.averageRating !== null && 
        anime.attributes.averageRating !== undefined &&
        !estNoteApiValide(anime.attributes.averageRating)) {
      return false;
    }
    
    // Valider le nombre d'épisodes si il existe
    if (anime.attributes.episodeCount !== null && 
        anime.attributes.episodeCount !== undefined &&
        !estNombreEpisodesValide(anime.attributes.episodeCount)) {
      return false;
    }
    
    // Valider le statut si il existe
    if (anime.attributes.status && !estStatutAnimeValide(anime.attributes.status)) {
      return false;
    }
    
    // Valider l'URL de l'image si elle existe
    if (anime.attributes.posterImage?.medium && 
        !estUrlImageValide(anime.attributes.posterImage.medium)) {
      return false;
    }
    
    // Valider le synopsis si il existe
    if (anime.attributes.synopsis && !estSynopsisValide(anime.attributes.synopsis)) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la validation de l\'anime:', error);
    return false;
  }
}

// Valider les données d'un épisode
export function estEpisodeValide(episode: any): boolean {
  try {
    if (!episode || !episode.id || !episode.attributes) {
      return false;
    }
    
    // Valider le numéro d'épisode
    if (!estNumeroEpisodeValide(episode.attributes.number)) {
      return false;
    }
    
    // Valider le titre si il existe
    if (episode.attributes.canonicalTitle && 
        !estTitreValide(episode.attributes.canonicalTitle)) {
      return false;
    }
    
    // Valider la durée si elle existe
    if (episode.attributes.length !== null && 
        episode.attributes.length !== undefined &&
        !estDureeValide(episode.attributes.length)) {
      return false;
    }
    
    // Valider la date de diffusion si elle existe
    if (episode.attributes.airdate && !estDateValide(episode.attributes.airdate)) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la validation de l\'épisode:', error);
    return false;
  }
}

// Nettoyer et valider les données avant insertion en base
export function nettoyerEtValiderTexte(texte: string, longueurMax: number = 1000): string {
  if (!texte) return '';
  
  // Supprimer les balises HTML dangereuses
  let textePropre = texte
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  // Tronquer si nécessaire
  if (textePropre.length > longueurMax) {
    textePropre = textePropre.substring(0, longueurMax);
  }
  
  return textePropre.trim();
}