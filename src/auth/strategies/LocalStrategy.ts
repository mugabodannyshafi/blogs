import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-local'
import { AuthService } from "../auth.service";
import { Inject, UnauthorizedException } from "@nestjs/common";

export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(@Inject(AuthService)private readonly authService: AuthService) {
        super({
            usernameField: 'email',
          })
    }

    async validate(email: string, password: string): Promise<any> {
        const result = await this.authService.validateUser(email, password);
        if (!result) {
          throw new UnauthorizedException();
        }
        return result;
      }
}