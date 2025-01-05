export interface ChatData {
    platform: string | null;
    conversationType: string | null;
    chatFile: File | null;
    members: string[];
}