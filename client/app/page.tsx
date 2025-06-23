"use client";

import { useState } from "react";
import axios from "axios";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

const dummyProducts: Product[] = [
  {
    id: "prod_1",
    name: "Wireless Headphones",
    price: 2,
    image: "https://images.pexels.com/photos/583842/pexels-photo-583842.jpeg",
    description: "High-quality wireless headphones with noise cancellation",
  },
  {
    id: "prod_2",
    name: "Smart Watch",
    price: 5,
    image: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg",
    description: "Feature-rich smartwatch with health monitoring",
  },
  {
    id: "prod_3",
    name: "Bluetooth Speaker",
    price: 5,
    image: "https://images.pexels.com/photos/1706694/pexels-photo-1706694.jpeg",
    description: "Portable Bluetooth speaker with excellent sound quality",
  },
];

export default function HomePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const handlePayment = async (product: Product) => {
    setLoading(product.id);
    setMessage("");

    try {
      // Step 1: Initiate payment
      const response = await axios.post(
        "http://localhost:3333/payment/razorpay/initiate",
        {
          amount: product.price,
          productId: product.id,
          userId: "user_123", // Dummy user ID
        },
      );

      if (!response.data.success) {
        throw new Error("Failed to initiate payment");
      }

      const { orderId, amount, currency, key } = response.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: "Your Store",
        description: `Payment for ${product.name}`,
        order_id: orderId,
        handler: async function (response: any) {
          // Step 3: Verify payment
          try {
            const verifyResponse = await axios.post(
              "http://localhost:3333/payment/razorpay/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: "user_123",
              },
            );

            if (verifyResponse.data.success) {
              setMessage(
                `✅ Payment successful! Payment ID: ${response.razorpay_payment_id}`,
              );
            } else {
              setMessage("❌ Payment verification failed");
            }
          } catch (error) {
            console.error("Verification error:", error);
            setMessage("❌ Payment verification failed");
          }
        },
        prefill: {
          name: "John Doe",
          email: "john@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#007bff",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      razorpay.on("payment.failed", function (response: any) {
        setMessage(`❌ Payment failed: ${response.error.description}`);
      });
    } catch (error) {
      console.error("Payment error:", error);
      setMessage("❌ Failed to initiate payment");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Your Store</h1>
          <p className="text-gray-600">Dummy products for Razorpay testing</p>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={`p-4 rounded-lg ${
              message.includes("✅")
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dummyProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handlePayment(product)}
                    disabled={loading === product.id}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      loading === product.id
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                    }`}
                  >
                    {loading === product.id ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Buy Now"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            This is a demo store for testing Razorpay integration
          </p>
        </div>
      </footer>
    </div>
  );
}
