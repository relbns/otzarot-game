import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useGameContext } from '../context/GameContext';

const DynamicHead = () => {
  const { language } = useGameContext();

  const titles = {
    en: 'Otzarot',
    he: 'אוצרות או צרות',
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>{titles[language]}</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`${import.meta.env.BASE_URL}apple-touch-icon.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`${import.meta.env.BASE_URL}favicon-32x32.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`${import.meta.env.BASE_URL}favicon-16x16.png`}
        />
        <link rel="manifest" href={`${import.meta.env.BASE_URL}site.webmanifest`} />
        <html lang={language} dir={language === 'he' ? 'rtl' : 'ltr'} />
      </Helmet>
    </HelmetProvider>
  );
};

export default DynamicHead;
