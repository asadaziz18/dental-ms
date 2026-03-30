import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';

/** Multer file shape (avoids Express.Multer namespace type issues) */
interface MulterFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagingService } from './imaging.service';
import { UpdateImagingDto } from './dto/update-imaging.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';

@Controller('imaging')
@UseGuards(JwtAuthGuard, BranchGuard)
export class ImagingController {
  constructor(private readonly imagingService: ImagingService) {}

  @Get('patient/:patientId')
  findByPatient(
    @BranchId() branchId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.imagingService.findByPatient(branchId, patientId);
  }

  @Get(':id')
  findOne(@BranchId() branchId: string, @Param('id') id: string) {
    return this.imagingService.findOne(branchId, id);
  }

  @Get(':id/url')
  async getPresignedUrl(
    @BranchId() branchId: string,
    @Param('id') id: string,
  ) {
    const url = await this.imagingService.getPresignedUrl(branchId, id);
    return { url };
  }

  @Get(':id/file')
  async serveFile(
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const result = await this.imagingService.serveFile(branchId, id);
    if (result.type === 'redirect') {
      return res.redirect(302, result.url);
    }
    res.setHeader('Content-Type', result.contentType);
    result.stream.pipe(res);
  }

  @Post('patient/:patientId/upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Param('patientId') patientId: string,
    @UploadedFile() file: MulterFile,
    @Body('toothNumber') toothNumber?: string,
  ) {
    const tooth =
      toothNumber !== undefined && toothNumber !== ''
        ? parseInt(toothNumber, 10)
        : undefined;
    return this.imagingService.upload(
      branchId,
      patientId,
      user.userId,
      file!,
      tooth ?? null,
    );
  }

  @Patch(':id')
  update(
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Body() dto: UpdateImagingDto,
  ) {
    return this.imagingService.update(branchId, id, dto);
  }

  @Delete(':id')
  remove(@BranchId() branchId: string, @Param('id') id: string) {
    return this.imagingService.remove(branchId, id);
  }
}
