import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Plus, Target, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    url: '',
    targetPrice: '',
    checkFrequency: 'daily',
    emailNotifications: true,
    whatsappNotifications: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (!formData.url) {
        toast.error('Please enter a product URL');
        return;
      }

      if (!formData.targetPrice || formData.targetPrice <= 0) {
        toast.error('Please enter a valid target price');
        return;
      }

      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Product added successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to add product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-2">
          Enter a product URL from supported e-commerce websites to start tracking its price.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Product URL
            </label>
            <input
              type="url"
              id="url"
              name="url"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://amazon.com/product/..."
              value={formData.url}
              onChange={handleChange}
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported websites: Amazon, Flipkart, eBay, Walmart, Target
            </p>
          </div>

          <div>
            <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Target Price ($)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Target className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="targetPrice"
                name="targetPrice"
                required
                min="0"
                step="0.01"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                value={formData.targetPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="checkFrequency" className="block text-sm font-medium text-gray-700 mb-2">
              Check Frequency
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="checkFrequency"
                name="checkFrequency"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.checkFrequency}
                onChange={handleChange}
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.emailNotifications}
                onChange={handleChange}
              />
              <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                Email notifications
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="whatsappNotifications"
                name="whatsappNotifications"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.whatsappNotifications}
                onChange={handleChange}
              />
              <label htmlFor="whatsappNotifications" className="ml-2 block text-sm text-gray-900">
                WhatsApp notifications (requires phone number in profile)
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>{isLoading ? 'Adding...' : 'Add Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct; 