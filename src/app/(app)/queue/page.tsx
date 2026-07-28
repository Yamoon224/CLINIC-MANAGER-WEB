import { QueueBoard } from "@/features/queue/QueueBoard";

export default function QueuePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">File d&apos;attente</h1>
      <QueueBoard />
    </div>
  );
}
