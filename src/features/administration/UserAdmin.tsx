"use client";

import { useCallback, useEffect, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import * as api from "./administration-api";
import type { AdminUser } from "./types";
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  Field,
  Input,
  Modal,
  PasswordInput,
  Select,
  type Column,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function UserAdmin() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((targetPage: number) => {
    Promise.all([api.fetchUsers(targetPage), api.fetchRoles()])
      .then(([usersRes, { data: rolesData }]) => {
        setUsers(usersRes.data);
        setTotal(usersRes.meta.total);
        setRoles(rolesData);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(page);
  }, [load, page]);

  async function handleChangeRole(user: AdminUser, role: string) {
    setError(null);
    try {
      const { data } = await api.changeUserRole(user.id, role);
      setUsers((current) => current.map((u) => (u.id === user.id ? data : u)));
    } catch {
      setError(t("parametres.admin.roleChangeError"));
    }
  }

  async function handleToggleStatus(user: AdminUser) {
    setError(null);
    try {
      const { data } = await api.changeUserStatus(user.id, !user.is_active);
      setUsers((current) => current.map((u) => (u.id === user.id ? data : u)));
    } catch {
      setError(t("parametres.admin.statusChangeError"));
    }
  }

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: t("parametres.admin.name"),
      cell: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar initials={u.name.slice(0, 2)} size="md" />
          <div>
            <span className="font-semibold text-heading">{u.name}</span>
            <span className="block text-[13px] text-muted">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: t("parametres.admin.role"),
      cell: (u) => (
        <Select
          value={u.roles[0] ?? ""}
          onChange={(e) => handleChangeRole(u, e.target.value)}
          className="w-48"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Select>
      ),
    },
    {
      key: "status",
      header: t("parametres.admin.status"),
      cell: (u) => (
        <Badge tone={u.is_active ? "success" : "neutral"} border>
          {u.is_active ? t("common.active") : t("common.inactive")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (u) => (
        <div className="flex justify-end">
          <Button
            variant={u.is_active ? "outline" : "primary"}
            size="sm"
            onClick={() => handleToggleStatus(u)}
            className={u.is_active ? "border-danger/40 text-danger hover:bg-danger-light" : ""}
          >
            {u.is_active
              ? t("parametres.admin.deactivate")
              : t("parametres.admin.activate")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <DataTable
        columns={columns}
        rows={users}
        getRowKey={(u) => u.id}
        page={page}
        perPage={15}
        total={total}
        onPageChange={setPage}
        loading={loading}
        emptyLabel={t("parametres.admin.noUsers")}
        toolbarRight={
          <Button
            icon={<IconPlus size={15} />}
            onClick={() => setShowCreateForm(true)}
          >
            {t("parametres.admin.newUser")}
          </Button>
        }
      />

      <Modal
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title={t("parametres.admin.newUser")}
        size="lg"
      >
        <CreateUserForm
          roles={roles}
          onCancel={() => setShowCreateForm(false)}
          onCreated={() => {
            setShowCreateForm(false);
            load(page);
          }}
        />
      </Modal>
    </div>
  );
}

function CreateUserForm({
  roles,
  onCreated,
  onCancel,
}: {
  roles: string[];
  onCreated: (user: AdminUser) => void;
  onCancel: () => void;
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t("profil.fullName")} required>
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t("profil.email")} required>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label={t("parametres.security.newPassword")} required>
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
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="light" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("parametres.admin.creating")
            : t("parametres.admin.createUser")}
        </Button>
      </div>
    </form>
  );
}
