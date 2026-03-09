import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return <main className="mx-auto max-w-md p-8"><h1 className="mb-6 text-2xl font-bold">Inscription</h1><form className="space-y-3"><Input placeholder="Nom" /><Input type="email" placeholder="Email" /><Input type="password" placeholder="Mot de passe" /><Button type="submit">Créer le compte</Button></form></main>;
}
