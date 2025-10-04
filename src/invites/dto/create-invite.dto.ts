
import { IsEmail,IsNotEmpty,IsEnum  } from "class-validator";
import  {UserRole} from '../../common/enums/user-role.enum';



export class CreateInviteDto{
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsEnum(UserRole, {message: 'Role must be  a valid  UserRole enum value'})
    @IsNotEmpty()
    role: UserRole

    
}