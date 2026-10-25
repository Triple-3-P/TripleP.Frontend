import en from './en.json';
import ru from './ru.json';

export type TLocale = 'en' | 'ru';
export const translationCatalogs = { en, ru } satisfies Record<
  TLocale,
  Record<keyof typeof en, string>
>;

export function isLocale(value: unknown): value is TLocale {
  return value === 'en' || value === 'ru';
}
