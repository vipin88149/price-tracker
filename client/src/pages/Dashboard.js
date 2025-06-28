import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Eye } from 'lucide-react';

const Dashboard = () => {
  // Mock data for demonstration
  const trackedProducts = [
    {
      id: 1,
      title: "iPhone 15 Pro",
      currentPrice: 999,
      originalPrice: 1099,
      targetPrice: 899,
      website: "Amazon",
      image: "https://via.placeholder.com/150",
      priceChange: -9.1,
      lastChecked: "2 hours ago"
    },
    {
      id: 2,
      title: "Samsung Galaxy S24",
      currentPrice: 799,
      originalPrice: 899,
      targetPrice: 750,
      website: "Best Buy",
      image: "https://via.placeholder.com/150",
      priceChange: 5.2,
      lastChecked: "1 hour ago"
    }
  ];

  const isAuthenticated = localStorage.getItem('token');

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Price Tracker
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Track product prices from major e-commerce websites and get notified when prices drop to your target.
        </p>
        <div className="space-x-4">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors inline-block"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/add-product"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </Link>
      </div>

      {trackedProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Plus className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products tracked yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start tracking your first product to monitor price changes.
          </p>
          <Link
            to="/add-product"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trackedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex items-center space-x-1">
                  {product.priceChange < 0 ? (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      product.priceChange < 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(product.priceChange).toFixed(1)}%
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {product.title}
              </h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Price:</span>
                  <span className="font-semibold">${product.currentPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Price:</span>
                  <span className="font-semibold text-blue-600">${product.targetPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Website:</span>
                  <span className="text-sm">{product.website}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Last checked: {product.lastChecked}
                </span>
                <Link
                  to={`/product/${product.id}`}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 