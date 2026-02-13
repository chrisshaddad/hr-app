import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser, Public } from './decorators';
import {
  SESSION_COOKIE_NAME,
  type AuthenticatedRequest,
} from './guards/auth.guard';
import {
  magicLinkRequestSchema,
  magicLinkVerifyRequestSchema,
  type MagicLinkRequest,
  type MagicLinkVerifyRequest,
  type UserResponse,
} from '@repo/contracts';
import type { User, Prisma } from '@repo/db';
import { ZodValidationPipe } from '../common/pipes';

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export type UserWithRoles = Prisma.UserGetPayload<{
  include: { roles: true };
}>;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('magic-link')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(magicLinkRequestSchema))
  async requestMagicLink(@Body() body: MagicLinkRequest) {
    return this.authService.requestMagicLink(body.email);
  }

  @Public()
  @Post('magic-link/verify')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(magicLinkVerifyRequestSchema))
  async verifyMagicLink(
    @Body() body: MagicLinkVerifyRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { sessionId, user } = await this.authService.verifyMagicLink(
      body.token,
    );

    // Set session cookie
    response.cookie(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_MS,
      path: '/',
    });

    return { user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const sessionId = request.sessionId;

    if (sessionId) {
      await this.authService.logout(sessionId);
    }

    // Clear session cookie
    response.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { success: true };
  }

  @Get('me')
  getCurrentUser(@CurrentUser() user: UserWithRoles): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.roles.map(r => r.role), // now returns string[]
      organizationId: user.organizationId,
      departmentId: user.departmentId,
      isConfirmed: user.isConfirmed,
    };
  }
}
