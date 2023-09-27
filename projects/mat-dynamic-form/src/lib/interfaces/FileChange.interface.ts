export type FileState = 'none' | 'preparing' | 'valid' | 'error';
export interface FileChange {
    state: FileState;
    file?: {
        id: string;
        name: string;
    }
    error?: string;
}