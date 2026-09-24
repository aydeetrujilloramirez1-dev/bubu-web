"use client";
import { useState } from "react";
import { login } from "../actions";
import { useRouter } from "next/navigation";

export default function Login() {
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await login(String(f.get("user")), String(f.get("password")));
    if (r.error) setErr(r.error); else router.push("/admin");
  }
  const router = useRouter();
  return (
    <main className="mx-auto max-w-sm px-5 py-16">
      <h2 className="mb-5 text-2xl font-black">Panel de administración</h2>
      <form onSubmit={submit} className="grid gap-3">
        <input className="fld" name="user" placeholder="Usuario" autoComplete="username" required />
        <input className="fld" name="password" type="password" placeholder="Contraseña" autoComplete="current-password" required />
        {err && <small className="text-red-600">{err}</small>}
        <button className="btn btn-primary">Ingresar</button>
      </form>
    </main>
  );
}