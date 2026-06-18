/**
 * Utilitaires de compression d'images côté client.
 *
 * Pourquoi : les fichiers photo smartphone font souvent 3-5 Mo.
 * En les uploadant tels quels, on sature la DB Postgres et on ralentit
 * le rendu de la page /annonces (200 cartes × 4 Mo = 800 Mo transférés).
 *
 * Solution : on redimensionne à max 1024px de large et on compresse en
 * JPEG qualité 0.85. Une photo de 4 Mo → ~80-150 Ko en sortie.
 *
 * Format de sortie : data URL `data:image/jpeg;base64,...`
 * Directement stockable dans `Annonce.imageUrls` (tableau String[]).
 */

const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
const JPEG_QUALITY = 0.85;
const MAX_PHOTOS = 3;

export interface CompressedImage {
  dataUrl: string;
  sizeBytes: number;
  width: number;
  height: number;
}

/**
 * Compresse une image File en data URL JPEG.
 *
 * @param file - Fichier image (image/*)
 * @returns Promesse résolvant vers { dataUrl, sizeBytes, width, height }
 * @throws Error si le fichier n'est pas une image ou si la compression échoue
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image');
  }

  // Limite 5 Mo par fichier source (sinon trop lent)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image trop lourde (max 5 Mo par photo)');
  }

  // Lecture du fichier en data URL
  const sourceDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Lecture du fichier échouée'));
    reader.readAsDataURL(file);
  });

  // Chargement dans un <img> pour mesurer les dimensions
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Image corrompue ou non supportée'));
    el.src = sourceDataUrl;
  });

  // Calcul des dimensions cibles (préserve le ratio)
  let { width, height } = img;
  if (width > MAX_WIDTH) {
    height = Math.round((height * MAX_WIDTH) / width);
    width = MAX_WIDTH;
  }
  if (height > MAX_HEIGHT) {
    width = Math.round((width * MAX_HEIGHT) / height);
    height = MAX_HEIGHT;
  }

  // Dessin sur canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas non supporté par ce navigateur');

  // Fond blanc (sinon PNG transparents deviennent noirs en JPEG)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // Export JPEG
  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  // Estimation de la taille en bytes (base64 = 4 chars pour 3 bytes)
  const base64 = dataUrl.split(',')[1] || '';
  const sizeBytes = Math.round((base64.length * 3) / 4);

  return { dataUrl, sizeBytes, width, height };
}

export const IMAGE_UPLOAD_LIMITS = {
  MAX_PHOTOS,
  MAX_WIDTH,
  MAX_HEIGHT,
  JPEG_QUALITY,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 Mo
  MAX_TOTAL_SIZE: 1.5 * 1024 * 1024, // 1.5 Mo total après compression (3 × 500 Ko)
};
