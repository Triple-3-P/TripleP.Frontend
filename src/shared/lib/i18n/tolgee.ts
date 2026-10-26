import { FormatSimple, Tolgee } from '@tolgee/web';

import { translationCatalogs } from '@/shared/config/i18n';

export function createTolgee() {
  return Tolgee()
    .use(FormatSimple())
    .updateDefaults({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      availableLanguages: ['en', 'ru'],
      staticData: translationCatalogs,
    });
}
