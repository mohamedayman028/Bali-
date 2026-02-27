import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const ProductModal = ({ product, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        setIsVisible(true);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for exit animation
        setTimeout(onClose, 300);
    };

    if (!product) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backdropFilter: 'blur(8px)',
                backgroundColor: `rgba(0,0,0, ${isVisible ? 0.6 : 0})`,
                transition: 'background-color 0.3s ease',
                padding: '20px'
            }}
            onClick={handleClose}
        >
            <div
                style={{
                    backgroundColor: 'var(--color-bg-paper)',
                    width: '100%',
                    maxWidth: '500px',
                    maxHeight: '90vh',
                    borderRadius: 'var(--radius-lg)',
                    overflowY: 'auto',
                    position: 'relative',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    direction: 'rtl',
                    textAlign: 'right'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        left: '15px',
                        zIndex: 10,
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '8px',
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    <X size={20} color="var(--color-text-main)" />
                </button>

                {/* Product Image */}
                <div style={{ position: 'relative', height: '300px' }}>
                    <img
                        src={product.image}
                        alt={product.name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: '80px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                        }}
                    />
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-text-main)', margin: 0, marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>{product.name}</h2>

                        {/* Pricing */}
                        <div style={{
                            display: 'flex',
                            gap: '30px',
                            justifyContent: 'center',
                            marginTop: '10px',
                            flexWrap: 'wrap'
                        }}>
                            {product.priceSmall && (
                                <div style={{ textAlign: 'center', minWidth: '70px' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '4px' }}>Small</div>
                                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                        {product.priceSmall}
                                    </span>
                                </div>
                            )}
                            {product.priceMedium && (
                                <div style={{ textAlign: 'center', minWidth: '70px' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '4px' }}>Standard</div>
                                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                        {product.priceMedium}
                                    </span>
                                </div>
                            )}
                            {product.priceLarge && (
                                <div style={{ textAlign: 'center', minWidth: '70px' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '4px' }}>Large</div>
                                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                        {product.priceLarge}
                                    </span>
                                </div>
                            )}
                            <div style={{ alignSelf: 'flex-end', paddingBottom: '4px', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>EGP</div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        {product.tags && product.tags.map((tag, index) => (
                            <span
                                key={index}
                                style={{
                                    fontSize: '0.8rem',
                                    padding: '4px 12px',
                                    backgroundColor: 'var(--color-primary-light)',
                                    color: '#FFF',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    opacity: 0.9
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>الوصف</h4>
                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.9', direction: 'rtl', textAlign: 'right' }}>
                            {product.descriptionAr || product.longDescription || product.description}
                        </p>
                    </div>

                    {/* Ingredients */}
                    {product.ingredients && (
                        <div style={{ marginBottom: '30px' }}>
                            <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>المكونات</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {product.ingredients.map((ing, i) => (
                                    <li
                                        key={i}
                                        style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--color-text-secondary)',
                                            padding: '4px 0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginLeft: '10px'
                                        }}
                                    >
                                        • {ing}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
