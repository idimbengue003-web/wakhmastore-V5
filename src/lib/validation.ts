import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom est trop long'),
  email: z.string().email('Email invalide').max(100, 'Email trop long'),
  phone: z.string().min(1, 'Le numéro de téléphone est obligatoire').refine(
    (val) => /^(\+221|0)?[0-9]{9}$/.test(val.replace(/\s/g, '')),
    'Numéro de téléphone sénégalais invalide'
  ),
  password: z.string()
    .length(4, 'Le code PIN doit contenir exactement 4 chiffres')
    .regex(/^[0-9]{4}$/, 'Le code PIN doit contenir uniquement des chiffres'),
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .length(4, 'Le code PIN doit contenir exactement 4 chiffres')
    .regex(/^[0-9]{4}$/, 'Le code PIN doit contenir uniquement des chiffres'),
});

export const annonceSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères').max(100, 'Le titre est trop long'),
  description: z.string().max(1000, 'La description est trop longue').optional(),
  price: z.number().int().min(0).max(100000000, 'Prix trop élevé'),
  category: z.string().min(1, 'La catégorie est requise'),
  location: z.string().min(1).max(100).default('Dakar'),
  emoji: z.string().default('📦'),
  type: z.enum(['je_cherche', 'je_vends']).default('je_cherche'),
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
