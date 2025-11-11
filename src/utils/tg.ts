import WebApp from "@twa-dev/sdk";

export type TGUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  phone?: string; // у Telegram его нет в initData, позже возьмём из профиля
};

export function initTelegramWebApp() {
  try {
    // Если запущено в Telegram
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp as typeof WebApp;
      tg.ready();
      return tg;
    }
  } catch {}
  return null;
}
