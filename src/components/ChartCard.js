import PropTypes from 'prop-types';
import { COLORS } from '../constants';

export default function ChartCard({
  title,
  subtitle,
  onExport,
  children,
  isEmpty = false,
  emptyMessage = "Please select options to display the chart."
}) {
  return (
    <div className="chart-card" style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      marginBottom: '24px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px'
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: COLORS.text,
            margin: '0 0 4px'
          }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{
              fontSize: '14px',
              color: COLORS.muted,
              margin: '0'
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {onExport && !isEmpty && (
          <button
            onClick={onExport}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              color: 'white',
              backgroundColor: COLORS.top5,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              marginTop: '0'
            }}
          >
            <span style={{ fontSize: '16px' }}>↓</span> Export SVG
          </button>
        )}
      </div>

      {/* Content */}
      {isEmpty ? (
        <p style={{
          fontSize: '14px',
          color: COLORS.muted,
          margin: '0'
        }}>
          {emptyMessage}
        </p>
      ) : (
        children
      )}
    </div>
  );
}

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  onExport: PropTypes.func,
  children: PropTypes.node,
  isEmpty: PropTypes.bool,
  emptyMessage: PropTypes.string
};
