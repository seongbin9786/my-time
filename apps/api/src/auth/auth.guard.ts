import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { AuthService, JwtUserPayload } from "./auth.service";

export type AuthenticatedRequest = {
  headers: {
    authorization?: string;
  };
  user?: JwtUserPayload;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);
    request.user = await this.authService.verifyToken(token);
    return true;
  }

  private extractBearerToken(value: string | undefined): string {
    if (!value) {
      throw new UnauthorizedException("Unauthorized");
    }

    const [type, token] = value.split(" ");
    if (type !== "Bearer" || !token) {
      throw new UnauthorizedException("Unauthorized");
    }

    return token;
  }
}
