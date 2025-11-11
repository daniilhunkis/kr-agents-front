import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initTelegramWebApp } from "../utils/tg";
import { telegramLogin } from "../utils/api";

export default function TelegramLogin() {
  const nav = useNavigate();

  useEffect(() => {
    const tg = initTelegramWebApp();
    const initData = tg?.initData || "";
    if (!initData) {
      // не из Telegram — шлём в профиль для ручного ввода
      nav("/profile", { replace: true });
      return;
    }

    telegramLogin({ initData })
      .then((user) => {
        // если нет ФИО — просим заполнить
        if (!user?.first_name || !user?.last_name || !user?.phone) {
          nav("/profile", { replace: true });
        } else {
          nav("/", { replace: true });
        }
      })
      .catch(() => nav("/profile", { replace: true }));
  }, [nav]);

  return null;
}
