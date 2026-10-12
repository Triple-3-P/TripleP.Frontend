import en from './en.json';
import ru from './ru.json';

export type Locale = 'en' | 'ru';
export const translationCatalogs = { en, ru } satisfies Record<
  Locale,
  Record<keyof typeof en, string>
>;

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'ru';
}
