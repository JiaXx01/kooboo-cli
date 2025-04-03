// TODO
interface HashGuidOptions {}

/**
 * Jwt
 */
interface Jwt {
  decode(): string
  encode(claims: any): string
  payload: any
}

/**
 * Rsa
 */
// TODO
interface RsaKeys {}
interface Rsa {
  decrypt(privateKey: string, content: string): string
  encrypt(publicKey: string, content: string): string
  generateKeys(size: number): RsaKeys
}

export interface Security {
  aesDecrypt(input: string, key: string): string
  aesEncrypt(input: string, key: string): string
  decodeBase64(input: string): number[]
  decrypt(input: string, key: string): string
  encrypt(input: string, key: string): string
  fromBase64(base64String: string): string
  hashGuid(input: string, options: HashGuidOptions): string
  hashPassword(password: string): string
  hmacMd5(input: string, key: string): string
  hmacSha1(input: string, key: string): string
  hmacSha256(input: string, key: string): string
  jwt: Jwt
  rsa: Rsa
  md5(input: string): string
  newGuid(): string
  sha1(input: string): string
  sha256(input: string): string
  sha256Binary(input: string): number[]
  sha512(input: string): string
  shortGuid(): string
  toBase64(input: string): string
  verifyPassword(password: string, saltedPassword: string): boolean
}
