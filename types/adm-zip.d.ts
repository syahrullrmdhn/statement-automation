declare module 'adm-zip' {
  class AdmZip {
    constructor(filePath?: string | Buffer);
    getEntries(): Array<{
      entryName: string;
      getData(): Buffer;
      header: { compressedSize: number; uncompressedSize: number };
    }>;
    extractAllTo(targetPath: string, overwrite?: boolean): boolean;
    addLocalFile(filePath: string, zipPath?: string): void;
    addLocalFolder(folderPath: string, zipPath?: string): void;
    toBuffer(): Buffer;
    writeZip(targetFileName?: string): void;
  }
  export = AdmZip;
}
