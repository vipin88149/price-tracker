import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Target, Clock, Bell } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();

  // Mock data for demonstration
  const product = {
    id: id,
    title: "iPhone 15 Pro",
    currentPrice: 999,
    originalPrice: 1099,
    targetPrice: 899,
    website: "Amazon",
    image: "https://via.placeholder.com/300x300",
    description: "The latest iPhone with advanced features and improved performance.",
    availability: "in_stock",
    lastChecked: "2 hours ago",
    priceHistory: [
      { price: 1099, date: "2024-01-01" },
      { price: 1049, date: "2024-01-05" },
      { price: 999, date: "2024-01-10" },
      { price: 949, date: "2024-01-15" },
      { price: 999, date: "2024-01-20" }
    ],
    tracking: {
      status: "active",
      checkFrequency: "daily",
      notifications: {
        email: true,
        whatsapp: false
      }
    }
  };

  const priceChange = ((product.currentPrice - product.originalPrice) / product.originalPrice) * 100;
  const isTargetReached = product.currentPrice <= product.targetPrice;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Product Header */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
            <img
              src={product.image}
              alt={product.title}
              className="w-32 h-32 object-cover rounded-lg mb-4 md:mb-0"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              <p className="text-gray-600 mb-4">
                {product.description}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Website: {product.website}</span>
                <span>Availability: {product.availability.replace('_', ' ')}</span>
                <span>Last checked: {product.lastChecked}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Information */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                ${product.currentPrice}
              </div>
              <div className="text-sm text-gray-600">Current Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${product.targetPrice}
              </div>
              <div className="text-sm text-gray-600">Target Price</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold flex items-center justify-center ${
                priceChange < 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {priceChange < 0 ? (
                  <TrendingDown className="h-5 w-5 mr-1" />
                ) : (
                  <TrendingUp className="h-5 w-5 mr-1" />
                )}
                {Math.abs(priceChange).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Price Change</div>
            </div>
          </div>

          {isTargetReached && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  Target price reached! You can now purchase this product.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tracking Settings */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tracking Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium">Check Frequency</div>
                <div className="text-sm text-gray-600 capitalize">
                  {product.tracking.checkFrequency}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium">Notifications</div>
                <div className="text-sm text-gray-600">
                  {product.tracking.notifications.email && 'Email'}
                  {product.tracking.notifications.email && product.tracking.notifications.whatsapp && ', '}
                  {product.tracking.notifications.whatsapp && 'WhatsApp'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price History */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Price History</h3>
          <div className="space-y-3">
            {product.priceHistory.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">{entry.date}</span>
                </div>
                <span className="font-medium">${entry.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 