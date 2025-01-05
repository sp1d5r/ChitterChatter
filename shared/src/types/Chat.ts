import { Identifiable } from "../services/database/DatabaseInterface";

export interface ChatData extends Identifiable {
    platform: string | null;
    conversationType: string | null;
    chatFile: File | null;
    members: string[];
}