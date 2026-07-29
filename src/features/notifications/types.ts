export interface Notification {
  id: string;
  title: string | null;
  message: string | null;
  url: string | null;
  type: "info" | "success" | "warning" | "danger";
  lue: boolean;
  created_at: string;
}
