# Razorpay Integration

Razorpay payment integration with NestJS backend and Next.js frontend. Tested with live keys.

## Setup

### Backend
```bash
cd backend
yarn
yarn start:dev
```

### Frontend
```bash
cd client
yarn
yarn run dev
```

### Environment Variables

Create `.env` in backend folder:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxx
```

## Implementation

### Backend Structure
- `PaymentController` - Handles `/payment/razorpay/initiate` and `/payment/razorpay/verify` endpoints
- `RazorpayService` - Manages order creation and signature verification
- Uses crypto module for HMAC-SHA256 signature validation

### Frontend Implementation
- Product grid with Razorpay checkout integration
- Axios calls to backend endpoints for order creation and verification - `page.tsx`
- Razorpay SDK loaded via Next.js Script component -> `layout.tsx`
- Payment state management with loading indicators

### Payment Flow
1. Frontend calls `/initiate` with product details
2. Backend creates Razorpay order and returns order_id
3. Frontend opens Razorpay checkout with order details
4. On payment completion, frontend calls `/verify` with payment response
5. Backend validates signature and confirms payment

## API Endpoints

**POST** `/payment/razorpay/initiate`
```json
{
  "amount": 100,
  "productId": "prod_1", 
  "userId": "user_123"
}
```

**POST** `/payment/razorpay/verify`
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx", 
  "razorpay_signature": "signature_xxx",
  "userId": "user_123"
}
```

## Usage

Copy the payment module and service files to your NestJS project. Install razorpay dependency and configure environment variables. Frontend integration requires axios and the Razorpay checkout script.

The implementation handles the complete payment lifecycle with proper error handling and signature verification as required by Razorpay's security guidelines.