import { z } from 'zod';

// Valid categories and conditions based on database enums
const VALID_CATEGORIES = ['vehicles', 'dolls', 'board-games', 'outdoor', 'educational', 'other'] as const;
const VALID_CONDITIONS = ['new', 'like-new', 'used'] as const;

// Israeli phone number regex (supports formats: 0501234567, 050-1234567, 050 123 4567)
const ISRAELI_PHONE_REGEX = /^0[0-9]{1,2}[-\s]?[0-9]{3}[-\s]?[0-9]{4}$/;

export const ToySubmissionSchema = z.object({
  toy_name: z
    .string()
    .trim()
    .min(2, 'שם הצעצוע חייב להכיל לפחות 2 תווים')
    .max(100, 'שם הצעצוע יכול להכיל עד 100 תווים')
    .refine((val) => !/<[^>]*>/g.test(val), 'תווים לא חוקיים בשם הצעצוע'),
  
  category: z.enum(VALID_CATEGORIES, {
    errorMap: () => ({ message: 'קטגוריה לא חוקית' }),
  }),
  
  condition: z.enum(VALID_CONDITIONS, {
    errorMap: () => ({ message: 'מצב לא חוקי' }),
  }),
  
  price: z
    .number()
    .int('המחיר חייב להיות מספר שלם')
    .positive('המחיר חייב להיות חיובי')
    .max(100000, 'המחיר המקסימלי הוא ₪100,000'),
  
  city: z
    .string()
    .trim()
    .min(2, 'שם העיר חייב להכיל לפחות 2 תווים')
    .max(50, 'שם העיר יכול להכיל עד 50 תווים')
    .refine((val) => !/<[^>]*>/g.test(val), 'תווים לא חוקיים בשם העיר'),
  
  seller_phone: z
    .string()
    .transform((val) => val.replace(/[-\s]/g, '')) // Normalize phone
    .refine((val) => ISRAELI_PHONE_REGEX.test(val.replace(/[-\s]/g, '')) || /^0[0-9]{9}$/.test(val), {
      message: 'מספר טלפון לא חוקי',
    }),
  
  images: z
    .array(z.string().url('כתובת תמונה לא חוקית'))
    .min(1, 'חובה להעלות לפחות תמונה אחת')
    .max(5, 'ניתן להעלות עד 5 תמונות')
    .refine(
      (urls) => urls.every((url) => url.includes('supabase.co/storage')),
      'כתובת תמונה לא מורשית'
    ),
});

export type ToySubmission = z.infer<typeof ToySubmissionSchema>;

// Validation function that returns structured result
export function validateToySubmission(data: unknown): {
  success: boolean;
  data?: ToySubmission;
  errors?: { field: string; message: string }[];
} {
  const result = ToySubmissionSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
  
  return { success: false, errors };
}

// File validation for image uploads
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'סוג קובץ לא נתמך. ניתן להעלות תמונות בפורמט JPEG, PNG, WebP או GIF בלבד',
    };
  }
  
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: 'גודל הקובץ עולה על 5MB',
    };
  }
  
  return { valid: true };
}
