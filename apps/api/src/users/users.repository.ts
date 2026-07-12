import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../db/prisma.service";

export interface User {
  username: string;
  passwordHash: string;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUser(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
      select: { username: true, passwordHash: true },
    });
  }

  async createUser(username: string, passwordHash: string): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: { username, passwordHash },
        select: { username: true, passwordHash: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Username already exists");
      }
      throw error;
    }
  }
}
