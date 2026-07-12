import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { UsersRepository } from "../users/users.repository";

export interface JwtUserPayload {
  username: string;
  sub: string;
}

interface SignedJwtPayload extends JwtUserPayload {
  iat: number;
  exp: number;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(private readonly usersRepository: UsersRepository) {
    const secret = process.env.JWT_SECRET?.trim();
    if (!secret) {
      throw new Error("JWT_SECRET must be set and fixed across deployments");
    }
    this.jwtSecret = secret;
  }

  async signup(username: string, password: string) {
    this.assertCredentials(username, password);

    const existing = await this.usersRepository.findUser(username);
    if (existing) {
      throw new ConflictException("Username already exists");
    }

    await this.usersRepository.createUser(
      username,
      this.hashPassword(password)
    );
    return this.createLoginResponse(username);
  }

  async login(username: string, password: string) {
    this.assertCredentials(username, password);

    const user = await this.usersRepository.findUser(username);
    if (!user || !this.verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.createLoginResponse(username);
  }

  async verifyToken(token: string): Promise<JwtUserPayload> {
    const payload = this.verifyJwt(token);
    const username = payload.username || payload.sub;
    if (typeof username !== "string" || username.length === 0) {
      throw new UnauthorizedException("Invalid token");
    }

    return {
      username,
      sub: username,
    };
  }

  private async createLoginResponse(username: string) {
    const now = Math.floor(Date.now() / 1000);
    const accessToken = this.signJwt({
      username,
      sub: username,
      iat: now,
      exp: now + 60 * 60,
    });

    return { access_token: accessToken };
  }

  private signJwt(payload: SignedJwtPayload): string {
    const header = this.encodeJson({ alg: "HS256", typ: "JWT" });
    const body = this.encodeJson(payload);
    const signature = this.sign(`${header}.${body}`);

    return `${header}.${body}.${signature}`;
  }

  private verifyJwt(token: string): SignedJwtPayload {
    const [headerPart, payloadPart, signaturePart] = token.split(".");
    if (!headerPart || !payloadPart || !signaturePart) {
      throw new UnauthorizedException("Invalid token");
    }

    const expectedSignature = this.sign(`${headerPart}.${payloadPart}`);
    if (!this.safeEqual(signaturePart, expectedSignature)) {
      throw new UnauthorizedException("Invalid token");
    }

    const header = this.decodeJson(headerPart);
    if (header.alg !== "HS256") {
      throw new UnauthorizedException("Invalid token");
    }

    const payload = this.decodeJson(payloadPart) as Partial<SignedJwtPayload>;
    if (
      typeof payload.username !== "string" ||
      typeof payload.sub !== "string" ||
      typeof payload.exp !== "number"
    ) {
      throw new UnauthorizedException("Invalid token");
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException("Token expired");
    }

    return payload as SignedJwtPayload;
  }

  private encodeJson(value: object): string {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
  }

  private decodeJson(value: string): Record<string, unknown> {
    try {
      return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }

  private sign(value: string): string {
    return createHmac("sha256", this.jwtSecret)
      .update(value)
      .digest("base64url");
  }

  private safeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }

  private assertCredentials(username: string, password: string): void {
    if (!username || !password) {
      throw new BadRequestException("Username and password are required");
    }
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex");
    const passwordHash = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${passwordHash}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, expectedHash] = storedHash.split(":");
    if (!salt || !expectedHash) return false;
    const expected = Buffer.from(expectedHash, "hex");
    const actual = scryptSync(password, salt, expected.length);
    return timingSafeEqual(expected, actual);
  }
}
