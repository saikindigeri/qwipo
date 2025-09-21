import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AddressForm = () => {
  const { id: customerId, addrId } = useParams();
  const isEdit = !!addrId;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ address_details: '', city: '', state: '', pin_code: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [fetchError, setFetchError] = useState(null); // To display fetch errors

  const validate = () => {
    const newErrors = {};
    if (!formData.address_details || formData.address_details.length < 5) newErrors.address_details = 'Min 5 chars';
    if (!formData.city || formData.city.length < 2) newErrors.city = 'Min 2 chars';
    if (!formData.state || formData.state.length < 2) newErrors.state = 'Min 2 chars';
    if (!formData.pin_code || !/^\d{5,6}$/.test(formData.pin_code)) newErrors.pin_code = '5-6 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (isEdit) {
        await axios.put(`/api/addresses/${addrId}`, {
          address_details: formData.address_details,
          city: formData.city,
          state: formData.state,
          pin_code: formData.pin_code
        });
      } else {
        await axios.post(`/api/customers/${customerId}/addresses`, {
          address_details: formData.address_details,
          city: formData.city,
          state: formData.state,
          pin_code: formData.pin_code
        });
      }
      alert(isEdit ? 'Address Updated!' : 'Address Created!');
      navigate(`/customers/${customerId}/addresses`);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  useEffect(() => {
    if (isEdit) {
      const loadData = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`/api/addresses/${addrId}`);
          console.log('API Response for GET /api/addresses/:id:', res.data); // Debug log
          // Ensure the response has the expected fields
          const addressData = {
            address_details: res.data.address_details || '',
            city: res.data.city || '',
            state: res.data.state || '',
            pin_code: res.data.pin_code || ''
          };
          setFormData(addressData);
          setFetchError(null);
        } catch (error) {
          console.error('Error loading address:', error);
          setFetchError(error.response?.data?.error || error.message || 'Failed to load address data');
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [addrId, isEdit]);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;
  if (fetchError) return (
    <div className="max-w-md mx-auto bg-white shadow-xl rounded-xl p-8">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
      <p className="text-red-500">{fetchError}</p>
      <Link to={`/customers/${customerId}/addresses`} className="mt-4 inline-block bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition">Back to Addresses</Link>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl rounded-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Address' : 'New Address'}</h2>
        <Link to={`/customers/${customerId}/addresses`} className="text-gray-500 hover:text-gray-700">← Back</Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address Details</label>
          <input 
            value={formData.address_details} 
            onChange={(e) => setFormData({...formData, address_details: e.target.value})} 
            className={`w-full px-4 py-3 border rounded-lg ${errors.address_details ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`} 
          />
          {errors.address_details && <p className="text-red-500 text-sm mt-1">{errors.address_details}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input 
              value={formData.city} 
              onChange={(e) => setFormData({...formData, city: e.target.value})} 
              className={`w-full px-4 py-3 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`} 
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input 
              value={formData.state} 
              onChange={(e) => setFormData({...formData, state: e.target.value})} 
              className={`w-full px-4 py-3 border rounded-lg ${errors.state ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`} 
            />
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
          <input 
            value={formData.pin_code} 
            onChange={(e) => setFormData({...formData, pin_code: e.target.value})} 
            className={`w-full px-4 py-3 border rounded-lg ${errors.pin_code ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`} 
          />
          {errors.pin_code && <p className="text-red-500 text-sm mt-1">{errors.pin_code}</p>}
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium">{isEdit ? 'Update Address' : 'Save Address'}</button>
      </form>
    </div>
  );
};

export default AddressForm; 