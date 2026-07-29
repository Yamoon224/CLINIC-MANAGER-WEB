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
  Pagination,
  PasswordInput,
  Select,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function UserAdmin() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function load(targetPage: number) {
    const [usersRes, { data: rolesData }] = await Promise.all([
      api.fetchUsers(targetPage),
      api.fetchRoles(),
    ]);
    setUsers(usersRes.data);
    setTotalPages(usersRes.meta.last_page);
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
      setError(t("parametres.admin.roleChangeError"));
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
      setError(t("parametres.admin.statusChangeError"));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("parametres.admin.users")}</h3>
        <Button
          variant={showCreateForm ? "outline" : "primary"}
          size="sm"
          onClick={() => setShowCreateForm((v) => !v)}
        >
          {showCreateForm ? t("common.cancel") : `+ ${t("parametres.admin.newUser")}`}
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
          onCreated={() => {
            setShowCreateForm(false);
            load(page);
          }}
        />
      )}

      <Card className="overflow-x-auto p-0">
        <table className="table">
          <thead>
            <tr>
              <th>{t("parametres.admin.name")}</th>
              <th>{t("parametres.admin.email")}</th>
              <th>{t("parametres.admin.role")}</th>
              <th>{t("parametres.admin.status")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="font-medium">{user.name}</td>
                <td className="text-muted">{user.email}</td>
                <td>
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
                <td>
                  <Badge tone={user.is_active ? "success" : "neutral"}>
                    {user.is_active ? t("common.active") : t("common.inactive")}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant={user.is_active ? "danger" : "outline"}
                    size="sm"
                    onClick={() => handleToggleStatus(user)}
                  >
                    {user.is_active
                      ? t("parametres.admin.deactivate")
                      : t("parametres.admin.activate")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users?.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted">
            {t("parametres.admin.noUsers")}
          </p>
        )}
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
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
  const { t } = useTranslation();
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
      setError(t("parametres.admin.createError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Field label={t("profil.fullName")}>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label={t("profil.email")}>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label={t("parametres.security.newPassword")}>
            <PasswordInput
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label={t("parametres.admin.role")}>
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
          {isSubmitting ? t("parametres.admin.creating") : t("parametres.admin.createUser")}
        </Button>
      </form>
    </Card>
  );
}
