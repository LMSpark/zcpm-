import { ElMessageBox } from "element-plus";
import type { AttachmentMeta } from "@/types";
import { nowText } from "@/utils/format";

export async function confirmAction(message: string, title = "操作确认", type: "warning" | "error" | "info" = "warning") {
  await ElMessageBox.confirm(message, title, { type, confirmButtonText: "确认", cancelButtonText: "取消" });
}

export async function confirmWithReason(title: string, message: string, inputValue = "审核通过") {
  try {
    const first = await ElMessageBox.confirm(message, title, { type: "warning", confirmButtonText: "继续", cancelButtonText: "取消" });
    if (first !== "confirm") return "";
    const { value } = await ElMessageBox.prompt("请输入操作意见/原因", `${title} - 意见`, {
      inputValue,
      inputPattern: /[\s\S]{2,}/,
      inputErrorMessage: "请至少输入 2 个字符",
      confirmButtonText: "确认提交",
      cancelButtonText: "取消"
    });
    return String(value || inputValue);
  } catch {
    return "";
  }
}

export function mockUpload(
  files: File[],
  ownerType: AttachmentMeta["ownerType"],
  ownerId: string,
  usage: string,
  idFactory: (prefix: string) => string
): AttachmentMeta[] {
  return files.map((file) => ({
    id: idFactory("att"),
    ownerType,
    ownerId,
    usage,
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
    uploadedAt: nowText(),
    status: "已上传"
  }));
}
