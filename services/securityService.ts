// services/securityService.ts

// Fonction pour nettoyer et valider les chaînes de caractères
export function nettoyerTexte(texte: string): string {
  if (!texte) return '';
  
  // Supprimer les balises HTML potentiellement dangereuses
  const textePropre = texte
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  return textePropre.trim();
}

// Valider une URL d'image
export function validerUrlImage(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    
    // Vérifier que c'est HTTPS
    if (urlObj.protocol !== 'https:') {
      return false;
    }
    
    // Vérifier que c'est un domaine autorisé
    const domainesAutorises = [
      'kitsu.io',
      'media.kitsu.io',
      'via.placeholder.com'
    ];
    
    const domaineTrouve = domainesAutorises.some(domaine => 
      urlObj.hostname === domaine || urlObj.hostname.endsWith('.' + domaine)
    );
    
    return domaineTrouve;
  } catch (error) {
    return false;
  }
}

// Valider un ID d'anime (doit être alphanumérique)
export function validerIdAnime(id: string): boolean {
  if (!id) return false;
  
  // L'ID doit contenir uniquement des lettres, chiffres et tirets
  const regex = /^[a-zA-Z0-9-]+$/;
  return regex.test(id) && id.length > 0 && id.length < 100;
}

// Valider une requête de recherche
export function validerRequeteRecherche(query: string): boolean {
  if (!query) return false;
  
  // Nettoyer la requête
  const queryPropre = nettoyerTexte(query);
  
  // La requête doit faire entre 1 et 100 caractères
  return queryPropre.length > 0 && queryPropre.length <= 100;
}

// Valider un numéro d'épisode
export function validerNumeroEpisode(numero: number): boolean {
  return Number.isInteger(numero) && numero > 0 && numero <= 10000;
}

// Valider une note (doit être entre 1 et 10)
export function validerNote(note: number): boolean {
  return Number.isInteger(note) && note >= 1 && note <= 10;
}

// Valider une priorité (doit être 1, 2 ou 3)
export function validerPriorite(priorite: number): boolean {
  return [1, 2, 3].includes(priorite);
}

// Fonction pour encoder les paramètres d'URL de manière sécurisée
export function encoderParametreUrl(param: string): string {
  return encodeURIComponent(nettoyerTexte(param));
}

// Fonction pour valider et nettoyer les données d'un anime avant insertion en base
export function validerDonneesAnime(anime: any): boolean {
  try {
    // Vérifier les champs obligatoires
    if (!anime.id || !anime.attributes || !anime.attributes.canonicalTitle) {
      return false;
    }
    
    // Valider l'ID
    if (!validerIdAnime(anime.id)) {
      return false;
    }
    
    // Valider l'URL de l'image si elle existe
    if (anime.attributes.posterImage?.medium) {
      if (!validerUrlImage(anime.attributes.posterImage.medium)) {
        return false;
      }
    }
    
    // Valider la note si elle existe
    if (anime.attributes.averageRating !== undefined && anime.attributes.averageRating !== null) {
      if (typeof anime.attributes.averageRating !== 'number' || 
          anime.attributes.averageRating < 0 || 
          anime.attributes.averageRating > 100) {
        return false;
      }
    }
    
    // Valider le nombre d'épisodes si il existe
    if (anime.attributes.episodeCount !== undefined && anime.attributes.episodeCount !== null) {
      if (!Number.isInteger(anime.attributes.episodeCount) || 
          anime.attributes.episodeCount < 0 || 
          anime.attributes.episodeCount > 10000) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la validation des données anime:', error);
    return false;
  }
}

// Fonction pour logger les erreurs de manière sécurisée (sans exposer d'infos sensibles)
export function loggerErreurSecurisee(erreur: any, contexte: string): void {
  const messageGenerique = `Erreur dans ${contexte}`;
  
  // En développement, on peut afficher plus de détails
  if (__DEV__) {
    console.error(messageGenerique, erreur);
  } else {
    // En production, on log seulement un message générique
    console.error(messageGenerique);
  }
}