// src/services/VideoUploadSse.service.ts
import { SseService, type SseMessage } from "./Sse.service";

export interface UploadProgressEvent {
  event: "upload-progress";
  status: "uploading" | "completed" | "failed";
  id: number;
  file: string;
  percent: number;
  message: string;
  fileInfo?: {
    originalName: string;
    mimeType: string;
    size: number;
    duration: number;
    format: string;
    uploadDate: string;
    path: string;
    url: string;
  };
}

/**
 * SSE สำหรับติดตามสถานะการอัปโหลดวิดีโอแบบเรียลไทม์
 * ใช้ endpoint: https://gcc-app.local/main-api/sse-stream
 */
export class VideoUploadSseService extends SseService<UploadProgressEvent> {
  constructor() {
    // กำหนด URL SSE เฉพาะของวิดีโอ
    super("https://gcc-app.local/main-api/sse-stream");
  }

  listen(
    onProgress: (data: UploadProgressEvent) => void,
    onError?: (err: any) => void
  ) {
    this.connect((msg: SseMessage<UploadProgressEvent>) => {
      if (msg.data?.event === "upload-progress") {
        //console.log("🎬 [SSE Upload]", msg.data);
        onProgress(msg.data);
      }
    }, onError);
  }
}
