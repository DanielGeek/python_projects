"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, NeonLogo } from "@/components/ui/basics";
import { Input, Tabs } from "@/components/ui/interactive";
import { playAsGuest, signIn } from "@/lib/session";

type Mode = "login" | "register";

export function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const user = String(data.get("usuario") ?? "").trim();
    const pass = String(data.get("contrasena") ?? "");
    const mail = String(data.get("correo") ?? "").trim();
    const next: Record<string, string> = {};
    if (!/^[A-Za-z0-9_]{3,12}$/.test(user)) next.usuario = "Usa de 3 a 12 letras, números o guiones bajos.";
    if (pass.length < 8) next.contrasena = "La contraseña debe tener al menos 8 caracteres.";
    if (mode === "register" && !/^\S+@\S+\.\S+$/.test(mail)) next.correo = "Escribe un correo electrónico válido.";
    setErrors(next);
    if (Object.keys(next).length) return;
    // BACKEND: send the credentials to the real auth provider here; the password is never stored locally.
    signIn(user);
    router.push("/");
  }

  function social(provider: string) {
    // BACKEND: start the OAuth flow (e.g. Supabase signInWithOAuth) for this provider.
    setNotice(`El acceso con ${provider} estará disponible cuando conectemos el servidor.`);
  }

  return (
    <div className="av-auth-card">
      <NeonLogo size="md" className="av-auth-logo" />
      <Tabs
        fill
        label="Acceso"
        value={mode}
        onChange={(id) => {
          setMode(id as Mode);
          setErrors({});
        }}
        tabs={[
          { id: "login", label: "Iniciar sesión" },
          { id: "register", label: "Crear cuenta" },
        ]}
      />
      <form className="av-auth-form" onSubmit={submit} noValidate>
        <Input name="usuario" label="Usuario" placeholder="tu_usuario" autoComplete="username" error={errors.usuario} />
        {mode === "register" && (
          <Input name="correo" type="email" label="Correo electrónico" placeholder="jugador@correo.com" autoComplete="email" error={errors.correo} />
        )}
        <Input
          name="contrasena"
          type="password"
          label="Contraseña"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          error={errors.contrasena}
        />
        <Button type="submit" block>
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </Button>
      </form>
      <div className="av-auth-divider">
        <span>O CONTINÚA CON</span>
      </div>
      <div className="av-auth-social">
        <Button variant="outline" size="sm" onClick={() => social("Google")}>
          Google
        </Button>
        <Button variant="outline" size="sm" onClick={() => social("GitHub")}>
          GitHub
        </Button>
      </div>
      {notice && (
        <p className="av-modal-note" role="status">
          {notice}
        </p>
      )}
      <Button
        variant="ghost"
        block
        onClick={() => {
          playAsGuest();
          router.push("/");
        }}
      >
        Jugar como invitado
      </Button>
      <p className="av-auth-caption">Sin cuenta, tus puntuaciones solo se guardan en este dispositivo.</p>
    </div>
  );
}
