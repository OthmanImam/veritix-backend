import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class ReportResponseDto {
  @ApiProperty({ example: 100 })
  totalUsers: number

  @ApiProperty({ example: 85 })
  activeUsers: number

  @ApiProperty({ example: 15 })
  inactiveUsers: number

  @ApiProperty({
    example: {
      admin: 5,
      user: 80,
      moderator: 15,
    },
  })
  usersByRole: Record<string, number>

  @ApiProperty({
    enum: ["week", "month", "year", "custom"],
    example: "month",
  })
  period: "week" | "month" | "year" | "custom"

  @ApiPropertyOptional({ example: "2023-01-01T00:00:00Z" })
  startDate?: Date

  @ApiPropertyOptional({ example: "2023-12-31T23:59:59Z" })
  endDate?: Date

  @ApiProperty({ example: "2024-01-15T12:30:45Z" })
  generatedAt: Date
}

