'use client';

import { useTranslate } from '@tolgee/react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleCheck,
  Compass,
  Focus,
  FolderKanban,
  Globe2,
  Layers3,
  ListTodo,
  Menu,
  Plus,
  ScanEye,
  Shapes,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import Image from 'next/image';

import type { Locale } from '@/shared/config/i18n';
import { Button } from '@/shared/ui/button';

import styles from './landing-page.module.css';
import { ProductPreview } from './product-preview';

const navigation = ['benefits', 'workflow', 'features', 'faq'];
const pillarIcons = [Focus, Layers3, UsersRound, ArrowUpRight];
const principleIcons = [ScanEye, Shapes, UsersRound, Compass];

function Brand({ small = false }: { small?: boolean }) {
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

function SectionHeading({
  section,
}: {
  section: 'benefits' | 'workflow' | 'features' | 'principles' | 'faq';
}) {
  const { t } = useTranslate();
  return (
    <div className={styles.sectionHeading}>
      <span className={styles.eyebrow}>
        <span />
        {t(`${section}.eyebrow`)}
      </span>
      <h2 id={`${section}-title`}>{t(`${section}.title`)}</h2>
      <p>{t(`${section}.description`)}</p>
    </div>
  );
}

export function LandingPage({
  locale,
  changeLocale,
}: {
  locale: Locale;
  changeLocale: (value: string) => Promise<void>;
}) {
  const { t } = useTranslate();

  return (
    <div className={styles.landing} id="top">
      <a className={styles.skipLink} href="#main">
        {t('navigation.skip')}
      </a>
      <header className={styles.header}>
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
          <form action={changeLocale.bind(null, locale === 'en' ? 'ru' : 'en')}>
            <button
              className={styles.languageButton}
              type="submit"
              aria-label={`${t('language.label')}: ${locale === 'en' ? t('language.russian') : t('language.english')}`}
            >
              <Globe2 size={14} />
              <span>{locale === 'en' ? 'RU' : 'EN'}</span>
            </button>
          </form>
          <Button asChild className={styles.headerCta}>
            <a href="#workflow">
              {t('navigation.explore')}
              <ArrowUpRight size={13} />
            </a>
          </Button>
          <details className={styles.mobileNav}>
            <summary aria-label={t('navigation.menu')}>
              <Menu size={20} />
            </summary>
            <nav aria-label={t('navigation.label')}>
              {navigation.map((section) => (
                <a key={section} href={`#${section}`}>
                  {t(`navigation.${section}`)}
                </a>
              ))}
            </nav>
          </details>
        </div>
      </header>
      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <span />
              {t('hero.eyebrow')}
            </span>
            <h1 id="hero-title">{t('hero.title')}</h1>
            <p className={styles.heroDescription}>{t('hero.description')}</p>
            <div className={styles.heroActions}>
              <Button asChild>
                <a href="#workflow">
                  {t('hero.action')}
                  <ArrowRight size={15} />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="#benefits">
                  {t('hero.secondary')}
                  <ArrowDown size={14} />
                </a>
              </Button>
            </div>
            <p className={styles.heroNote}>
              <span />
              {t('hero.note')}
            </p>
          </div>
          <figure className={styles.heroFigure}>
            <div className={styles.heroScene}>
              <Image
                src="/images/mountain-backdrop.webp"
                alt=""
                fill
                priority
                sizes="(max-width: 1100px) 100vw, 1064px"
                className={styles.backdrop}
              />
              <div className={styles.sceneShade} />
              <div className={styles.heroPreview}>
                <ProductPreview />
              </div>
            </div>
            <figcaption>{t('preview.caption')}</figcaption>
          </figure>
          <div className={styles.pillars}>
            {pillarIcons.map((Icon, index) => (
              <div key={index}>
                <h3>
                  <Icon size={15} />
                  {t(`pillars.${index}.title`)}
                </h3>
                <p>{t(`pillars.${index}.description`)}</p>
              </div>
            ))}
          </div>
        </section>
        <section
          className={styles.section}
          id="benefits"
          aria-labelledby="benefits-title"
        >
          <SectionHeading section="benefits" />
          <div className={styles.benefitGrid}>
            <div className={styles.benefitList}>
              {[0, 1, 2, 3].map((index) => (
                <details key={index} name="benefits" open={index === 0}>
                  <summary>
                    {t(`benefits.items.${index}.title`)}
                    <Plus size={15} />
                  </summary>
                  <p>{t(`benefits.items.${index}.description`)}</p>
                </details>
              ))}
            </div>
            <div className={styles.focusArtwork}>
              <div className={styles.artworkGrid} />
              <span className={styles.artworkOrb} />
              <div className={styles.focusCard}>
                <span className={styles.eyebrow}>
                  <span />
                  {t('preview.label')}
                </span>
                <span className={styles.focusTitle}>
                  <Focus size={20} />
                  {t('pillars.0.title')}
                </span>
                <div className={styles.focusTask}>
                  <span className={styles.taskCheck}>
                    <Check size={12} />
                  </span>
                  <span>{t('preview.taskFive')}</span>
                </div>
                <div className={styles.focusTask}>
                  <span className={styles.taskCircle} />
                  <span>{t('preview.taskOne')}</span>
                </div>
                <div className={styles.focusTask}>
                  <span className={styles.taskCircle} />
                  <span>{t('preview.taskTwo')}</span>
                </div>
                <div className={styles.focusProgress}>
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <span className={styles.artworkCaption}>01 / TRIPLEP</span>
            </div>
          </div>
        </section>
        <section
          className={styles.section}
          id="workflow"
          aria-labelledby="workflow-title"
        >
          <SectionHeading section="workflow" />
          <div className={styles.workflowGrid}>
            {[0, 1, 2].map((index) => (
              <div key={index} className={styles.workflowStep}>
                <span>{t(`workflow.steps.${index}.number`)}</span>
                <div>
                  <h3>{t(`workflow.steps.${index}.title`)}</h3>
                  <p>{t(`workflow.steps.${index}.description`)}</p>
                </div>
                <ArrowUpRight size={18} />
              </div>
            ))}
          </div>
        </section>
        <section
          className={styles.section}
          id="features"
          aria-labelledby="features-title"
        >
          <SectionHeading section="features" />
          <div className={styles.featureGrid}>
            {[0, 1, 2].map((index) => (
              <article key={index} className={styles.featureCard}>
                <div className={styles.featureVisual}>
                  <div className={styles.featureVisualTop}>
                    <span />
                    <span />
                    <span />
                    <span className={styles.visualConcept}>
                      {t('preview.label')}
                    </span>
                  </div>
                  {index === 0 ? (
                    <div className={styles.projectVisual}>
                      <FolderKanban size={28} />
                      <strong>{t('features.cards.0.sample')}</strong>
                      <span>{t('features.cards.0.detail')}</span>
                      <div>
                        <i />
                        <i />
                        <i />
                      </div>
                    </div>
                  ) : index === 1 ? (
                    <div className={styles.taskVisual}>
                      <span>
                        <ListTodo size={14} />
                        {t('preview.inProgress')}
                      </span>
                      <strong>{t('features.cards.1.sample')}</strong>
                      <span className={styles.taskTag}>
                        {t('preview.design')}
                      </span>
                      <div>
                        <span className={styles.taskCheck}>
                          <Check size={10} />
                        </span>
                        <span>{t('features.cards.1.detail')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.peopleVisual}>
                      <div>
                        <span>
                          <UsersRound size={26} />
                        </span>
                        <span>
                          <UsersRound size={26} />
                        </span>
                        <span>
                          <UsersRound size={26} />
                        </span>
                      </div>
                      <strong>{t('features.cards.2.sample')}</strong>
                      <span>{t('features.cards.2.detail')}</span>
                    </div>
                  )}
                </div>
                <div className={styles.featureCopy}>
                  <span className={styles.eyebrow}>
                    <span />
                    {t(`features.cards.${index}.badge`)}
                  </span>
                  <h3>{t(`features.cards.${index}.title`)}</h3>
                  <p>{t(`features.cards.${index}.description`)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.section} aria-labelledby="principles-title">
          <SectionHeading section="principles" />
          <div className={styles.principleGrid}>
            {principleIcons.map((Icon, index) => (
              <div key={index}>
                <Icon size={35} strokeWidth={1} />
                <h3>{t(`principles.items.${index}.title`)}</h3>
                <p>{t(`principles.items.${index}.description`)}</p>
              </div>
            ))}
          </div>
        </section>
        <section
          className={styles.section}
          id="faq"
          aria-labelledby="faq-title"
        >
          <SectionHeading section="faq" />
          <div className={styles.faqGrid}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <details key={index}>
                <summary>
                  {t(`faq.items.${index}.question`)}
                  <ChevronDown size={15} />
                </summary>
                <p>{t(`faq.items.${index}.answer`)}</p>
              </details>
            ))}
          </div>
        </section>
        <section className={styles.closing} aria-labelledby="closing-title">
          <div className={styles.closingCopy}>
            <span className={styles.eyebrow}>
              <span />
              {t('cta.eyebrow')}
            </span>
            <h2 id="closing-title">{t('cta.title')}</h2>
            <p>{t('cta.description')}</p>
            <Button asChild>
              <a href="#top">
                {t('cta.action')}
                <ArrowUpRight size={14} />
              </a>
            </Button>
          </div>
          <div className={styles.closingArt}>
            <Image
              src="/images/mountain-backdrop.webp"
              fill
              alt=""
              sizes="(max-width: 700px) 100vw, 530px"
              className={styles.backdrop}
            />
            <div className={styles.sceneShade} />
            <div className={styles.closingMark}>
              <Brand />
              <span>{t('footer.concept')}</span>
            </div>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div>
            <a href="#top" aria-label="TripleP">
              <Brand small />
            </a>
            <p>{t('footer.description')}</p>
          </div>
          <div className={styles.footerLinks}>
            <span>{t('footer.product')}</span>
            <a href="#benefits">{t('footer.about')}</a>
            <a href="#workflow">{t('footer.workflow')}</a>
            <a href="#features">{t('footer.features')}</a>
            <a href="#faq">{t('footer.questions')}</a>
          </div>
          <div className={styles.footerStatus}>
            <Sparkles size={15} />
            <span>{t('footer.concept')}</span>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© {t('footer.copyright')}</span>
          <a href="#top">
            {t('footer.back')}
            <ArrowUpRight size={12} />
          </a>
          <CircleCheck size={13} aria-hidden="true" />
        </div>
      </footer>
    </div>
  );
}
