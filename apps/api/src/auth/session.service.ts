import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import Redis from 'ioredis';
import { PrismaService } from '../database/prisma.service';
import type { AuthenticatedUser } from './guards/auth.guard';

const SESSION_PREFIX = 'session:';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface SessionData {
  userId: string;
  expiresAt: Date;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  /**
   * Creates a new session in both DB and Redis
   */
  async createSession(userId: string): Promise<string> {
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

    // Store in database (source of truth)
    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId,
        expiresAt,
      },
    });

    // Cache in Redis with TTL
    const sessionData: SessionData = { userId, expiresAt };
    await this.redis.setex(
      `${SESSION_PREFIX}${sessionId}`,
      SESSION_TTL_SECONDS,
      JSON.stringify(sessionData),
    );

    this.logger.log(`Session created for user ${userId}`);
    return sessionId;
  }

  /**
   * Validates a session and returns the user if valid
   * Checks Redis first, falls back to DB on cache miss
   */
  async validateSession(sessionId: string): Promise<AuthenticatedUser | null> {
    // Try Redis first (fast path)
    const cachedSession = await this.redis.get(`${SESSION_PREFIX}${sessionId}`);

    if (cachedSession) {
      const sessionData = JSON.parse(cachedSession) as SessionData;

      // Check expiration
      if (new Date(sessionData.expiresAt) < new Date()) {
        await this.deleteSession(sessionId);
        return null;
      }

      // Get user from database
      return this.prisma.user.findUnique({
        where: { id: sessionData.userId },
        include: { employee: true },
      });
    }

    // Cache miss - check database
    const dbSession = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: { include: { employee: true } } },
    });

    if (!dbSession) {
      return null;
    }

    // Check expiration
    if (dbSession.expiresAt < new Date()) {
      await this.deleteSession(sessionId);
      return null;
    }

    // Re-cache in Redis
    const remainingTtl = Math.floor(
      (dbSession.expiresAt.getTime() - Date.now()) / 1000,
    );

    if (remainingTtl > 0) {
      const sessionData: SessionData = {
        userId: dbSession.userId,
        expiresAt: dbSession.expiresAt,
      };
      await this.redis.setex(
        `${SESSION_PREFIX}${sessionId}`,
        remainingTtl,
        JSON.stringify(sessionData),
      );
    }

    return dbSession.user;
  }

  /**
   * Deletes a session from both DB and Redis
   */
  async deleteSession(sessionId: string): Promise<void> {
    await Promise.all([
      this.prisma.session.delete({ where: { id: sessionId } }).catch(() => {
        // Session may not exist in DB
      }),
      this.redis.del(`${SESSION_PREFIX}${sessionId}`),
    ]);

    this.logger.log(`Session ${sessionId} deleted`);
  }

  /**
   * Deletes all sessions for a user (logout from all devices)
   */
  async deleteAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      select: { id: true },
    });

    // Delete from Redis
    const redisKeys = sessions.map((s) => `${SESSION_PREFIX}${s.id}`);
    if (redisKeys.length > 0) {
      await this.redis.del(...redisKeys);
    }

    // Delete from DB
    await this.prisma.session.deleteMany({ where: { userId } });

    this.logger.log(`All sessions deleted for user ${userId}`);
  }

  /**
   * Generates a cryptographically secure session ID
   */
  private generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }
}
