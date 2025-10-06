import { 
    Injectable, 
    UnauthorizedException, 
    BadRequestException, 
    ConflictException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../entity/user.entity'
import { JwtPayload } from './strategies/jwt.strategy'; 
import { RegisterDto } from './dto/register.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { Organization } from '../entity/organization.entity'; 
import { Invite } from '../entity/invite.entity'; 
import { OnboardingStep } from '../common/enums/onboarding-step.enum';
import { UserRole, InviteStatus } from '../common/enums/user-role.enum'; 


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        @InjectDataSource()
        private dataSource: DataSource,
    ) {}

    async validateUser(email: string, pass: string): Promise<Omit<User, 'passwordHash'> | null> {
        const user = await this.usersService.findOneByEmailWithPassword(email);

        if (user && user.passwordHash) {
            const isMatch = await bcrypt.compare(pass, user.passwordHash);

            if (isMatch) {
                const { passwordHash, ...result } = user;
                return result;
            }
        }
        return null; 
    }

    login(user: Omit<User, 'passwordHash'>) { 
        // REMOVED: const now = Math.floor(Date.now() / 1000); 
        
        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            // REMOVED: iat: now, 
            // REMOVED: exp: now + 60 * 60, 
        };

        return {
            // JwtService.sign() will now correctly add 'iat' and 'exp' based on JwtModule config
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                organizationId: user.organizationId,
            }
        };
    }

    //---------------------------------------------------------

    /**
     * TRANSACTIONAL REGISTRATION: Atomically creates the Organization and the Owner user.
     */
    async register(dto: RegisterDto) {
        // 1. Check if the email is already in use
        const existingUser = await this.usersService.findOneByEmail(dto.email);
        if (existingUser) {
            throw new ConflictException('User already exists. Please log in.');
        }

        // Run Transaction to ensure atomicity
        return this.dataSource.transaction(async (manager) => {
            // A. Create the Organization
            const newOrg = manager.create(Organization, {
                name: dto.organizationName,
                industry: dto.industry,
                // FIX: Provide a mandatory value for teamSize (1, as the owner is the first member)
                teamSize: dto.teamSize || 1, // Uses DTO value if present, otherwise defaults to 1
                onboardingStep: OnboardingStep.ORG_SETUP, 
            });

            const savedOrg = await manager.save(newOrg);

            // B. Create the User (Owner)
            const passwordHash = await bcrypt.hash(dto.password, 10);
            
            const newUser = manager.create(User, {
                name: dto.fullName,
                email: dto.email,
                passwordHash: passwordHash,
                role: UserRole.OWNER, 
                organizationId: savedOrg.id, // Link user to new organization
            });

            const savedUser = await manager.save(newUser);

            // C. Update the Organization with the Owner ID
            savedOrg.ownerId = savedUser.id;
            await manager.save(savedOrg);

            // D. Return the JWT for immediate login
            const { passwordHash: _, ...userWithoutHash } = savedUser;
            
            return this.login(userWithoutHash);
        });
    }
    
    // Method to handle invitation acceptance
    async acceptInvite(dto: AcceptInviteDto) {
        // 1. Find and Validate Invite
        const inviteRepository = this.dataSource.getRepository(Invite);
        
        const invite = await inviteRepository.findOne({ 
            where: { token: dto.token, status: InviteStatus.PENDING },
            relations: ['organization'], 
        });

        if (!invite || invite.expiresAt < new Date()) {
            throw new BadRequestException('Invalid or expired invitation token.');
        }
        
        // 2. Check for existing user (using UsersService)
        const existingUser = await this.usersService.findOneByEmailWithPassword(invite.email);
        if (existingUser) {
            throw new ConflictException('A user with this email address already exists. Please log in.'); 
        }

        // 3. Use a transaction to ensure user creation and invite update are atomic
        return this.dataSource.transaction(async (manager) => {
            
            // A. Create the new User record
            const passwordHash = await bcrypt.hash(dto.password, 10);

            const newUser = manager.create(User, {
                name: dto.fullName,
                email: invite.email,
                passwordHash,
                role: invite.role, 
                organizationId: invite.organizationId, 
            });
            
            const savedUser = await manager.save(newUser);

            // B. Update Invite status
            await manager.update(Invite, invite.id, { 
                status: InviteStatus.ACCEPTED 
            });

            // C. Log the new user in and return JWT
            const { passwordHash: _, ...userWithoutHash } = savedUser; 
            
            return this.login(userWithoutHash);
        });
    }
}