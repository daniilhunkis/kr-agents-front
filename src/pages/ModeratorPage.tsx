import React, { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import type { UserDto } from "../lib/api";
import { getUser, changeModeratorPassword } from "../lib/api";

type Stage = "loading" | "no_access" | "need_password" | "authorized";

export default function ModeratorPage() {
  const [stage, setStage] = useState<Stage>("loading");
  const [user, setUser] = useState<UserDto | null>(null);

  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [changePwdMsg, setChangePwdMsg] = useState<string | null>(null);

  const [isLoadingPwdChange, setIsLoadingPwdChange] = useState(false);

  // ---- 1. Загружаем пользователя по Telegram ID ----
  useEffect(() => {
    const init = async () => {
      try {
        const tgUser = WebApp.initDataUnsafe?.user;
        if (!tgUser) {
          setStage("no_access");
          return;
        }

        const userId = tgUser.id as number;
        const u = await getUser(userId);
        setUser(u);

        // --- Если ADMIN → пропускаем без пароля ---
        if (u.role === "admin") {
          setStage("authorized");
          return;
        }

        // --- Модератор → требуется пароль ---
        if (u.role === "moderator") {
          setStage("need_password");
          return;
        }

        // иначе нет доступа
        setStage("no_access");
      } catch (err) {
        console.error("Ошибка загрузки пользователя для модерации", err);
        setStage("no_access");
      }
    };

    init();
  }, []);

  // ---- 2. Обработка логина по паролю модератора ----
  const handleModeratorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!user) return;

    const storedPwd = (user as any).moderatorPassword as string | undefined;

    if (!storedPwd) {
      setLoginError("Пароль модератора ещё не назначен.");
      return;
    }

    if (loginPassword.trim() === storedPwd) {
      setStage("authorized");
      return;
    }

    setLoginError("Неверный пароль");
  };

  // ---- 3. Смена пароля модератора ----
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!newPwd || newPwd.length < 4) {
      setChangePwdMsg("Новый пароль должен быть не короче 4 символов");
      return;
    }

    setIsLoadingPwdChange(true);
    setChangePwdMsg(null);

    try {
      await changeModeratorPassword(user.id, {
        oldPassword: oldPwd || undefined,
        newPassword: newPwd,
        adminId: user.role === "admin" ? user.id : undefined,
      });

      setUser((prev) =>
        prev ? ({ ...prev, moderatorPassword: newPwd } as any) : prev
      );

      setOldPwd("");
      setNewPwd("");
      setChangePwdMsg("Пароль обновлён!");
    } catch (err) {
      console.error("Ошибка смены пароля модератора", err);
      setChangePwdMsg("Ошибка — старый пароль неверный");
    } finally {
      setIsLoadingPwdChange(false);
    }
  };

  // ---- 4. Рендер ----

  if (stage === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Загрузка...
      </div>
    );
  }

  if (stage === "no_access") {
    return (
      <div className="flex items-center justify-center min-h-screen text-white px-6">
        <div className="bg-card2 rounded-2xl p-6 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold mb-2">Нет доступа</h1>
          <p className="text-sm text-gray-300">
            Эта страница доступна только модератору или администратору.
          </p>
        </div>
      </div>
    );
  }

  // --- Пароль модератора ---
  if (stage === "need_password") {
    return (
      <div className="flex items-center justify-center min-h-screen text-white px-6">
        <form
          onSubmit={handleModeratorLogin}
          className="bg-card2 rounded-2xl p-6 max-w-md w-full flex flex-col gap-4"
        >
          <h1 className="text-2xl font-bold text-center">Пароль модератора</h1>

          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Введите пароль"
            className="rounded-xl bg-card px-4 py-3 text-white border border-gray-700"
          />

          {loginError && (
            <div className="text-center text-red-400 text-sm">
              {loginError}
            </div>
          )}

          <button className="rounded-xl bg-emerald-600 py-3 font-semibold">
            Войти
          </button>
        </form>
      </div>
    );
  }

  // --- Основная панель модерации ---
  return (
    <div className="min-h-screen text-white px-4 pb-24 pt-4">
      <h1 className="text-2xl font-bold mb-2">Панель модератора</h1>
      <p className="text-gray-400 text-sm mb-6">
        {user?.firstName} {user?.lastName} · роль{" "}
        <span className="text-emerald-400 font-semibold">
          {user?.role}
        </span>
      </p>

      {/* Модерация объектов */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Объекты на модерации</h2>
        <div className="bg-card2 p-4 rounded-2xl border border-gray-800">
          <p className="text-sm text-gray-300">
            Здесь появится список объектов (API подключим).
          </p>
        </div>
      </section>

      {/* Смена пароля */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Сменить пароль</h2>

        <form
          onSubmit={handleChangePassword}
          className="bg-card2 p-4 rounded-2xl border border-gray-800 flex flex-col gap-3 max-w-md"
        >
          <input
            type="password"
            value={oldPwd}
            onChange={(e) => setOldPwd(e.target.value)}
            placeholder="Текущий пароль"
            className="rounded-xl bg-card px-4 py-3 border border-gray-700"
          />

          <input
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder="Новый пароль"
            className="rounded-xl bg-card px-4 py-3 border border-gray-700"
            required
          />

          {changePwdMsg && (
            <p className="text-sm text-gray-300">{changePwdMsg}</p>
          )}

          <button
            type="submit"
            disabled={isLoadingPwdChange}
            className="rounded-xl bg-emerald-600 py-3 font-semibold disabled:opacity-60"
          >
            {isLoadingPwdChange ? "Сохранение..." : "Обновить пароль"}
          </button>
        </form>
      </section>
    </div>
  );
}
