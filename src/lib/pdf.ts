import { downloadFile } from "./download";

/** @deprecated use downloadFile from "@/lib/download" directly for new code. */
export async function openPdf(path: string, fallbackFilename = "document.pdf"): Promise<void> {
  return downloadFile(path, fallbackFilename, "application/pdf");
}
