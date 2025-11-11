export type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

type TgWebApp = {
  initData: string;
  initDataUnsafe?: {
    user?: TelegramUser;
  };
  ready?: () => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TgWebApp };
  }
}

export function initTelegramWebApp(): TgWebApp | null {
  const tg = window?.Telegram?.WebApp ?? null;
  try {
    tg?.ready?.();
  } catch {}
  return tg;
}
