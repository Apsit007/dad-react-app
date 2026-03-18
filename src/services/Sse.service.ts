// src/services/Sse.service.ts
export interface SseMessage<T = any> {
    raw: string;
    data: T | null;
}
export class SseService<T = any> {
    private eventSource: EventSource | null = null;
    private url: string;

    constructor(url?: string) {
        this.url = url ?? import.meta.env.VITE_SSE_URL;
        //console.log("🔗 Init SSE with URL:", this.url);
    }

    connect(
        onMessage: (msg: SseMessage<T>) => void,
        onError?: (err: any) => void
    ) {
        this.eventSource = new EventSource(this.url);

        this.eventSource.onopen = () => {
            //console.log("✅ SSE connected to", this.url);
        };

        // ฟังทั้ง message ปกติ
        this.eventSource.onmessage = (event: MessageEvent) => {
            //console.log("📥 [message] raw:", event.data);
            this.handleMessage(event, onMessage);
        };

        // ฟัง custom event "lpr"
        this.eventSource.addEventListener("gate_opened", (event: MessageEvent) => {
            //console.log("📥 [lpr] raw:", event.data);
            this.handleMessage(event, onMessage);
        });

        this.eventSource.onerror = (err) => {
            console.error("❌ SSE error:", err);
            if (onError) onError(err);
        };
    }

    private handleMessage(event: MessageEvent, onMessage: (msg: SseMessage<T>) => void) {
        let parsed: T | null = null;
        try {
            parsed = JSON.parse(event.data);
        } catch {
            // ignore parse error
        }
        onMessage({ raw: event.data, data: parsed });
    }

    close() {
        if (this.eventSource) {
            //console.log("🛑 SSE closed");
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}
//ถ้า server ส่ง event "message" → ยังเข้าได้ตามปกติ

//ถ้า server ส่ง event "lpr" → จะเห็น log 📥 [lpr] raw: แล้ว callback msg.data จะถูกเรียก

