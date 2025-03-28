interface FileInfo {}

interface FolderInfo {}

interface SearchFolderOptions {}

interface ResumableUploadTask {}

interface ResumableUpload {
  create(name: string, size: number, chunkSize?: number): ResumableUploadTask
  get(id: string): ResumableUploadTask
  remove(id: string): void
}

export interface File {
  append(fileName: string, content: string): void
  copy(oldName: string, newName: string): void
  createFolder(folderName: string, parentFolder: string): void
  delete(fileName: string): void
  deleteFolder(folderName: string): void
  exists(fileName: string): boolean
  folderFiles(folderName: string, options?: SearchFolderOptions): FileInfo[]
  get(fileName: string): FileInfo
  getAllFiles(): FileInfo[]
  load(fileName: string): FileInfo
  read(fileName: string): string
  readBinary(fileName: string): number[]
  rename(oldName: string, newName: string): void
  renameFolder(oldName: string, newName: string): void
  resumableUpload: ResumableUpload
  subFolders(folderName?: string): FolderInfo
  url(fileName: string): string
  write(fileName: string, content: string): FileInfo
  writeBinary(fileName: string, content: number[]): FileInfo
}
