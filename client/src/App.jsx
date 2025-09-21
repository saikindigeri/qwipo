import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import CustomerDetail from './components/CustomerDetail';
import AddressList from './components/AddressList';
import AddressForm from './components/AddressForm';

axios.defaults.baseURL = 'https://qwipo-pwzl.onrender.com';

function App() {
  const [allCustomers, setAllCustomers] = useState([]);

  const fetchAllData = async () => {
    try {
      const response = await axios.get('/api/customers', { params: { limit: 1000 } });
      const custList = response.data.data;
      const combined = [];
      for (const cust of custList) {
        const addrRes = await axios.get(`/api/customers/${cust.id}/addresses`);
        const custWithAddrs = { ...cust, addresses: addrRes.data.addresses };
        combined.push(custWithAddrs);
      }
      setAllCustomers(combined);
    } catch (error) {
      alert('Error fetching data: ' + (error.response?.data?.error || error.message));
    }
  };

  const updateAllData = async () => {
    await fetchAllData();
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-900">Customer </Link>
          <Link to="/customers/new" className="bg-black text-white px-6 py-2 rounded-lg  ">New Customer</Link>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto py-6 px-4">
        <Routes>
          <Route path="/" element={<CustomerList allCustomers={allCustomers} updateAllData={updateAllData} />} />
          <Route path="/customers" element={<CustomerList allCustomers={allCustomers} updateAllData={updateAllData} />} />
          <Route path="/customers/new" element={<CustomerForm updateAllData={updateAllData} />} />
          <Route path="/customers/:id/edit" element={<CustomerForm updateAllData={updateAllData} />} />
          <Route path="/customers/:id" element={<CustomerDetail updateAllData={updateAllData} />} />
          <Route path="/customers/:id/addresses" element={<AddressList updateAllData={updateAllData} />} />
          <Route path="/customers/:id/addresses/new" element={<AddressForm />} />
          <Route path="/customers/:id/addresses/:addrId/edit" element={<AddressForm />} />
        </Routes>
      </div>
    </div>
  );
}

export default App; 