import { createServerInstance } from '@tolgee/react/server';

import { getRequestLocale } from './request-locale';
import { createTolgee } from './tolgee';

export const { getTranslate } = createServerInstance({
  getLocale: getRequestLocale,
  createTolgee: (language) =>
    Promise.resolve(createTolgee().init({ language })),
});
