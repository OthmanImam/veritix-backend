// import { Injectable, NotFoundException } from '@nestjs/common';
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Admin } from '../entities/admin.entity';
// import { CreateAdminDto } from '../dto/create-admin.dto';
// import { UpdateAdminDto } from '../dto/update-admin.dto';
// import * as bcrypt from 'bcrypt';

// @Injectable()
// export class AdminService {
//   constructor(
//     @InjectRepository(Admin)
//     private readonly adminRepository: Repository<Admin>,
//   ) {}

//   async createAdmin(createAdminDto: CreateAdminDto) {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//     const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

//     const newAdmin = this.adminRepository.create({
//       ...createAdminDto,
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//       password: hashedPassword,
//     });

//     const savedAdmin = await this.adminRepository.save(newAdmin);

//     return {
//       message: 'Admin created successfully',
//       adminId: savedAdmin.id,
//     };
//   }

//   async findAll(): Promise<Partial<Admin>[]> {
//     return this.adminRepository.find({
//       select: ['id', 'firstName', 'lastName', 'role', 'email'],
//     });
//   }

//   async findOne(id: number): Promise<Partial<Admin>> {
//     const admin = await this.adminRepository.findOne({
//       where: { id },
//       select: ['id', 'firstName', 'lastName', 'role', 'email'],
//     });

//     if (!admin) {
//       throw new NotFoundException(`Admin with ID ${id} not found`);
//     }
//     return admin;
//   }

//   async findOneByEmail(email: string): Promise<Admin | undefined> {
//     return this.adminRepository.findOne({ where: { email } });
//   }

//   async findOneById(id: number): Promise<Admin | undefined> {
//     return this.adminRepository.findOne({ where: { id } });
//   }

//   async update(id: number, updateAdminDto: UpdateAdminDto) {
//     const admin = await this.adminRepository.findOne({ where: { id } });

//     if (!admin) {
//       throw new NotFoundException('Admin not found');
//     }

//     if (updateAdminDto.password) {
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//       updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 10);
//     }

//     await this.adminRepository.update(id, updateAdminDto);

//     return {
//       message: 'Admin details updated successfully',
//       adminId: id,
//     };
//   }

//   async remove(id: number) {
//     const admin = await this.adminRepository.findOne({ where: { id } });

//     if (!admin) {
//       throw new NotFoundException('Admin not found');
//     }

//     await this.adminRepository.delete(id);

//     return { message: 'Admin deleted successfully', adminId: id };
//   }

//   async setRefreshToken(id: number, refreshToken: string): Promise<void> {
//     await this.adminRepository.update(id, { refreshToken });
//   }

//   async setResetToken(
//     id: number,
//     resetToken: string,
//     resetTokenExpiry: Date,
//   ): Promise<void> {
//     await this.adminRepository.update(id, { resetToken, resetTokenExpiry });
//   }

//   async updatePassword(id: number, password: string): Promise<void> {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//     const hashedPassword = await bcrypt.hash(password, 10);
//     await this.adminRepository.update(id, {
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//       password: hashedPassword,
//       resetToken: null,
//       resetTokenExpiry: null,
//     });
//   }

//   async setVerificationToken(
//     id: number,
//     verificationToken: string,
//     verificationTokenExpiry: Date,
//   ): Promise<void> {
//     await this.adminRepository.update(id, {
//       verificationToken,
//       verificationTokenExpiry,
//     });
//   }

//   async verifyEmail(id: number): Promise<void> {
//     await this.adminRepository.update(id, {
//       emailVerified: true,
//       verificationToken: null,
//       verificationTokenExpiry: null,
//     });
//   }
// }
import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { UserNotFoundException } from "src/common/exceptions/user-not-found.exception"
import { ReportPeriodEnum } from "src/common/enums/report-period.enum"
import { InvalidReportParametersException } from "src/common/exceptions/invalid-report.exception-parameters"
import { User } from "src/users/entities/user.entity"
import type { UserResponseDto } from "../dto/user-response.dto"
import type { ReportFilterDto } from "../dto/report-filter.dto"
import type { ReportResponseDto } from "../dto/report-response.dto"


@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAllUsers(): Promise<UserResponseDto[]> {
    try {
      this.logger.log("Retrieving all users")
      const users = await this.usersRepository.find()
      return users.map((user) => this.mapToUserResponseDto(user))
    } catch (error) {
      this.logger.error(`Failed to retrieve all users: ${error.message}`, error.stack)
      throw error
    }
  }

  async findUserById(id: number): Promise<UserResponseDto> {
    try {
      this.logger.log(`Retrieving user with ID: ${id}`)
      const user = await this.usersRepository.findOne({ where: { id } })

      if (!user) {
        throw new UserNotFoundException(id)
      }

      return this.mapToUserResponseDto(user)
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw error
      }
      this.logger.error(`Failed to retrieve user with ID ${id}: ${error.message}`, error.stack)
      throw error
    }
  }

  async generateReports(filterDto: ReportFilterDto): Promise<ReportResponseDto> {
    try {
      const { period, startDate, endDate } = filterDto
      this.logger.log(`Generating reports with period: ${period}`)

      // Validate date range for custom period
      if (period === ReportPeriodEnum.CUSTOM) {
        if (!startDate || !endDate) {
          throw new InvalidReportParametersException("Start date and end date are required for custom period")
        }

        if (new Date(startDate) > new Date(endDate)) {
          throw new InvalidReportParametersException("Start date must be before end date")
        }
      }

      // Build query based on filter period
      let query = this.usersRepository.createQueryBuilder("user")

      switch (period) {
        case ReportPeriodEnum.WEEK:
          // Filter for weekly report
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          query = query.where("user.createdAt >= :oneWeekAgo", { oneWeekAgo })
          break

        case ReportPeriodEnum.MONTH:
          // Filter for monthly report
          const oneMonthAgo = new Date()
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
          query = query.where("user.createdAt >= :oneMonthAgo", { oneMonthAgo })
          break

        case ReportPeriodEnum.YEAR:
          // Filter for yearly report
          const oneYearAgo = new Date()
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
          query = query.where("user.createdAt >= :oneYearAgo", { oneYearAgo })
          break

        case ReportPeriodEnum.CUSTOM:
          // Custom date range
          query = query.where("user.createdAt BETWEEN :startDate AND :endDate", {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          })
          break

        default:
          throw new InvalidReportParametersException(`Unsupported period: ${period}`)
      }

      const users = await query.getMany()

      // Generate report statistics
      const totalUsers = users.length
      const activeUsers = users.filter((user) => user.isActive).length
      const inactiveUsers = totalUsers - activeUsers

      // Group users by role
      const usersByRole = this.groupUsersByRole(users)

      return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        usersByRole,
        period,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        generatedAt: new Date(),
      }
    } catch (error) {
      if (error instanceof InvalidReportParametersException) {
        throw error
      }
      this.logger.error(`Failed to generate reports: ${error.message}`, error.stack)
      throw error
    }
  }

  private mapToUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  private groupUsersByRole(users: User[]): Record<string, number> {
    return users.reduce(
      (acc, user) => {
        const role = user.role || "undefined"
        acc[role] = (acc[role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }
}

