import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const Razorpay = require('razorpay');

@Injectable()
export class RazorpayService {
    private readonly logger = new Logger(RazorpayService.name);
    private razorpayInstance: any;
    private keyId: string;
    private keySecret: string;

    constructor(private configService: ConfigService) {
        this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
        this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

        if (!this.keyId || !this.keySecret) {
            throw new Error('Razorpay credentials are missing in environment variables');
        }

        this.razorpayInstance = new Razorpay({
            key_id: this.keyId,
            key_secret: this.keySecret,
        });

        this.logger.log('Razorpay service initialized');
    }

    getKeyId(): string {
        return this.keyId;
    }

    async createOrder(orderData: {
        amount: number;
        currency: string;
        receipt: string;
        notes?: any;
    }) {
        try {
            const options = {
                amount: Math.round(orderData.amount * 100), // Amount in paise
                currency: orderData.currency,
                receipt: orderData.receipt,
                notes: orderData.notes || {},
            };

            this.logger.log('Creating Razorpay order:', options);

            const order = await this.razorpayInstance.orders.create(options);

            this.logger.log('Razorpay order created:', order.id);

            return order;
        } catch (error) {
            this.logger.error('Failed to create Razorpay order:', error);
            throw error;
        }
    }

    verifyPaymentSignature(
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string,
    ): boolean {
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', this.keySecret)
            .update(body.toString())
            .digest('hex');

        const isValid = expectedSignature === razorpaySignature;

        this.logger.log(`Payment signature verification: ${isValid ? 'SUCCESS' : 'FAILED'}`);

        return isValid;
    }
}