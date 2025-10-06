
import { IsNotEmpty, IsUUID } from 'class-validator';
/**
 *  * Used when a user clicks 'Start' on a task.
 */

export class StartTimerDto {
  @IsNotEmpty()
  @IsUUID()
  taskId: string;
}