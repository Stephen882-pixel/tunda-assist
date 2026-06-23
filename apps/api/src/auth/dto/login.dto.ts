import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '41643611', description: 'Employee ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ example: '1234', description: '4-digit PIN' })
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'PIN must be exactly 4 digits' })
  pin: string;
}
