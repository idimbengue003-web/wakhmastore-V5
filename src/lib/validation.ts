import { z } from 'zod';

/**
 * Détecte la présence d'un numéro de téléphone dans un texte.
 * Bloque les tentatives d'insertion de coordonnées téléphoniques
 * dans le titre ou la description d'une annonce.
 *
 * Patterns détectés :
 * - Numéros sénégalais : +221XXXXXXXXX, 00221XXXXXXXXX, 0XXXXXXXXX, 7XXXXXXXX
 * - Séquences de 7+ chiffres consécutifs (numéros internationaux)
 * - Obfuscation courante : espaces, points, tirets entre les chiffres
 * - Mots-clés français de téléphone suivis de chiffres
 */
export function containsPhoneNumber(text: string): boolean {
  if (!text) return false;

  // 1. Supprimer les séparateurs courants pour détecter les séquences de chiffres
  const cleaned = text
    .replace(/[\s.\-–—()/[\]{}]/g, '');

  // 2. Numéros sénégalais avec indicatif — toujours un numéro
  // +221 ou 00221 suivis de 9 chiffres
  if (/(?:\+221|00221)\d{9}/.test(cleaned)) return true;

  // 3. Numéro sénégalais commençant par 7 ou 3 (9 chiffres)
  //    Sauf si c'est clairement un prix (entouré de FCFA/CFA/francs)
  const senegalMatch = cleaned.match(/[73]\d{8}/);
  if (senegalMatch) {
    const idx = cleaned.indexOf(senegalMatch[0]);
    const after = cleaned.slice(idx + senegalMatch[0].length, idx + senegalMatch[0].length + 6);
    if (!/(?:fcfa|cfa|franc)/i.test(after)) return true;
  }

  // 4. Séquence de 8+ chiffres consécutifs (catch-all pour numéros internationaux)
  //    On exclut les séquences qui sont clairement des prix (suivies de FCFA/CFA/F)
  const digitMatches = cleaned.matchAll(/(\d{8,})/g);
  for (const match of digitMatches) {
    const idx = match.index ?? 0;
    const afterText = cleaned.slice(idx + match[0].length, idx + match[0].length + 6);
    if (!/(?:fcfa|cfa|franc)/i.test(afterText)) return true;
  }

  // 5. Mot-clé + chiffres : « tél », « tel », « appeler », « contact », « joindre »
  //    suivi de peu de caractères puis des chiffres
  const keywordPattern = /\b(?:t[eé]l|tel|appelle?r?|contact|joindre|num[eé]ro|num)\b[^\n]{0,15}\d{4,}/i;
  if (keywordPattern.test(text)) return true;

  // 6. Mot-clé WhatsApp + chiffres
  const whatsappPattern = /\b(?:whatsapp|wa|wathsapp|whatsap)\b[^\n]{0,15}\d{4,}/i;
  if (whatsappPattern.test(text)) return true;

  return false;
}

export const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom est trop long'),
  email: z.string().email('Email invalide').max(100, 'Email trop long'),
  phone: z.string().min(1, 'Le numéro de téléphone est obligatoire').refine(
    (val) => /^(\+221|0)?[0-9]{9}$/.test(val.replace(/\s/g, '')),
    'Numéro de téléphone sénégalais invalide'
  ),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100, 'Mot de passe trop long')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const annonceSchema = z.object({
  title: z.string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(100, 'Le titre est trop long')
    .refine(
      (val) => !containsPhoneNumber(val),
      'Les numéros de téléphone ne sont pas autorisés dans le titre. Utilisez les champs Téléphone/WhatsApp ci-dessous.'
    ),
  description: z.string()
    .max(1000, 'La description est trop longue')
    .optional()
    .refine(
      (val) => !val || !containsPhoneNumber(val),
      'Les numéros de téléphone ne sont pas autorisés dans la description. Utilisez les champs Téléphone/WhatsApp ci-dessous.'
    ),
  price: z.number().int().min(0).max(100000000, 'Prix trop élevé'),
  category: z.string().min(1, 'La catégorie est requise'),
  location: z.string().min(1).max(100).default('Dakar'),
  emoji: z.string().default('📦'),
  phone: z.string().optional().refine(
    (val) => !val || /^(\+221|0)?[0-9]{9}$/.test(val.replace(/\s/g, '')),
    'Numéro de téléphone sénégalais invalide'
  ),
  whatsapp: z.string().optional().refine(
    (val) => !val || /^(\+221|0)?[0-9]{9}$/.test(val.replace(/\s/g, '')),
    'Numéro WhatsApp sénégalais invalide'
  ),
});

export const referralApplySchema = z.object({
  referralCode: z.string().min(1, 'Le code de parrainage est requis'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AnnonceInput = z.infer<typeof annonceSchema>;
export type ReferralApplyInput = z.infer<typeof referralApplySchema>;
