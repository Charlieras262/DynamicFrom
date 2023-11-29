type Error = 'maxFileSize' | 'badFileFormat' | 'noFileFound' | 'corruptFileFormat' | null | undefined;
interface FileStatus {
    error: Error;
    isValid: boolean;
    message: string;
    status: string;
}

const MIME_TYPE_MAP: { [key: string]: string } = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/x-icon': 'ico',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/vnd.oasis.opendocument.text': 'odt',
    'application/vnd.oasis.opendocument.spreadsheet': 'ods',
    'application/vnd.oasis.opendocument.presentation': 'odp',
    'application/x-zip-compressed': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/x-7z-compressed': '7z',
    'application/x-tar': 'tar',
    'application/x-gzip': 'gz',
    'application/x-bzip2': 'bz2',
    'application/x-compressed-tar': 'tar',
    'application/x-compressed': 'tgz',
    'text/plain': 'txt',
    'text/csv': 'csv'
};

const EXTENSIONS_MAP: { [key: string]: string } = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'odt': 'application/vnd.oasis.opendocument.text',
    'ods': 'application/vnd.oasis.opendocument.spreadsheet',
    'odp': 'application/vnd.oasis.opendocument.presentation',
    'zip': 'application/x-zip-compressed',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/x-gzip',
    'bz2': 'application/x-bzip2',
    'tgz': 'application/x-compressed',
    'txt': 'text/plain',
    'csv': 'text/csv',
};

const FILE_ICON_MAP: { [key: string]: string } = {
    'png': 'image.png',
    'jpg': 'image.png',
    'gif': 'image.png',
    'bmp': 'image.png',
    'ico': 'image.png',
    'svg': 'image.png',
    'pdf': 'pdf.png',
    'doc': 'doc.png',
    'docx': 'doc.png',
    'xls': 'xls.png',
    'xlsx': 'xls.png',
    'ppt': 'ppt.png',
    'pptx': 'ppt.png',
    'odt': 'doc.png',
    'ods': 'doc.png',
    'odp': 'doc.png',
    'zip': 'compressed.png',
    'rar': 'compressed.png',
    '7z': 'compressed.png',
    'tar': 'compressed.png',
    'gz': 'compressed.png',
    'bz2': 'compressed.png',
    'tgz': 'compressed.png',
    'txt': 'txt.png',
    'csv': 'csv.png',
}

export class FileUtils {

    /**
     * Find the extension from `mimeType`.
     * 
     * @param mimeType File type string (Ex: 'image/jpeg')
     * @returns File extension (Ex: 'jpg')
     */
    public static getFileExtension(mimeType: string): string {
        return MIME_TYPE_MAP[mimeType];
    }

    /**
     * Find the Mimetype from `extension`.
     * 
     * @param extension File extension string (Ej: 'jpg')
     * @returns Tipo de archivo (Ej: 'image/jpeg')
     */
    public static getMimeType(extension: string): string {
        return EXTENSIONS_MAP[extension];
    }

    /**
     * This method validate the file integrity, type and size.
     * 
     * @param file file to validate
     * @param expectedFileType file types to validate
     * @returns `true` if the file type is as expected, `false` otherwise.
     */
    public static isValidFile(file: File | Blob, expectedFileType: Array<string>, maxFileSize: number): FileStatus {
        if (!file) return {
            error: 'noFileFound',
            isValid: false,
            message: 'No file selected',
            status: '404'
        };

        if (file.size > (maxFileSize * 1024 * 1024)) return {
            isValid: false,
            error: 'maxFileSize',
            message: 'The file size exceeds the maximum allowed',
            status: '400'
        };

        if (expectedFileType.length != 0 && !expectedFileType.includes(this.getFileExtension(file.type))) return {
            isValid: false,
            error: 'badFileFormat',
            message: `The file type does not match the expected types (${expectedFileType.join(', ')}).`,
            status: '403'
        };

        if (expectedFileType.length != 0 && file instanceof File && this.getFileExtension(file.type) != file.name.split(".").pop()?.toLowerCase()) return {
            isValid: false,
            error: 'corruptFileFormat',
            message: `The file type does not match mime type.`,
            status: '403'
        };

        return {
            isValid: true,
            error: null,
            message: 'File is valid',
            status: '200'
        };
    }

    /**
     * This method changes the file name.
     * 
     * @param file File to change name.
     * @param newName New filename.
     * @returns The file with the new name.
     */
    public static changeFileName(file: File, newName?: string): File {
        if (!newName) return file;
        const fileName: string = `${newName}.${this.getFileExtension(file.type)}`;
        return new File([file], fileName, { type: file.type });
    }

    /**
     * Remove the extension from the file name.
     * 
     * @param fileName filename with extension.
     * @returns Filename without extension.
     */
    public static removeExtension(fileName: string): string {
        return fileName.split('.').slice(0, -1).join('.');
    }

    public static createFileList(files: File[]): FileList {
        const dataTransfer = new DataTransfer();
        files.forEach(file => dataTransfer.items.add(file));

        return dataTransfer.files;
    }

    /**
     * This method downloads the file with the provided name.
     * 
     * @param file Object File or Blob.
     * @param fileName File name.
     */
    public static saveAs(file: File | Blob, fileName: string) {
        const blob = new Blob([file], { type: file.type });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(url);
    }

    /**
     * Downloads the file with the name provided in the `Content-Disposition` header.
     * 
     * @param file file to download.
     * @param headers headers of the response.
     */
    public static saveAsHeaders(file: File | Blob, headers: { [key: string]: string }) {
        const blob = new Blob([file], { type: file.type });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        // Filename from content-disposition no case sentitive
        anchor.download = headers[
            Object.keys(headers).find(key => key.toLowerCase() === "content-disposition")
        ]?.split(';')[1].split('=')[1].replace(/"/g, '');

        anchor.click();
        window.URL.revokeObjectURL(url);
    }

    /**
     * Returns the icon name for the file based on the `extension`.
     * 
     * @param extension File extension.
     * @returns Icon name.
     */
    public static getFileIcon(extension: string): string {
        return FILE_ICON_MAP[extension] ?? 'file.png';
    }
}