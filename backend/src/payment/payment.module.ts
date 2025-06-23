import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { RazorpayService } from './razorpay.service';

@Module({
    controllers: [PaymentController],
    providers: [RazorpayService],
})
export class PaymentModule {}