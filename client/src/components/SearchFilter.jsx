// Import React and necessary libraries
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

// Component to handle search and filter inputs
const SearchFilter = ({ onSearch, onClear, filters }) => {
  // State to store local filter inputs
  const [localFilters, setLocalFilters] = useState(filters);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Trim inputs to avoid whitespace issues
    const trimmedFilters = {
      search: localFilters.search.trim(),
      city: localFilters.city.trim(),
      state: localFilters.state.trim(),
      pin_code: localFilters.pin_code.trim(),
    };
    console.log('SearchFilter - Submitting filters:', trimmedFilters); // Debug log
    // Check if at least one filter is non-empty
    if (!trimmedFilters.search && !trimmedFilters.city && !trimmedFilters.state && !trimmedFilters.pin_code) {
      toast.warn('Please enter at least one search criterion', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    onSearch(trimmedFilters);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({ ...localFilters, [name]: value });
    console.log(`SearchFilter - Updated ${name}:`, value); // Debug log
  };

  // Handle clear action
  const handleClear = () => {
    const clearedFilters = { search: '', city: '', state: '', pin_code: '' };
    setLocalFilters(clearedFilters);
    onClear();
    console.log('SearchFilter - Cleared filters'); // Debug log
    toast.success('Filters cleared!', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast container for notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick pauseOnHover />
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Search & Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            name="search"
            placeholder="Name or Phone"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={localFilters.search}
            onChange={handleInputChange}
          />
          <input
            name="city"
            placeholder="City"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={localFilters.city}
            onChange={handleInputChange}
          />
          <input
            name="state"
            placeholder="State"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={localFilters.state}
            onChange={handleInputChange}
          />
          <input
            name="pin_code"
            placeholder="Pin Code"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={localFilters.pin_code}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200 text-sm sm:text-base"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200 text-sm sm:text-base"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchFilter;