import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssetsList, getAssetPassport } from '../services/api';
import { Link } from 'react-router-dom';

const AssetPassport = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [filterType, setFilterType] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterType !== 'All') params.asset_type = filterType;
            const res = await getAssetsList(params);
            setAssets(res || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, [filterType]);

    const handleInspect = async (assetId) => {
        try {
            const passport = await getAssetPassport(assetId);
            setSelectedAsset(passport);
        } catch (e) {
            console.error(e);
        }
    };

    const filtered = assets.filter((a) => {
        const text = `${a.asset_name} ${a.asset_id} ${a.contractor?.company_name} ${a.hierarchy?.district}`.toLowerCase();
        return text.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="page-bg" style={{ minHeight: '100vh', paddingBottom: 80 }}>
            {/* Hero Header */}
            <section style={{
                background: 'var(--bg-secondary)', padding: '36px 0 28px',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <div className="container-js">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <span style={{
                                fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                                background: '#EAF2FF', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>
                                🏛️ Digital Asset Passport Registry
                            </span>
                            <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', margin: '6px 0 8px', color: 'var(--text-primary)' }}>
                                Public Infrastructure Asset Registry
                            </h1>
                            <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 650, margin: 0 }}>
                                Complete lifecycle tracking from commissioning date, contractor liability to active Defect Liability Period (DLP) warranty.
                            </p>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 260 }}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by Asset ID, Road Name, Contractor or District..."
                                    className="input-js"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                                {['All', 'Road', 'Street Light', 'Drainage', 'Water Pipeline'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setFilterType(t)}
                                        className={filterType === t ? 'btn-primary' : 'btn-secondary'}
                                        style={{ fontSize: 12, height: 42, padding: '0 18px', whiteSpace: 'nowrap' }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Asset Cards Grid */}
            <div className="container-js" style={{ paddingTop: 32 }}>
                {loading ? (
                    <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>🏛️</div>
                        <p style={{ fontWeight: 600 }}>Loading Digital Asset Passports...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="card-js" style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: 40, marginBottom: 8, opacity: 0.5 }}>🔍</div>
                        <h3 style={{ fontSize: 18, marginBottom: 4 }}>No assets found</h3>
                        <p style={{ fontSize: 14 }}>Try adjusting your search or category filters.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20
                    }}>
                        {filtered.map((asset) => {
                            const contract = asset.contract || {};
                            const contractor = asset.contractor || {};
                            const dlpEnd = contract.dlp_end_date ? new Date(contract.dlp_end_date) : null;
                            const isDlpActive = dlpEnd && dlpEnd > new Date();

                            return (
                                <motion.div
                                    key={asset.asset_id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="card-js"
                                    style={{
                                        padding: 24, display: 'flex', flexDirection: 'column',
                                        justifyContent: 'space-between', gap: 16
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <span style={{
                                                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                                background: '#EAF2FF', color: 'var(--accent)', fontFamily: 'var(--font-heading)'
                                            }}>
                                                #{asset.asset_id}
                                            </span>
                                            <span style={{
                                                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                                background: isDlpActive ? '#FEF3C7' : '#F1F5F9',
                                                color: isDlpActive ? '#B45309' : '#64748B'
                                            }}>
                                                {isDlpActive ? '⚡ DLP Guarantee Active' : 'DLP Expired'}
                                            </span>
                                        </div>

                                        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '4px 0 6px', lineHeight: 1.3 }}>
                                            {asset.asset_name}
                                        </h3>
                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 14px' }}>
                                            📍 {asset.location?.address || `${asset.hierarchy?.district}, UP`}
                                        </p>

                                        <div style={{
                                            background: 'var(--bg-primary)', padding: 14, borderRadius: 14,
                                            border: '1px solid var(--border-light)', fontSize: 12, display: 'flex',
                                            flexDirection: 'column', gap: 6
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Contractor:</span>
                                                <strong style={{ color: 'var(--text-primary)' }}>{contractor.company_name}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Contract ID:</span>
                                                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{contract.contract_id}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Active Defects:</span>
                                                <strong style={{ color: asset.active_defects_count > 0 ? '#D97706' : 'var(--color-success)' }}>
                                                    {asset.active_defects_count || 0} defects
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleInspect(asset.asset_id)}
                                        className="btn-secondary"
                                        style={{ width: '100%', fontSize: 12, height: 38 }}
                                    >
                                        🔍 Inspect Asset Passport
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detailed Passport Modal */}
            <AnimatePresence>
                {selectedAsset && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedAsset(null)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 100, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(14,26,51,0.5)', backdropFilter: 'blur(6px)', padding: 20
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="card-js"
                            style={{ width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', padding: 32, borderRadius: 24 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <div>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                        background: '#EAF2FF', color: 'var(--accent)', display: 'inline-block', marginBottom: 6
                                    }}>
                                        DIGITAL ASSET PASSPORT #{selectedAsset.asset_id}
                                    </span>
                                    <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{selectedAsset.asset_name}</h2>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                                        Authority: {selectedAsset.hierarchy?.local_authority} • District: {selectedAsset.hierarchy?.district}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedAsset(null)}
                                    style={{
                                        width: 32, height: 32, borderRadius: '50%', border: 'none',
                                        background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: 16,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >✕</button>
                            </div>

                            {/* Passport Specifications */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div style={{ background: 'var(--bg-primary)', padding: 18, borderRadius: 16, border: '1px solid var(--border-light)' }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                                        🏗️ Construction & Contract
                                    </span>
                                    <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Contract:</span><strong>{selectedAsset.contract?.contract_id}</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Sanctioned:</span><strong>{selectedAsset.contract?.sanctioned_amount}</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Completion:</span><strong>{selectedAsset.contract?.completion_date?.split('T')[0] || '2024-11-10'}</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>DLP End:</span><strong style={{ color: 'var(--color-success)' }}>{selectedAsset.contract?.dlp_end_date?.split('T')[0] || '2026-11-10'}</strong></div>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--bg-primary)', padding: 18, borderRadius: 16, border: '1px solid var(--border-light)' }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                                        👷 Contractor Accountability
                                    </span>
                                    <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Company:</span><strong>{selectedAsset.contractor?.company_name}</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Contractor ID:</span><span style={{ fontFamily: 'var(--font-heading)' }}>{selectedAsset.contractor?.contractor_id}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Contact:</span><span>{selectedAsset.contractor?.contact_email}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Liability:</span><strong style={{ color: '#D97706' }}>Under Active Guarantee</strong></div>
                                    </div>
                                </div>
                            </div>

                            {/* Defect History Log */}
                            <div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                                    Defect & Maintenance History ({selectedAsset.defects_history?.length || 0})
                                </span>
                                {(!selectedAsset.defects_history || selectedAsset.defects_history.length === 0) ? (
                                    <div style={{ padding: 20, textAlign: 'center', background: 'var(--bg-primary)', borderRadius: 14, fontSize: 13, color: 'var(--text-secondary)' }}>
                                        No historical defects recorded for this asset.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                                        {selectedAsset.defects_history.map(d => (
                                            <div key={d._id} style={{
                                                padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 12,
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12
                                            }}>
                                                <div>
                                                    <strong style={{ fontFamily: 'var(--font-heading)' }}>{d.ref_id}</strong>
                                                    <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>{d.complaint_text?.substring(0, 40)}...</span>
                                                </div>
                                                <span className="pill-js" style={{ fontSize: 10 }}>{d.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AssetPassport;
