"use client";

import { useEffect, useState } from "react";
import * as api from "./administration-api";
import type { AdminUser } from "./types";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  PasswordInput,
  Select,
} from "@/components/ui";

export function UserAdmin() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [{ data: usersData }, { data: rolesData }] = await Promise.all([
      api.fetchUsers(),
      api.fetchRoles(),
    ]);
    setUsers(usersData);
    setRoles(rolesData);
  }

  async function handleChangeRole(user: AdminUser, role: string) {
    setError(null);
    try {
      const { data } = await api.changeUserRole(user.id, role);
      setUsers(
        (current) => current?.map((u) => (u.id === user.id ? data : u)) ?? null,
      );
    } catch {
      setError("Impossible de changer le rôle de cet utilisateur.");
    }
  }

  async function handleToggleStatus(user: AdminUser) {
    setError(null);
    try {
      const { data } = await api.changeUserStatus(user.id, !user.is_active);
      setUsers(
        (current) => current?.map((u) => (u.id === user.id ? data : u)) ?? null,
      );
    } catch {
      setError("Impossible de changer le statut de cet utilisateur.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Utilisateurs</h3>
        <Button
          variant={showCreateForm ? "outline" : "primary"}
          size="sm"
          onClick={() => setShowCreateForm((v) => !v)}
        >
          {showCreateForm ? "Annuler" : "+ Nouvel utilisateur"}
        </Button>
      </div>

      {error && (
        <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {showCreateForm && (
        <CreateUserForm
          roles={roles}
          onCreated={(user) => {
            setUsers((current) => (current ? [...current, user] : [user]));
            setShowCreateForm(false);
          }}
        />
      )}

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3 text-muted">{user.email}</td>
                <td className="px-4 py-3">
                  <Select
                    value={user.roles[0] ?? ""}
                    onChange={(e) => handleChangeRole(user, e.target.value)}
                    className="w-48"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={user.is_active ? "success" : "neutral"}>
                    {user.is_active ? "Actif" : "Désactivé"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant={user.is_active ? "danger" : "outline"}
                    size="sm"
                    onClick={() => handleToggleStatus(user)}
                  >
                    {user.is_active ? "Désactiver" : "Activer"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users?.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted">
            Aucun utilisateur.
          </p>
        )}
      </Card>
    </div>
  );
}

function CreateUserForm({
  roles,
  onCreated,
}: {
  roles: string[];
  onCreated: (user: AdminUser) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(roles[0] ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { data } = await api.createUser({ name, email, password, role });
      onCreated(data);
    } catch {
      setError("Impossible de créer l'utilisateur. Vérifiez les champs.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom complet">
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Mot de passe">
            <PasswordInput
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label="Rôle">
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {error && (
          <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? "Création..." : "Créer l'utilisateur"}
        </Button>
      </form>
    </Card>
  );
}
