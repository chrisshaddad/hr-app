export interface UploadedFile {
  key: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface UploadOptions {
  fileName: string;
  mimeType: string;
  folder?: string;
}

export interface StorageService {
  /**
   * Upload a file to storage
   * @param file - File buffer to upload
   * @param options - Upload options (fileName, mimeType, folder)
   * @returns Uploaded file info with key and URL
   */
  upload(file: Buffer, options: UploadOptions): Promise<UploadedFile>;

  /**
   * Download a file from storage
   * @param key - File key/path in storage
   * @returns File buffer
   */
  download(key: string): Promise<Buffer>;

  /**
   * Delete a file from storage
   * @param key - File key/path to delete
   */
  delete(key: string): Promise<void>;

  /**
   * Get a signed URL for temporary access to a file
   * @param key - File key/path
   * @param expiresInSeconds - URL expiry time (default: 3600)
   * @returns Signed URL string
   */
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;

  /**
   * Check if a file exists in storage
   * @param key - File key/path
   * @returns true if file exists
   */
  exists(key: string): Promise<boolean>;
}
