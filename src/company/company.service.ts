import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Utilities } from 'src/utils/Utilities';
import { EmailType, sendEmail } from 'src/comms/methods';
import { OTPType } from '@prisma/client';
import { randomBytes } from 'crypto';
import * as multer from 'multer';
import * as path from 'path';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async createCompany(
    createCompanyDto: CreateCompanyDto,
    authorizationHeader: string,
  ) {
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    // Check if a company with the same name already exists
    const existingCompany = await this.prisma.companies.findUnique({
      where: { name: createCompanyDto.name },
    });

    if (existingCompany) {
      throw new BadRequestException(
        `A company with the name "${createCompanyDto.name}" already exists.`,
      );
    }

    // Create the company and assign the creator as an admin
    const newCompany = await this.prisma.companies.create({
      data: {
        ...createCompanyDto,
        pageAdmins: { connect: { id: userId } }, // Connects the user as admin
      },
    });

    return {
      message: `Company "${newCompany.name}" created successfully!`,
      company: newCompany,
    };
  }

  async updateCompany(
    companyId: string,
    updateData: Partial<CreateCompanyDto>,
    authorizationHeader: string,
  ) {
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    // Check if the user is an admin for the company
    const company = await this.prisma.companies.findFirst({
      where: { id: companyId, pageAdmins: { some: { id: userId } } },
    });

    if (!company) {
      throw new ForbiddenException(
        'You do not have permission to update this company.',
      );
    }

    // Update the company details
    const updatedCompany = await this.prisma.companies.update({
      where: { id: companyId },
      data: updateData,
    });

    return {
      message: `Company "${updatedCompany.name}" updated successfully!`,
      company: updatedCompany,
    };
  }

  async deleteCompany(companyId: string, authorizationHeader: string) {
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    // Check if the user is an admin for the company
    const company = await this.prisma.companies.findFirst({
      where: { id: companyId, pageAdmins: { some: { id: userId } } },
    });

    if (!company) {
      throw new ForbiddenException(
        'You do not have permission to delete this company.',
      );
    }

    // Delete the company
    await this.prisma.companies.delete({ where: { id: companyId } });

    return { message: `Company "${company.name}" deleted successfully!` };
  }

  async addAdmin(
    companyId: string,
    newAdminId: string,
    authorizationHeader: string,
  ) {
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    // Check if the user is an admin for the company
    const company = await this.prisma.companies.findFirst({
      where: { id: companyId, pageAdmins: { some: { id: userId } } },
    });

    if (!company) {
      throw new ForbiddenException(
        'You do not have permission to add admins for this company.',
      );
    }

    // Add the new admin
    await this.prisma.companies.update({
      where: { id: companyId },
      data: { pageAdmins: { connect: { id: newAdminId } } },
    });

    return {
      message: `User with ID "${newAdminId}" has been added as an admin for the company "${company.name}".`,
    };
  }

  async removeAdmin(
    companyId: string,
    adminId: string,
    authorizationHeader: string,
  ) {
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    // Check if the user is an admin for the company
    const company = await this.prisma.companies.findFirst({
      where: { id: companyId, pageAdmins: { some: { id: userId } } },
    });

    if (!company) {
      throw new ForbiddenException(
        'You do not have permission to remove admins for this company.',
      );
    }

    // Remove the admin
    await this.prisma.companies.update({
      where: { id: companyId },
      data: { pageAdmins: { disconnect: { id: adminId } } },
    });

    return {
      message: `User with ID "${adminId}" has been removed as an admin for the company "${company.name}".`,
    };
  }

  async addRecruitmentPermission(
    companyId: string,
    userIdToAdd: string,
    authorizationHeader: string,
  ) {
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    // Check if the requesting user is an admin for the company
    const company = await this.prisma.companies.findFirst({
      where: { id: companyId, pageAdmins: { some: { id: userId } } },
    });

    if (!company) {
      throw new ForbiddenException(
        'You do not have permission to grant recruitment permissions for this company.',
      );
    }

    // Add the user to the recruitment permissions list
    await this.prisma.companies.update({
      where: { id: companyId },
      data: { usersAllowedJobPosting: { connect: { id: userIdToAdd } } },
    });

    return {
      message: `User with ID "${userIdToAdd}" has been granted job posting permissions for the company "${company.name}".`,
    };
  }

  async removeRecruitmentPermission(
    companyId: string,
    userIdToRemove: string,
    authorizationHeader: string,
  ) {
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    // Check if the requesting user is an admin for the company
    const company = await this.prisma.companies.findFirst({
      where: { id: companyId, pageAdmins: { some: { id: userId } } },
    });

    if (!company) {
      throw new ForbiddenException(
        'You do not have permission to revoke recruitment permissions for this company.',
      );
    }

    // Remove the user from the recruitment permissions list
    await this.prisma.companies.update({
      where: { id: companyId },
      data: { usersAllowedJobPosting: { disconnect: { id: userIdToRemove } } },
    });

    return {
      message: `User with ID "${userIdToRemove}" has been removed from job posting permissions for the company "${company.name}".`,
    };
  }

  async removeInvolvedUser(
    companyId: string,
    userIdToRemove: string,
    authorizationHeader: string,
  ) {
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    // Check if the requesting user is an admin for the company
    const company = await this.prisma.companies.findFirst({
      where: { id: companyId, pageAdmins: { some: { id: userId } } },
    });

    if (!company) {
      throw new ForbiddenException(
        'You do not have permission to remove involved users from this company.',
      );
    }

    // Remove the user from the involved list
    await this.prisma.companies.update({
      where: { id: companyId },
      data: { usersInvolved: { disconnect: { id: userIdToRemove } } },
    });

    return {
      message: `User with ID "${userIdToRemove}" has been removed from the involved users for the company "${company.name}".`,
    };
  }

  async generateAndSendInvitation(
    companyId: string,
    userEmail: string,
    authorizationHeader: string,
  ) {
    // Step 1: Verify the requester is an admin of the company
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    // Check if the user is an admin of the company
    const company = await this.prisma.companies.findFirst({
      where: { id: companyId, pageAdmins: { some: { id: userId } } },
    });

    if (!company) {
      throw new ForbiddenException(
        'You do not have permission to send invitations for this company.',
      );
    }

    // Step 2: Find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new NotFoundException('A user with this email does not exist.');
    }

    // Step 3: Delete any existing OTP for the user and type
    await this.prisma.oTP.deleteMany({
      where: {
        userId: user.id,
        otpType: OTPType.CompanyInvitation,
        companyId,
      },
    });

    // Step 4: Generate a new OTP
    const otp = randomBytes(3).toString('hex').toUpperCase();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 2160);

    // Step 5: Save the OTP in the database
    await this.prisma.oTP.create({
      data: {
        otp,
        otpType: OTPType.CompanyInvitation,
        userId: user.id,
        expiry,
        companyId,
      },
    });

    // Step 6: Send the invitation email
    await sendEmail(
      user.email,
      user.fullName,
      EmailType.CompanyInvitation,
      otp,
      company.name,
    );

    return { message: `Invitation sent to ${user.fullName} successfully.` };
  }

  async verifyInvitation(
    otp: string,
    authorizationHeader: string,
  ): Promise<{ message: string }> {
    // Step 1: Decode the token to identify the user
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    // Step 2: Find the OTP record
    const otpRecord = await this.prisma.oTP.findFirst({
      where: {
        otp,
        otpType: OTPType.CompanyInvitation,
        userId,
        expiry: { gte: new Date() }, // Ensure the OTP is not expired
      },
      include: { company: true }, // Include related company details
    });

    if (!otpRecord) {
      throw new NotFoundException(
        'The OTP entered did not match any in our records. Please try again.',
      );
    }

    // Step 3: Add the user to the company's involved users
    await this.prisma.companies.update({
      where: { id: otpRecord.companyId },
      data: {
        usersInvolved: { connect: { id: userId } },
      },
    });

    // Step 4: Delete the OTP
    await this.prisma.oTP.delete({ where: { otp } });

    return {
      message: `You have successfully joined the company "${otpRecord.company.name}".`,
    };
  }

  async listCompaniesInvolved(authorizationHeader: string) {
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    // Fetch companies where the user is involved
    const companies = await this.prisma.companies.findMany({
      where: { usersInvolved: { some: { id: userId } } },
      select: { id: true, name: true, description: true, createdAt: true },
    });

    return {
      message: 'Companies you are involved in retrieved successfully.',
      companies,
    };
  }

  async listCompaniesAdminOf(authorizationHeader: string) {
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    // Fetch companies where the user is an admin
    const companies = await this.prisma.companies.findMany({
      where: { pageAdmins: { some: { id: userId } } },
      select: { id: true, name: true, description: true, createdAt: true },
    });

    return {
      message: 'Companies you are an admin of retrieved successfully.',
      companies,
    };
  }

  async listCompaniesJobPostingPermissionIn(authorizationHeader: string) {
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    // Fetch companies where the user has job posting permissions
    const companies = await this.prisma.companies.findMany({
      where: { usersAllowedJobPosting: { some: { id: userId } } },
      select: { id: true, name: true, description: true, createdAt: true },
    });

    return {
      message:
        'Companies where you have job posting permissions retrieved successfully.',
      companies,
    };
  }

  async getCompanyById(companyId: string) {
    // Fetch the company details by ID with only the specified fields
    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        description: true,
        websiteLink: true,
        industryLinks: true, // Assuming this is a relation and should return its fields
        about: true,
        createdAt: true,
        usersFollowing: { select: { id: true, fullName: true } }, // Assuming usersFollowing is a relation
        pageAdmins: { select: { id: true, fullName: true } },
        analytics: true, // Assuming this is a one-to-one relation and will return all fields
        CompanyPageAttachments: true, // Assuming this is a relation and will return all fields
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID "${companyId}" not found.`);
    }

    return {
      message: `Company "${company.name}" retrieved successfully.`,
      company,
    };
  }

  async addIndustryToCompany(
    industryName: string,
    companyName: string,
    authorizationHeader: string,
  ) {
    // Step 1: Verify the user identity
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    // Step 2: Find the company by name and check admin access
    const company = await this.prisma.companies.findFirst({
      where: { name: companyName, pageAdmins: { some: { id: userId } } },
    });

    if (!company) {
      throw new ForbiddenException(
        `You do not have permission to add an industry to the company "${companyName}".`,
      );
    }

    // Step 3: Find the industry by name
    const industry = await this.prisma.industries.findUnique({
      where: { name: industryName },
    });

    if (!industry) {
      throw new NotFoundException(
        `Industry with name "${industryName}" not found.`,
      );
    }

    // Step 4: Create the association in IndustryCompany
    await this.prisma.industryCompany.create({
      data: {
        industryId: industry.id,
        companyId: company.id,
      },
    });

    return {
      message: `Industry "${industryName}" has been successfully associated with Company "${companyName}".`,
    };
  }

  async removeIndustryFromCompany(
    industryName: string,
    companyName: string,
    authorizationHeader: string,
  ) {
    // Step 1: Verify the user identity
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    // Step 2: Find the company by name and check admin access
    const company = await this.prisma.companies.findFirst({
      where: { name: companyName, pageAdmins: { some: { id: userId } } },
    });

    if (!company) {
      throw new ForbiddenException(
        `You do not have permission to remove an industry from the company "${companyName}".`,
      );
    }

    // Step 3: Find the industry by name
    const industry = await this.prisma.industries.findUnique({
      where: { name: industryName },
    });

    if (!industry) {
      throw new NotFoundException(
        `Industry with name "${industryName}" not found.`,
      );
    }

    // Step 4: Delete the association in IndustryCompany
    const deleted = await this.prisma.industryCompany.delete({
      where: {
        industryId_companyId: {
          industryId: industry.id,
          companyId: company.id,
        },
      },
    });

    if (!deleted) {
      throw new NotFoundException(
        `Association between Industry "${industryName}" and Company "${companyName}" not found.`,
      );
    }

    return {
      message: `Association between Industry "${industryName}" and Company "${companyName}" has been successfully removed.`,
    };
  }

  // Multer setup for file upload
  private readonly upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/logos');
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
      },
    }),
    fileFilter: (req, file, cb) => {
      const fileExt = path.extname(file.originalname).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(fileExt)) {
        cb(null, true); // Accept the file
      } else {
        // Reject the file with an error
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  });

  // Method to upload the logo
  async uploadCompanyLogo(
    companyId: string,
    file: Express.Multer.File,
    authorizationHeader: string,
  ) {
    // Step 1: Verify if the user is an admin of the company
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new BadRequestException(
        'Invalid or expired token. Please login again.',
      );
    }

    const { userId } = decoded;

    const company = await this.prisma.companies.findFirst({
      where: { id: companyId, pageAdmins: { some: { id: userId } } },
    });

    if (!company) {
      throw new ForbiddenException(
        'You do not have permission to upload the logo for this company.',
      );
    }

    // Step 2: Validate the file
    if (!file) {
      throw new BadRequestException('File must be provided.');
    }

    const filePath = `/uploads/logos/${file.filename}`; // Relative path to the logo

    // Step 3: Update the company with the logo path
    await this.prisma.companies.update({
      where: { id: companyId },
      data: { companyLogo: filePath },
    });

    return { message: 'Company logo uploaded successfully.', filePath };
  }

  // Method to retrieve the company logo
  async getCompanyLogo(companyId: string) {
    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
      select: { companyLogo: true },
    });

    if (!company || !company.companyLogo) {
      throw new NotFoundException('Company logo not found.');
    }

    return {
      message: 'Company logo retrieved successfully.',
      companyLogo: company.companyLogo,
    };
  }
}
