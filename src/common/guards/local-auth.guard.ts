import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    // This Guard is concise because the heavy lifting (email/password check)
    // is handled by the LocalStrategy's validate() method.

    // If the LocalStrategy succeeds, req.user is populated.
    // If the LocalStrategy throws UnauthorizedException, the Guard catches it
    // and returns a 401 response automatically.
}