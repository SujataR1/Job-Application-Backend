import { Controller, Get, Patch, Body, Headers } from '@nestjs/common'; // Import NestJS decorators and utilities
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'; // Import Swagger decorators
import { UserSettingsMethods } from './user-settings.service'; // Import the service layer (methods)
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto'; // Import the DTO for update operations

@ApiTags('User Settings')
@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsMethods: UserSettingsMethods) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user settings' })
  @ApiResponse({
    status: 200,
    description: 'User settings retrieved successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'There has been some error on our end.',
  })
  async getUserSettings(@Headers('Authorization') authorization: string) {
    return this.userSettingsMethods.getUserSettings(authorization);
  }

  @Patch()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({
    status: 200,
    description: 'User settings updated successfully.',
  })
  @ApiResponse({ status: 500, description: 'There has been an error' })
  async updateUserSettings(
    @Headers('Authorization') authorization: string,
    @Body() updateUserSettingsDto: UpdateUserSettingsDto,
  ) {
    return this.userSettingsMethods.updateUserSettings(
      authorization,
      updateUserSettingsDto,
    );
  }
}
