import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";

type CredentialsBody = {
  username?: string;
  password?: string;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  signup(@Body() body: CredentialsBody) {
    return this.authService.signup(body.username ?? "", body.password ?? "");
  }

  @Post("login")
  login(@Body() body: CredentialsBody) {
    return this.authService.login(body.username ?? "", body.password ?? "");
  }
}
