import { Body, Controller, Post, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';

interface CreatePaymentDto {
    amount: number;
    productId: string;
    userId: string;
}

interface VerifyPaymentDto {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    userId: string;
}

@Controller('payment')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(private readonly razorpayService: RazorpayService) {}

    @Post('razorpay/initiate')
    async initiatePayment(@Body() paymentDto: CreatePaymentDto) {
        try {
            this.logger.log('Initiating payment:', paymentDto);

            const result = await this.razorpayService.createOrder({
                amount: paymentDto.amount,
                currency: 'INR',
                receipt: `order_${Date.now()}`,
                notes: {
                    productId: paymentDto.productId,
                    userId: paymentDto.userId,
                },
            });

            return {
                success: true,
                orderId: result.id,
                amount: result.amount,
                currency: result.currency,
                key: this.razorpayService.getKeyId(),
            };
        } catch (error) {
            this.logger.error('Payment initiation failed:', error);
            throw new HttpException(
                {
                    success: false,
                    message: 'Payment initiation failed',
                    error: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('razorpay/verify')
    async verifyPayment(@Body() verifyDto: VerifyPaymentDto) {
        try {
            this.logger.log('Verifying payment:', {
                orderId: verifyDto.razorpay_order_id,
                paymentId: verifyDto.razorpay_payment_id,
            });

            const isValid = this.razorpayService.verifyPaymentSignature(
                verifyDto.razorpay_order_id,
                verifyDto.razorpay_payment_id,
                verifyDto.razorpay_signature,
            );

            if (!isValid) {
                return {
                    success: false,
                    message: 'Payment verification failed',
                };
            }

            // Here you would typically save the order to database
            // For now, we'll just return success
            return {
                success: true,
                message: 'Payment verified successfully',
                paymentId: verifyDto.razorpay_payment_id,
                orderId: verifyDto.razorpay_order_id,
            };
        } catch (error) {
            this.logger.error('Payment verification failed:', error);
            throw new HttpException(
                {
                    success: false,
                    message: 'Payment verification failed',
                    error: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}