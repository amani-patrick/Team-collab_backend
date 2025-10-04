
import { IsNotEmpty, IsUUID } from 'class-validator';
/**
 *  * Used when a user clicks 'Start' on a task.
 */

export class StartTimerDto {
  @IsNotEmpty()
  @IsUUID()
  // The Task the time is being logged against
  taskId: string;
}