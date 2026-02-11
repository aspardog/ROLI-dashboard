import PropTypes from 'prop-types';
import { COLORS } from '../constants';

export default function Accordion({
  isExpanded,
  onToggle,
  title,
  selectedCount,
  totalCount,
  children,
  actionButtons
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '6px',
      border: '1px solid #e5e5e5',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: isExpanded ? '#fafafa' : 'white',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={onToggle}
      >
        <span style={{
          fontSize: '18px',
          marginRight: '8px',
          transition: 'transform 0.2s',
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
        }}>
          ▶
        </span>
        <span style={{
          flex: 1,
          fontSize: '14px',
          fontWeight: '600',
          color: COLORS.text
        }}>
          {title}
        </span>
        {selectedCount !== undefined && totalCount !== undefined && (
          <span style={{
            fontSize: '12px',
            color: COLORS.muted,
            marginRight: actionButtons ? '12px' : '0'
          }}>
            {selectedCount} / {totalCount}
          </span>
        )}
        {actionButtons && (
          <div onClick={(e) => e.stopPropagation()}>
            {actionButtons}
          </div>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div style={{
          padding: '12px 16px 12px 48px',
          borderTop: '1px solid #f0f0f0'
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

Accordion.propTypes = {
  isExpanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  selectedCount: PropTypes.number,
  totalCount: PropTypes.number,
  children: PropTypes.node,
  actionButtons: PropTypes.node
};
