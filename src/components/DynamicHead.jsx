import { Helmet } from 'react-helmet';
import { useGameContext } from '../context/GameContext';

const DynamicHead = () => {
  const { language } = useGameContext();

  // Define titles for each language
  const titles = {
    en: 'Otzarot',
    he: 'אוצרות או צרות',
  };

  return (
    <Helmet>
      {/* Dynamic title based on language */}
      <title>{titles[language]}</title>

      {/* Your favicon links */}
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Set document language attribute */}
      <html lang={language} dir={language === 'he' ? 'rtl' : 'ltr'} />
    </Helmet>
  );
};

export default DynamicHead;
