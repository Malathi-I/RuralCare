import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDoctors } from '../services/doctorService.js';
import { getCenters } from '../services/centerService.js';
import { getInformation } from '../services/infoService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage, LANGUAGES } from '../context/LanguageContext.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import CenterCard from '../components/CenterCard.jsx';
import InfoCard from '../components/InfoCard.jsx';
import SkeletonList from '../components/SkeletonList.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Icon from '../components/Icon.jsx';
import {
  HeroCareIllustration,
  DoctorEmptyIllustration,
  ClinicEmptyIllustration,
  ArticleEmptyIllustration,
  CommunityIllustration,
} from '../components/Illustrations.jsx';

/** Readable article modal shared by the landing page and the info browser. */
export function ArticleModal({ article, onClose }) {
  const { t } = useLanguage();

  if (!article) return null;

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="modal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{article.title}</h2>

          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>

        <div className="info-meta">
          <span className="chip chip--soft">{article.category}</span>
          <span className="chip chip--soft">
            {LANGUAGES.find((item) => item.code === article.language)?.label ||
              article.language}
          </span>
        </div>

        <p className="prose">{article.content}</p>

        <div className="modal__footer">
          <button type="button" className="btn" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [centers, setCenters] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  /**
   * Loads a small preview of each public collection in one pass.
   * Promise.allSettled is used so one failing endpoint never blanks the
   * whole landing page.
   */
  const load = async () => {
    setLoading(true);
    setError('');

    const results = await Promise.allSettled([
      getDoctors(),
      getCenters(),
      getInformation(),
    ]);

    setDoctors(results[0].status === 'fulfilled' ? results[0].value.doctors : []);
    setCenters(results[1].status === 'fulfilled' ? results[1].value.centers : []);
    setArticles(results[2].status === 'fulfilled' ? results[2].value.items : []);

    const failure = results.find((result) => result.status === 'rejected');
    if (failure) setError(failure.reason?.userMessage || '');

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const dashboardPath = user ? `/${user.role}` : '/login';

  const quickActions = [
    {
      to: '/doctors',
      icon: 'stethoscope',
      title: t('doctor.findTitle'),
      text: t('home.actionDoctors'),
      cta: t('home.ctaOpen'),
    },
    {
      to: '/healthcare-centers',
      icon: 'hospital',
      title: t('center.findTitle'),
      text: t('home.actionCenters'),
      cta: t('home.ctaOpen'),
    },
    {
      to: user?.role === 'patient' ? '/patient/book-appointment' : '/register',
      icon: 'calendar',
      title: t('appointment.book'),
      text: t('home.actionBooking'),
      cta: t('home.ctaOpen'),
    },
    {
      to: '/health-information',
      icon: 'book',
      title: t('info.title'),
      text: t('home.actionInfo'),
      cta: t('home.ctaOpen'),
    },
  ];

  const steps = [
    { icon: 'search', title: t('home.step1Title'), text: t('home.step1Text') },
    { icon: 'compare', title: t('home.step2Title'), text: t('home.step2Text') },
    { icon: 'calendar', title: t('home.step3Title'), text: t('home.step3Text') },
    { icon: 'check', title: t('home.step4Title'), text: t('home.step4Text') },
  ];

  const trust = [
    { icon: 'lock', title: t('home.trust1Title'), text: t('home.trust1Text') },
    { icon: 'shield', title: t('home.trust2Title'), text: t('home.trust2Text') },
    { icon: 'offline', title: t('home.trust3Title'), text: t('home.trust3Text') },
  ];

  const benefits = [
    { icon: 'search', title: t('home.benefit1Title'), text: t('home.benefit1Text') },
    { icon: 'globe', title: t('home.benefit2Title'), text: t('home.benefit2Text') },
    { icon: 'wifi', title: t('home.benefit3Title'), text: t('home.benefit3Text') },
    { icon: 'offline', title: t('home.benefit4Title'), text: t('home.benefit4Text') },
    { icon: 'calendar', title: t('home.benefit5Title'), text: t('home.benefit5Text') },
    { icon: 'users', title: t('home.benefit6Title'), text: t('home.benefit6Text') },
  ];
/* ============================================================
   Landing page sections.

   Each block is a small local component so the page reads as a
   composition of reusable pieces rather than one large block of
   markup, and each one handles its own loading/error/empty state.
   ============================================================ */

/** Quick action cards: the four things a visitor mainly wants to do. */
function QuickActions({ items }) {
  return (
    <div className="grid grid--4">
      {items.map((item) => (
        <Link key={item.to} to={item.to} className="action-card">
          <span className="action-card__icon">
            {/* Decorative: the title and CTA carry the meaning. */}
            <Icon name={item.icon} size={22} />
          </span>

          <h3 className="action-card__title">{item.title}</h3>
          <p className="action-card__text">{item.text}</p>

          <span className="action-card__cta">
            {item.cta}
            <Icon name="arrow" size={16} />
          </span>
        </Link>
      ))}
    </div>
  );
}

/** "How RuralCare works" - four numbered steps with a connector on desktop. */
function HowItWorks({ steps }) {
  return (
    <ol className="steps">
      {steps.map((step) => (
        <li className="step" key={step.title}>
          <div className="step__marker">
            <span className="step__number" aria-hidden="true" />
            <span className="step__icon">
              <Icon name={step.icon} size={20} />
            </span>
          </div>

          <h3 className="step__title">{step.title}</h3>
          <p className="step__text">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

/** Trust / security panel. */
function TrustSection({ points }) {
  return (
    <div className="grid grid--3">
      {points.map((point) => (
        <div className="trust-card" key={point.title}>
          <span className="trust-card__icon">
            <Icon name={point.icon} size={20} />
          </span>

          <div>
            <h3 className="trust-card__title">{point.title}</h3>
            <p className="trust-card__text">{point.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Benefit cards shown in the "key platform benefits" section. */
function BenefitCards({ items }) {
  return (
    <div className="grid grid--3">
      {items.map((benefit) => (
        <div className="feature-card" key={benefit.title}>
          <span className="feature-card__icon">
            <Icon name={benefit.icon} size={20} />
          </span>

          <h3 className="feature-card__title">{benefit.title}</h3>
          <p className="feature-card__text">{benefit.text}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty preview block with artwork beside the message.
 * Used only when the API returns no records - no placeholder data is shown.
 */
function ArtEmpty({ art, title, message, alt }) {
  return (
    <div className="empty-state--art">
      {art}
      <h3 className="empty-state__title">{title}</h3>
      {message && <p className="empty-state__text">{message}</p>}
      {/* alt is applied by the illustration itself. */}
      <span className="visually-hidden">{alt}</span>
    </div>
  );
}

/** Live preview of real doctors from the API. */
function FeaturedDoctors({ doctors, loading, error, reload, showBookButton }) {
  const { t } = useLanguage();

  return (
    <section className="section">
      <div className="section__head">
        <h2 className="section__title">{t('home.featuredDoctors')}</h2>
        <p className="section__subtitle">{t('home.featuredDoctorsText')}</p>
      </div>

      <ErrorMessage message={error} onRetry={reload} />

      {loading ? (
        <SkeletonList count={3} />
      ) : doctors.length === 0 ? (
        <ArtEmpty
          art={<DoctorEmptyIllustration alt={t('home.artDoctorEmptyAlt')} />}
          title={t('doctor.noDoctorsTitle')}
          message={t('doctor.noDoctorsText')}
        />
      ) : (
        <div className="grid grid--3">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor._id}
              doctor={doctor}
              showBookButton={showBookButton}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/** Live preview of real healthcare centres from the API. */
function FeaturedCenters({ centers, loading, error, reload }) {
  const { t } = useLanguage();

  return (
    <section className="section">
      <div className="section__head">
        <h2 className="section__title">{t('home.featuredCenters')}</h2>
        <p className="section__subtitle">{t('home.featuredCentersText')}</p>
      </div>

      <ErrorMessage message={error} onRetry={reload} />

      {loading ? (
        <SkeletonList count={2} />
      ) : centers.length === 0 ? (
        <ArtEmpty
          art={<ClinicEmptyIllustration alt={t('home.artClinicEmptyAlt')} />}
          title={t('center.noCentersTitle')}
          message={t('center.noCentersText')}
        />
      ) : (
        <div className="grid grid--3">
          {centers.map((center) => (
            <CenterCard key={center._id} center={center} />
          ))}
        </div>
      )}
    </section>
  );
}

/** Live preview of real health articles from the API. */
function FeaturedArticles({ items, loading, onRead }) {
  const { t } = useLanguage();

  return (
    <section className="section">
      <div className="section__head">
        <h2 className="section__title">{t('home.featuredInfo')}</h2>
        <p className="section__subtitle">{t('home.featuredInfoText')}</p>
      </div>

      {loading ? (
        <SkeletonList count={3} />
      ) : items.length === 0 ? (
        <ArtEmpty
          art={<ArticleEmptyIllustration alt={t('home.artArticleEmptyAlt')} />}
          title={t('info.noInfoTitle')}
          message={t('info.noInfoText')}
        />
      ) : (
        <div className="grid grid--3">
          {items.map((item) => (
            <InfoCard key={item._id} item={item} onRead={onRead} />
          ))}
        </div>
      )}
    </section>
  );
}

  return (
    <div className="stack">
      <section className="hero--landing">
        <div className="hero__layout">
          {/* LEFT: message and actions */}
          <div className="hero__copy">
            <span className="hero__eyebrow">{t('home.eyebrow')}</span>
            <h1 className="hero__title">{t('home.heroTitle')}</h1>
            <p className="hero__text">{t('home.heroText')}</p>

            <div className="hero__actions">
              <Link to={dashboardPath} className="btn">
                {user ? t('nav.dashboard') : t('home.heroCta')}
              </Link>
              <Link to="/doctors" className="btn btn--ghost">
                {t('doctor.findTitle')}
              </Link>
            </div>

            <ul className="hero__trust">
              <li>
                <Icon name="stethoscope" size={17} />
                {t('home.trustDoctors')}
              </li>
              <li>
                <Icon name="globe" size={17} />
                {t('home.trustLanguages')}
              </li>
              <li>
                <Icon name="wifi" size={17} />
                {t('home.trustOffline')}
              </li>
            </ul>
          </div>

          {/* RIGHT: illustration plus two floating highlights. Inline SVG,
              so there is no image request and the box is sized by
              aspect-ratio, which prevents layout shift. */}
          <div className="hero__media">
            <div className="hero__figure">
              <HeroCareIllustration alt={t('home.artHeroAlt')} />
            </div>

            <span className="hero__badge hero__badge--languages">
              <Icon name="globe" size={15} />
              {t('home.badgeLanguages')}
            </span>

            <span className="hero__badge hero__badge--offline">
              <Icon name="wifi" size={15} />
              {t('home.badgeLowBandwidth')}
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">{t('home.quickActions')}</h2>
          <p className="section__subtitle">{t('home.quickActionsText')}</p>
        </div>
        <QuickActions items={quickActions} />
      </section>

      <section className="section section--tinted">
        <div className="section__head">
          <h2 className="section__title">{t('home.howItWorks')}</h2>
          <p className="section__subtitle">{t('home.howItWorksText')}</p>
        </div>
        <HowItWorks steps={steps} />
      </section>

      <FeaturedDoctors
        doctors={doctors}
        loading={loading}
        error={error}
        reload={load}
        showBookButton={user?.role === 'patient'}
      />

      <FeaturedCenters centers={centers} loading={loading} error={error} reload={load} />

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">{t('home.benefits')}</h2>
          <p className="section__subtitle">{t('home.benefitsText')}</p>
        </div>

        <BenefitCards items={benefits} />
      </section>

      <section className="section section--tinted">
        <div className="section__head">
          <h2 className="section__title">{t('home.whyTitle')}</h2>
          <p className="section__subtitle">{t('home.whyText')}</p>
        </div>

        <div className="split-panel">
          <div className="split-panel__text">
            {/* LEFT: the two contrasting statements. */}
            <div className="split-panel__side">
              <span className="split-panel__tag">{t('home.problemTitle')}</span>
              <p className="split-panel__body">{t('home.problemText')}</p>
            </div>

            <div className="split-panel__side">
              <span className="split-panel__tag">{t('home.solutionTitle')}</span>
              <p className="split-panel__body">{t('home.solutionText')}</p>
            </div>
          </div>

          {/* RIGHT: artwork. Decorative, so the surrounding text carries
              the meaning. */}
          <div className="split-panel__art" aria-hidden="true">
            <CommunityIllustration />
          </div>
        </div>
      </section>

      <FeaturedArticles items={articles} loading={loading} onRead={setSelectedArticle} />

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">{t('home.trustTitle')}</h2>
          <p className="section__subtitle">{t('home.trustText')}</p>
        </div>
        <TrustSection points={trust} />
      </section>

      <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </div>
  );
}