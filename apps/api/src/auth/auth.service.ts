import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(employeeId: string, pin: string): Promise<{ accessToken: string }> {
    const agent = await this.prisma.agent.findUnique({ where: { employeeId } });

    if (!agent) {
      throw new UnauthorizedException('Invalid employee ID or PIN');
    }

    const pinValid = await bcrypt.compare(pin, agent.pinHash);
    if (!pinValid) {
      throw new UnauthorizedException('Invalid employee ID or PIN');
    }

    const payload: JwtPayload = {
      sub: agent.id,
      employeeId: agent.employeeId,
      name: agent.name,
      role: agent.role,
    };

    return { accessToken: this.jwtService.sign(payload) };
  }

  async registerAgent(data: {
    employeeId: string;
    name: string;
    phone: string;
    pin: string;
    role?: 'AGENT' | 'SUPERVISOR' | 'ADMIN';
  }) {
    const pinHash = await bcrypt.hash(data.pin, 10);
    return this.prisma.agent.create({
      data: {
        employeeId: data.employeeId,
        name: data.name,
        phone: data.phone,
        pinHash,
        role: data.role ?? 'AGENT',
      },
      select: { id: true, employeeId: true, name: true, role: true },
    });
  }
}
