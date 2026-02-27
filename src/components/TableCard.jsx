import React from 'react';
import { Users, CheckCircle, XCircle } from 'lucide-react';

const TableCard = ({ table }) => {
    const isAvailable = table.status === 'available';

    return (
        <div
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all 0.3s ease',
                cursor: 'default'
            }}
            className="hover-card"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)' }}>{table.table_number}</h3>
                {isAvailable ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ade80', fontSize: '0.8rem' }}>
                        <CheckCircle size={14} /> Available
                    </span>
                ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171', fontSize: '0.8rem' }}>
                        <XCircle size={14} /> Occupied
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.6)' }}>
                <Users size={16} />
                <span>Capacity: {table.capacity} persons</span>
            </div>

            <button
                disabled={!isAvailable}
                className="btn-primary"
                style={{
                    marginTop: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isAvailable ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.1)',
                    color: isAvailable ? 'white' : 'rgba(255, 255, 255, 0.3)',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    fontWeight: '600'
                }}
            >
                {isAvailable ? 'Book This Table' : 'Reserved'}
            </button>
        </div>
    );
};

export default TableCard;
