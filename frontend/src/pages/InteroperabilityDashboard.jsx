import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_GATEWAY = 'http://localhost:5000/api';

export default function InteroperabilityDashboard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [masterId, setMasterId] = useState('');
  
  // Hardcoded for demo if not logged in
  const fetchRecords = async () => {
    setLoading(true);
    setData(null);
    try {
      // In a real app, this master_id comes from context or auth token
      const idToFetch = masterId || 'SP-000001';
      const res = await axios.get(`${API_GATEWAY}/citizen/me/records?master_id=${idToFetch}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch interoperability data. Make sure all microservices are running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <header className="mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          SamadhanPath Interoperability Gateway
        </h1>
        <p className="text-gray-400 mt-2">Live Demonstration of Multi-Database Cross-Departmental Identity & Data Fetching</p>
      </header>

      <div className="flex items-center gap-4 mb-8 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">Master Citizen ID</label>
          <input 
            type="text" 
            placeholder="e.g. SP-000001" 
            value={masterId}
            onChange={(e) => setMasterId(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <button 
          onClick={fetchRecords}
          disabled={loading}
          className="mt-6 px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Fetching & Transforming...' : 'Fetch My Government Records'}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Interoperability Monitor */}
          <div className="bg-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl font-mono text-sm">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
              <span className="font-bold text-green-400">Live Interoperability Monitor</span>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            <div className="p-4 h-[600px] overflow-y-auto">
              <AnimatePresence>
                {data.logs.map((log, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    key={idx} 
                    className="mb-2"
                  >
                    <span className="text-gray-500">[{log.time}]</span>{' '}
                    <span className={
                      log.message.includes('SUCCESS') ? 'text-green-400' :
                      log.message.includes('FAILED') ? 'text-red-400' :
                      log.message.includes('TRANSFORMATION') ? 'text-purple-400' :
                      log.message.includes('RESOLVED') ? 'text-blue-400' :
                      'text-gray-300'
                    }>{log.message}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* View Data Transformation */}
          <div className="flex flex-col gap-6">
            
            {/* Common Data Model (Top Right) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 font-bold text-white">
                Gateway: Unified Common Data Model
              </div>
              <div className="p-4 bg-gray-900 overflow-auto max-h-[300px]">
                <pre className="text-emerald-400 text-xs">
                  {JSON.stringify(data.commonDataModel, null, 2)}
                </pre>
              </div>
            </motion.div>

            {/* Raw Department Schemas (Bottom Right) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col"
            >
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 font-bold text-white flex justify-between items-center">
                <span>Raw Department Schemas (Heterogeneous)</span>
                <span className="text-xs bg-gray-600 px-2 py-1 rounded">Before Transformation</span>
              </div>
              <div className="p-4 bg-gray-900 overflow-auto flex-1 grid grid-cols-2 gap-4 text-xs">
                {Object.entries(data.rawResponses).map(([dept, payload]) => (
                  <div key={dept} className="border border-gray-700 rounded p-2">
                    <div className="text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">{dept}</div>
                    <pre className="text-pink-400">{JSON.stringify(payload || 'N/A', null, 2)}</pre>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      )}
    </div>
  );
}
