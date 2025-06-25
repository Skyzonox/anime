// utils/formatters.ts

// Formater une date en français
export function formaterDate(dateString: string): string {
  if (!dateString) return 'Date inconnue';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Date invalide';
  }
}

// Formater une date relative (il y a X jours)
export function formaterDateRelative(dateString: string): string {
  if (!dateString) return 'Date inconnue';
  
  try {
    const date = new Date(dateString);
    const maintenant = new Date();
    const diffMs = maintenant.getTime() - date.getTime();
    const diffJours = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffJours === 0) return 'Aujourd\'hui';
    if (diffJours === 1) return 'Hier';
    if (diffJours < 7) return `Il y a ${diffJours} jours`;
    if (diffJours < 30) return `Il y a ${Math.floor(diffJours / 7)} semaines`;
    if (diffJours < 365) return `Il y a ${Math.floor(diffJours / 30)} mois`;
    
    return `Il y a ${Math.floor(diffJours / 365)} ans`;
  } catch (error) {
    return 'Date invalide';
  }
}

// Formater la note (sur 100 vers sur 10)
export function formaterNote(note: number): string {
  if (!note && note !== 0) return 'Pas de note';
  
  const noteSur10 = Math.round((note / 100) * 10 * 10) / 10; // Arrondi à 1 décimale
  return `${noteSur10}/10`;
}

// Formater le statut d'un anime
export function formaterStatut(statut: string): string {
  const statusMap: { [key: string]: string } = {
    'current': 'En cours',
    'finished': 'Terminé',
    'upcoming': 'À venir',
    'tba': 'Date à confirmer',
    'unreleased': 'Pas encore sorti',
    'cancelled': 'Annulé'
  };
  
  return statusMap[statut] || statut;
}

// Formater le type d'anime
export function formaterType(type: string): string {
  const typeMap: { [key: string]: string } = {
    'TV': 'Série TV',
    'movie': 'Film',
    'OVA': 'OAV',
    'ONA': 'ONA',
    'special': 'Spécial',
    'music': 'Clip musical'
  };
  
  return typeMap[type] || type;
}

// Formater la durée d'un épisode
export function formaterDuree(dureeMinutes: number): string {
  if (!dureeMinutes && dureeMinutes !== 0) return 'Durée inconnue';
  
  if (dureeMinutes < 60) {
    return `${dureeMinutes} min`;
  }
  
  const heures = Math.floor(dureeMinutes / 60);
  const minutes = dureeMinutes % 60;
  
  if (minutes === 0) {
    return `${heures}h`;
  }
  
  return `${heures}h${minutes.toString().padStart(2, '0')}`;
}

// Formater le nombre d'épisodes
export function formaterNombreEpisodes(nombre: number): string {
  if (!nombre && nombre !== 0) return 'Nombre d\'épisodes inconnu';
  
  if (nombre === 1) return '1 épisode';
  return `${nombre} épisodes`;
}

// Tronquer un texte avec des points de suspension
export function tronquerTexte(texte: string, longueurMax: number): string {
  if (!texte) return '';
  
  if (texte.length <= longueurMax) return texte;
  
  return texte.substring(0, longueurMax).trim() + '...';
}

// Formater le synopsis (enlever les balises HTML et tronquer)
export function formaterSynopsis(synopsis: string, longueurMax: number = 150): string {
  if (!synopsis) return 'Pas de synopsis disponible';
  
  // Enlever les balises HTML
  const synopsisPropre = synopsis.replace(/<[^>]*>/g, '');
  
  return tronquerTexte(synopsisPropre, longueurMax);
}

// Formater la priorité
export function formaterPriorite(priorite: number): string {
  const prioriteMap: { [key: number]: string } = {
    1: 'Basse',
    2: 'Moyenne',
    3: 'Haute'
  };
  
  return prioriteMap[priorite] || 'Inconnue';
}

// Obtenir la couleur pour une priorité
export function getCouleurPriorite(priorite: number): string {
  const couleurMap: { [key: number]: string } = {
    1: '#10B981', // Vert
    2: '#F59E0B', // Orange
    3: '#EF4444'  // Rouge
  };
  
  return couleurMap[priorite] || '#6B7280'; // Gris par défaut
}

// Formater un pourcentage de progression
export function formaterProgression(pourcentage: number): string {
  if (!pourcentage && pourcentage !== 0) return '0%';
  
  return `${Math.round(pourcentage)}%`;
}

// Formater les genres (tableau de strings vers string)
export function formaterGenres(genres: string[]): string {
  if (!genres || genres.length === 0) return 'Aucun genre';
  
  if (genres.length === 1) return genres[0];
  if (genres.length === 2) return genres.join(' et ');
  
  const dernierGenre = genres.pop();
  return genres.join(', ') + ' et ' + dernierGenre;
}

// Capitaliser la première lettre
export function capitaliserPremierLettre(texte: string): string {
  if (!texte) return '';
  
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

// Formater un numéro d'épisode avec zéros devant si nécessaire
export function formaterNumeroEpisode(numero: number, nombreTotalEpisodes?: number): string {
  if (!numero && numero !== 0) return '';
  
  // Déterminer le nombre de chiffres nécessaires
  const nombreChiffres = nombreTotalEpisodes ? nombreTotalEpisodes.toString().length : 2;
  
  return numero.toString().padStart(Math.max(2, nombreChiffres), '0');
}