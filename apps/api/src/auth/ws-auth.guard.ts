import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const auth = client.handshake.auth as { token?: string } | undefined;
    const token = auth?.token ?? (client.handshake.query as { token?: string })?.token;

    if (!token) {
      this.logger.warn(`WS auth: no token from ${client.id}`);
      client.disconnect(true);
      return false;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.get<string>('jwt.secret'),
      });
      (client.data as Record<string, unknown>).agent = payload;
      return true;
    } catch {
      this.logger.warn(`WS auth: invalid token from ${client.id}`);
      client.disconnect(true);
      return false;
    }
  }
}
