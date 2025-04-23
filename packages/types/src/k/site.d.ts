interface SiteModel {
  clone(): void
  constType: number
  creationDate: Date
  id: string
  lastModified: number
  lastModifyTick: number
  name: string
}

interface SiteObject {
  body: string
  constType: number
  creationDate: Date
  id: string
  lastModified: number
  name: string
}

// Todo
interface ChangeLog {}
/**
 * EditCodeMethods
 */
interface CodeMethods {
  add(resource: Record<'name' | 'body' | 'url', string>): void
  all(): SiteModel[]
  delete(nameOrId: string): void
  get(nameOrId: string): SiteObject
  getAbsUrl(id: string): SiteObject
  getByLog(logId: number): void
  getByUrl(url: string): SiteObject
  getLogs(nameOrId: string): ChangeLog[]
  getUrl(id: string): string
  getUrls(nameOrId: string): string[]
  update(siteObject: SiteObject): void
  updateBody(nameOrId: string, body: string): void
}

interface Views
  extends Pick<
    CodeMethods,
    | 'add'
    | 'all'
    | 'delete'
    | 'get'
    | 'getByLog'
    | 'getLogs'
    | 'update'
    | 'updateBody'
  > {}

interface Pages
  extends Pick<
    CodeMethods,
    | 'add'
    | 'all'
    | 'delete'
    | 'get'
    | 'getAbsUrl'
    | 'getByLog'
    | 'getByUrl'
    | 'getLogs'
    | 'getUrl'
    | 'update'
    | 'updateBody'
  > {}

interface Scripts
  extends Pick<
    CodeMethods,
    | 'add'
    | 'all'
    | 'delete'
    | 'get'
    | 'getAbsUrl'
    | 'getByLog'
    | 'getByUrl'
    | 'getLogs'
    | 'getUrl'
    | 'update'
    | 'updateBody'
  > {}

interface Styles
  extends Pick<
    CodeMethods,
    | 'add'
    | 'all'
    | 'delete'
    | 'get'
    | 'getAbsUrl'
    | 'getByLog'
    | 'getByUrl'
    | 'getLogs'
    | 'getUrl'
    | 'update'
    | 'updateBody'
  > {}

interface Layouts
  extends Pick<
    CodeMethods,
    | 'add'
    | 'all'
    | 'delete'
    | 'get'
    | 'getByLog'
    | 'getLogs'
    | 'update'
    | 'updateBody'
  > {}

interface Codes
  extends Pick<
    CodeMethods,
    | 'add'
    | 'all'
    | 'delete'
    | 'get'
    | 'getAbsUrl'
    | 'getByLog'
    | 'getByUrl'
    | 'getLogs'
    | 'getUrl'
    | 'update'
    | 'updateBody'
  > {}

interface Site {
  views: Views
  pages: Pages
  scripts: Scripts
  styles: Styles
  layouts: Layouts
  codes: Codes
}

export { Site }
