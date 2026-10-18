'use client';

import { useTranslate } from '@tolgee/react';
import { Globe2, Menu } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import type { ReactNode } from 'react';

import { isLocale } from '@/shared/config/i18n';
import type { Locale } from '@/shared/config/i18n';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

import styles from './landing-page.module.css';

const navigation = ['benefits', 'workflow', 'features', 'faq'];

export function Brand({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? styles.brandSmall : styles.brand}>
      <span className={styles.brandMark} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>
        triplep<span className={styles.brandPeriod}>.</span>
      </span>
    </span>
  );
}

function useHiddenHeader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let previousY = Math.max(0, window.scrollY);
    let directionStart = previousY;
    let previousDirection = 0;
    let frame = 0;

    function update() {
      frame = 0;
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - previousY;
      if (Math.abs(delta) < 2) return;
      const direction = Math.sign(delta);
      if (direction !== previousDirection) directionStart = previousY;
      if (currentY < 88 || Math.abs(currentY - directionStart) >= 8) {
        setHidden(currentY >= 88 && direction > 0);
      }
      previousY = currentY;
      previousDirection = direction;
    }

    function onScroll() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return hidden;
}

export function LandingHeader({
  locale,
  changeLocale,
  account,
}: {
  locale: Locale;
  changeLocale: (value: string) => Promise<void>;
  account: ReactNode;
}) {
  const { t } = useTranslate();
  const hidden = useHiddenHeader();
  const [isPending, startTransition] = useTransition();
  const [languageError, setLanguageError] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function selectLanguage(value: string) {
    if (!isLocale(value) || value === locale) return;
    setLanguageError(false);
    startTransition(async () => {
      try {
        await changeLocale(value);
      } catch {
        setLanguageError(true);
      }
    });
  }

  return (
    <header
      className={styles.headerShell}
      data-hidden={hidden && !languageOpen && !menuOpen}
    >
      <div className={styles.header}>
        <a href="#top" aria-label="TripleP">
          <Brand small />
        </a>
        <nav className={styles.desktopNav} aria-label={t('navigation.label')}>
          {navigation.map((section) => (
            <a key={section} href={`#${section}`}>
              {t(`navigation.${section}`)}
            </a>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <div className={styles.languageSelect}>
            <Globe2 size={14} aria-hidden="true" />
            <Select
              value={locale}
              onValueChange={selectLanguage}
              disabled={isPending}
              open={languageOpen}
              onOpenChange={setLanguageOpen}
            >
              <SelectTrigger
                className={styles.languageTrigger}
                aria-label={t('language.label')}
                aria-busy={isPending}
                size="sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={styles.controlPopup}
                position="popper"
                align="end"
              >
                <SelectItem value="en" lang="en">
                  {t('language.english')}
                </SelectItem>
                <SelectItem value="ru" lang="ru">
                  {t('language.russian')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {languageError && (
            <span role="alert" className={styles.languageError}>
              {t('language.error')}
            </span>
          )}
          <div className={styles.accountArea}>{account}</div>
          <div className={styles.mobileNav}>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('navigation.menu')}
                >
                  <Menu size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={styles.controlPopup}
                aria-label={t('navigation.label')}
              >
                {navigation.map((section) => (
                  <DropdownMenuItem key={section} asChild>
                    <a href={`#${section}`}>{t(`navigation.${section}`)}</a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
