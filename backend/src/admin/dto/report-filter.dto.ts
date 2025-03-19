import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsDateString, ValidateIf } from "class-validator"

export class ReportFilterDto {
  @ApiProperty({
    enum: ["week", "month", "year", "custom"],
    description: "Time period for the report",
    example: "month",
  })
  @IsEnum(["week", "month", "year", "custom"], {
    message: "Period must be one of: week, month, year, custom",
  })
  period: "week" | "month" | "year" | "custom"

  @ApiPropertyOptional({
    description: "Start date for custom period (ISO format)",
    example: "2023-01-01",
  })
  @IsOptional()
  @ValidateIf((o) => o.period === "custom")
  @IsDateString({}, { message: "Start date must be a valid ISO date string" })
  startDate?: string

  @ApiPropertyOptional({
    description: "End date for custom period (ISO format)",
    example: "2023-12-31",
  })
  @IsOptional()
  @ValidateIf((o) => o.period === "custom")
  @IsDateString({}, { message: "End date must be a valid ISO date string" })
  endDate?: string
}

