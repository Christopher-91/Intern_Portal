import React from 'react';

export default function BrandLogo({ size = 'medium', collapsed = false, subtitle = null, className = '' }) {
  const iconSize = size === 'small' ? 28 : size === 'large' ? 44 : 36;
  const textSize = size === 'small' ? 'text-sm' : size === 'large' ? 'text-2xl' : 'text-lg';

  return (
    <div className={`brand-logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <div
        className="brand-logo-mark"
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          minWidth: `${iconSize}px`,
          minHeight: `${iconSize}px`,
          borderRadius: size === 'small' ? '6px' : '9px',
          background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
          display: 'grid',
          placeItems: 'center',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        <svg
          width={iconSize * 0.55}
          height={iconSize * 0.55}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 15l8-8 8 8" />
          <path d="M4 20l8-8 8 8" opacity="0.5" />
        </svg>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: size === 'large' ? '22px' : '17px', color: 'var(--text)' }}>
              Upto<span style={{ color: 'var(--primary, #4F46E5)' }}>Skills</span>
            </span>
            {subtitle && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: 'var(--primary-light, #EEF2FF)',
                  color: 'var(--primary, #4F46E5)',
                  marginLeft: '4px'
                }}
              >
                {subtitle}
              </span>
            )}
          </div>
          {size === 'large' && (
            <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px', fontWeight: 500 }}>
              Internship Management Platform
            </span>
          )}
        </div>
      )}
    </div>
  );
}

