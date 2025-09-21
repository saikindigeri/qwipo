import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const AddressList = ({ updateAllData }) => {
  const { id } = useParams();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const addrRes = await axios.get(`/api/customers/${id}/addresses`);
        setAddresses(addrRes.data.addresses);
      } catch (error) {
        alert('Error loading addresses: ' + (error.response?.data?.error || error.message));
      }
    };
    loadAddresses();
  }, [id]);

  const handleDeleteAddress = async (addrId) => {
    if (confirm('Sure?')) {
      try {
        await axios.delete(`/api/addresses/${addrId}`);
        alert('Deleted!');
        await updateAllData();
        const addrRes = await axios.get(`/api/customers/${id}/addresses`);
        setAddresses(addrRes.data.addresses);
      } catch (error) {
        alert('Error: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Addresses</h3>
        <Link to={`/customers/${id}/addresses/new`} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">Add Address</Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address Details</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pin Code</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {addresses.map(a => (
              <tr key={a.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.address_details}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.city}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.state}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.pin_code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link to={`/customers/${id}/addresses/${a.id}/edit`} className="text-yellow-600 hover:text-yellow-900 mr-4">Edit</Link>
                  <button onClick={() => handleDeleteAddress(a.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <Link to={`/customers/${id}`} className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition">Back to Detail</Link>
      </div>
    </div>
  );
};

export default AddressList;