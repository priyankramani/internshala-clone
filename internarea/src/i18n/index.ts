import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import en from "./locales/en.json";
import es from "./locales/es.json";
import hi from "./locales/hi.json";
import pt from "./locales/pt.json";
import zh from "./locales/zh.json";
import fr from "./locales/fr.json";
const savedLang = typeof window !== "undefined" ? localStorage.getItem("lang") : "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      hi: { translation: hi },
      pt: { translation: pt },
      zh: { translation: zh },
      fr: { translation: fr },
    },
    lng: savedLang || "en", // 👈 use saved language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;