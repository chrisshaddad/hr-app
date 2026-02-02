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
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiCookieAuth,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser, Public } from './decorators';
import {
  SESSION_COOKIE_NAME,
  type AuthenticatedRequest,
} from './guards/auth.guard';
import {
  requestMagicLinkSchema,
  verifyMagicLinkSchema,
  type RequestMagicLinkDto,
  type VerifyMagicLinkDto,
  type UserResponse,
} from '@repo/contracts';
import type { User } from '@repo/db';
import { ZodValidationPipe } from '../common/pipes';

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('magic-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request magic link',
    description:
      'Sends a magic link to the provided email address for passwordless authentication',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
      },
      required: ['email'],
    },
  })
  @ApiOkResponse({
    description: 'Magic link sent successfully',
    schema: { type: 'object', properties: { message: { type: 'string' } } },
  })
  @ApiBadRequestResponse({ description: 'Invalid email format' })
  @UsePipes(new ZodValidationPipe(requestMagicLinkSchema))
  async requestMagicLink(@Body() body: RequestMagicLinkDto) {
    return this.authService.requestMagicLink(body.email);
  }

  @Public()
  @Post('magic-link/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify magic link',
    description:
      'Verifies the magic link token and creates a session for the user',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { token: { type: 'string', example: 'abc123-token' } },
      required: ['token'],
    },
  })
  @ApiOkResponse({
    description: 'Magic link verified successfully, session created',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid or expired token' })
  @UsePipes(new ZodValidationPipe(verifyMagicLinkSchema))
  async verifyMagicLink(
    @Body() body: VerifyMagicLinkDto,
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
  @ApiCookieAuth('session_id')
  @ApiOperation({
    summary: 'Logout',
    description: 'Logs out the current user and invalidates their session',
  })
  @ApiOkResponse({
    description: 'Successfully logged out',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
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
  @ApiCookieAuth('session_id')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Returns the currently authenticated user information',
  })
  @ApiOkResponse({
    description: 'Current user information',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: {
          type: 'string',
          enum: ['SUPER_ADMIN', 'ORG_ADMIN', 'EMPLOYEE'],
        },
        organizationId: { type: 'string', nullable: true },
        departmentId: { type: 'string', nullable: true },
        isConfirmed: { type: 'boolean' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getCurrentUser(@CurrentUser() user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      departmentId: user.departmentId,
      isConfirmed: user.isConfirmed,
    };
  }
}
