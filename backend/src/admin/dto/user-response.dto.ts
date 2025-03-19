import { ApiProperty } from "@nestjs/swagger"

export class UserResponseDto {

  @ApiProperty({ example: "1" })
  id: number

  @ApiProperty({ example: "user@example.com" })
  email: string

  @ApiProperty({ example: "johndoe" })
  username: string

  @ApiProperty({ example: "John" })
  firstName: string

  @ApiProperty({ example: "Doe" })
  lastName: string

  @ApiProperty({ example: "user" })
  role: string

  @ApiProperty({ example: true })
  isActive: boolean

  @ApiProperty({ example: "2023-01-01T00:00:00Z" })
  createdAt: Date

  @ApiProperty({ example: "2023-01-02T00:00:00Z" })
  updatedAt: Date
}

