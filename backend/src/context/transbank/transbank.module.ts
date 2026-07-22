import { Module } from '@nestjs/common';
import { TransbankController } from './transbank.controller';
import { TransbankService } from './application/transbank.service';

@Module({
  controllers: [TransbankController],
  providers: [TransbankService],
})
export class TransbankModule {}