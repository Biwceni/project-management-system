import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';

@Controller('projects/:projectId/attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.attachmentsService.findAllByProject(projectId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.attachmentsService.upload(projectId, file, user.id);
  }

  @Delete(':attachmentId')
  remove(
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.attachmentsService.remove(attachmentId, user.id);
  }
}
