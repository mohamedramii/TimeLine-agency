import { createContext, useContext, useMemo } from 'react';
import en from './content/en';
import ar from './content/ar';
import { mediaFiles } from './content/shared';

const dictionaries = { en, ar };
const LangContext = createContext(ar);

export function LangProvider({ lang, children }) {
  return <LangContext.Provider value={dictionaries[lang] || ar}>{children}</LangContext.Provider>;
}

export const useT = () => useContext(LangContext);
export const useRtl = () => useContext(LangContext).dir === 'rtl';

// Media items with their title in the current language.
export function useMedia() {
  const t = useT();
  return useMemo(
    () => Object.fromEntries(Object.entries(mediaFiles).map(([k, v]) => [k, { ...v, title: t.mediaTitles[k] }])),
    [t]
  );
}
