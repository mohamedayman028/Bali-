import React from 'react';

const ProductCard = ({ product, onClick }) => {
    return (
        <div
            className="product-card"
            style={{
                backgroundColor: 'var(--color-bg-paper)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                direction: 'rtl',
                textAlign: 'right'
            }}
            onClick={() => onClick && onClick(product)}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
        >
            <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3' }}>
                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                {/* Steam Animation for Hot Drinks */}
                {product.category === 'hot' && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '10%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '60px',
                            height: '60px',
                            pointerEvents: 'none'
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                width: '8px',
                                height: '20px',
                                backgroundColor: '#FFF',
                                borderRadius: '50%',
                                filter: 'blur(8px)',
                                animation: 'steam 2s infinite ease-out',
                                left: '20%'
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                width: '10px',
                                height: '25px',
                                backgroundColor: '#FFF',
                                borderRadius: '50%',
                                filter: 'blur(8px)',
                                animation: 'steam 2.5s infinite ease-out 0.5s',
                                left: '50%'
                            }}
                        />
                    </div>
                )}
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--color-text-main)', fontFamily: 'var(--font-heading)' }}>{product.name}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '16px', flexGrow: 1, lineHeight: '1.8', direction: 'rtl', textAlign: 'right' }}>{product.descriptionAr || product.description}</p>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 'auto',
                    gap: '15px',
                    flexWrap: 'wrap'
                }}>
                    {product.priceSmall && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginBottom: '2px' }}>Small</div>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                {product.priceSmall}
                            </span>
                        </div>
                    )}
                    {product.priceMedium && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginBottom: '2px' }}>Standard</div>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                {product.priceMedium}
                            </span>
                        </div>
                    )}
                    {product.priceLarge && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginBottom: '2px' }}>Large</div>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                {product.priceLarge}
                            </span>
                        </div>
                    )}
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', alignSelf: 'flex-end', marginBottom: '2px' }}>EGP</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
