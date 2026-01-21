import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {t('common.language')}:
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => changeLanguage('en')}
          className={`px-3 py-1 text-sm rounded ${
            i18n.language === 'en'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => changeLanguage('de')}
          className={`px-3 py-1 text-sm rounded ${
            i18n.language === 'de'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          DE
        </button>
      </div>
    </div>
  );
}
