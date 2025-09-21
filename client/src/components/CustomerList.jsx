import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CustomerList = ({ allCustomers, updateAllData }) => {
  const [filters, setFilters] = useState({ city: '', state: '', pin_code: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [customers, setCustomers] = useState({ data: [], total: 0, totalPages: 1 });
  const [isAddressSearch, setIsAddressSearch] = useState(false);

  const applyFiltersAndSort = (data) => {
    let filtered = data;
    const hasFilters = filters.city || filters.state || filters.pin_code;
    if (hasFilters) {
      filtered = data.filter(cust =>
        cust.addresses.some(addr =>
          (!filters.city || addr.city.toLowerCase().includes(filters.city.toLowerCase())) &&
          (!filters.state || addr.state.toLowerCase().includes(filters.state.toLowerCase())) &&
          (!filters.pin_code || addr.pin_code.includes(filters.pin_code))
        )
      );
      setIsAddressSearch(true);
    } else {
      setIsAddressSearch(false);
    }

    if (!hasFilters || sortBy === 'id') {
      filtered.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }
    return filtered;
  };

  const fetchCustomers = (page = 1) => {
    const filteredSorted = applyFiltersAndSort(allCustomers);
    const total = filteredSorted.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filteredSorted.slice(start, end).map(cust => {
      if (isAddressSearch) {
        const firstAddr = cust.addresses[0] || {};
        return { ...cust, city: firstAddr.city || 'N/A', state: firstAddr.state || 'N/A', pin_code: firstAddr.pin_code || 'N/A' };
      }
      return cust;
    });
    setCustomers({ data: paginated, total, totalPages });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCustomers(1);
  };

  const handleClear = () => {
    setFilters({ city: '', state: '', pin_code: '' });
    setCurrentPage(1);
    fetchCustomers(1);
  };

  const handleSort = (field) => {
    if (isAddressSearch) return;
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
    fetchCustomers(1);
  };

  const handlePage = (page) => {
    setCurrentPage(page);
    fetchCustomers(page);
  };

  const handleDelete = async (customerId) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const response = await axios.delete(`/api/customers/${customerId}`);
      console.log('Delete Response:', response.data); // Debug log
      alert('Customer deleted successfully!');
      await updateAllData(); // Refresh the list
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error deleting customer: ' + (error.response?.data?.error || error.message));
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [allCustomers, filters, sortBy, sortOrder]);

  return (
    <div className="bg-white shadow-xl rounded-xl p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer List</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input 
          placeholder="Search by City" 
          value={filters.city} 
          onChange={(e) => setFilters({...filters, city: e.target.value})} 
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        />
        <input 
          placeholder="Search by State" 
          value={filters.state} 
          onChange={(e) => setFilters({...filters, state: e.target.value})} 
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        />
        <input 
          placeholder="Search by Pin Code" 
          value={filters.pin_code} 
          onChange={(e) => setFilters({...filters, pin_code: e.target.value})} 
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        />
      </div>
      <div className="flex gap-4 mb-6">
        <button onClick={handleSearch} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">Search</button>
        <button onClick={handleClear} className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition">Clear</button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {isAddressSearch ? (
                <>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pin Code</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id')}>ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('first_name')}>Name {sortBy === 'first_name' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('phone_number')}>Phone {sortBy === 'phone_number' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.data.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"><span className="text-blue-600 font-bold">{c.id}</span></td>
                {isAddressSearch ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.state}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.pin_code}</td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.first_name} {c.last_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.phone_number}</td>
                  </>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link to={`/customers/${c.id}`} className="text-blue-600 hover:text-blue-900 mr-4">View</Link>
                  <Link to={`/customers/${c.id}/edit`} className="text-yellow-600 hover:text-yellow-900 mr-4">Edit</Link>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({length: customers.totalPages || 1}, (_, i) => (
          <button 
            key={i} 
            onClick={() => handlePage(i+1)} 
            className={`px-4 py-2 rounded-lg ${currentPage === i+1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-500 transition`}
          >
            {i+1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CustomerList; 