import { COLORS } from '../config';

export default function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="info-modal-content"
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'sticky',
            top: '16px',
            left: '100%',
            marginLeft: '-56px',
            marginTop: '16px',
            marginBottom: '-48px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: COLORS.background,
            color: COLORS.text,
            fontSize: '24px',
            fontWeight: '300',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#e0e0e0'}
          onMouseOut={(e) => e.target.style.backgroundColor = COLORS.background}
        >
          ×
        </button>

        {/* Content */}
        <div style={{ padding: '40px 48px 48px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: COLORS.text, marginTop: 0, marginBottom: '16px', letterSpacing: '-0.5px' }}>
            Rule of Law Index – Data Visualization Tool
          </h2>

          <p style={{ fontSize: '16px', lineHeight: '1.7', color: COLORS.text, marginBottom: '24px' }}>
            This dashboard visualizes data from the <strong>World Justice Project (WJP) Rule of Law Index</strong>, offering a deeper way to explore results and <strong>download publication-ready visuals</strong> for presentations and reports. Built for <strong>anyone</strong> it enables comparisons across <strong>countries, regions, and time</strong>, turning complex rule of law data into clear, actionable insights.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text, marginTop: '32px', marginBottom: '12px' }}>
            What is the Rule of Law Index?
          </h3>
          <p style={{ fontSize: '15px', lineHeight: '1.7', color: COLORS.text, marginBottom: '24px' }}>
            The WJP Rule of Law Index measures how the rule of law is <strong>experienced and perceived in everyday life</strong> around the world, drawing on large-scale household surveys and expert questionnaires. Performance is assessed through <strong>44 sub-factors (indicators)</strong> organized into <strong>8 factors</strong>, providing a multidimensional picture of the rule of law at the <strong>global, regional, and country</strong> level.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text, marginTop: '32px', marginBottom: '12px' }}>
            How is the Index structured?
          </h3>
          <p style={{ fontSize: '15px', lineHeight: '1.7', color: COLORS.text, marginBottom: '16px' }}>
            The Index is organized into eight core dimensions (factors). Each factor captures a distinct component of the rule of law, and together they offer an overall "rule of law profile":
          </p>

          <ol style={{ fontSize: '15px', lineHeight: '1.8', color: COLORS.text, marginBottom: '32px', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '12px' }}>
              <strong>Constraints on Government Powers</strong> – whether those who govern are bound by law and held accountable through institutional and non-governmental checks.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Absence of Corruption</strong> – the extent to which public power is not used for private gain across key institutions.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Open Government</strong> – transparency, access to information, citizen participation, and mechanisms to hold government accountable.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Fundamental Rights</strong> – protection of core human rights closely tied to rule of law.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Order and Security</strong> – how well a society ensures safety and limits crime and violence.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Regulatory Enforcement</strong> – whether regulations are applied fairly, effectively, and with due process.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Civil Justice</strong> – whether people can resolve civil disputes effectively, affordably, and without discrimination or improper influence.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Criminal Justice</strong> – effectiveness, impartiality, integrity, and due process across the criminal justice system.
            </li>
          </ol>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text, marginTop: '32px', marginBottom: '16px' }}>
            Sub-factors (44 indicators)
          </h3>

          {/* Factor 1 */}
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.text, marginTop: '24px', marginBottom: '8px' }}>
            Factor 1 — Constraints on Government Powers
          </h4>
          <ul style={{ fontSize: '14px', lineHeight: '1.7', color: COLORS.text, marginBottom: '16px', paddingLeft: '20px' }}>
            <li>1.1 Government powers are effectively limited by the legislature</li>
            <li>1.2 Government powers are effectively limited by the judiciary</li>
            <li>1.3 Government powers are effectively limited by independent auditing and review</li>
            <li>1.4 Government officials are sanctioned for misconduct</li>
            <li>1.5 Government powers are subject to non-governmental checks</li>
            <li>1.6 Transition of power is subject to the law</li>
          </ul>

          {/* Factor 2 */}
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.text, marginTop: '24px', marginBottom: '8px' }}>
            Factor 2 — Absence of Corruption
          </h4>
          <ul style={{ fontSize: '14px', lineHeight: '1.7', color: COLORS.text, marginBottom: '16px', paddingLeft: '20px' }}>
            <li>2.1 Government officials in the Executive Branch do not use public office for private gain</li>
            <li>2.2 Government officials in the judicial branch do not use public office for private gain</li>
            <li>2.3 Government officials in the police and the military do not use public office for private gain</li>
            <li>2.4 Government officials in the legislative branch do not use public office for private gain</li>
          </ul>

          {/* Factor 3 */}
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.text, marginTop: '24px', marginBottom: '8px' }}>
            Factor 3 — Open Government
          </h4>
          <ul style={{ fontSize: '14px', lineHeight: '1.7', color: COLORS.text, marginBottom: '16px', paddingLeft: '20px' }}>
            <li>3.1 Publicized laws and government data</li>
            <li>3.2 Right to information</li>
            <li>3.3 Civic participation</li>
            <li>3.4 Complaint mechanisms</li>
          </ul>

          {/* Factor 4 */}
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.text, marginTop: '24px', marginBottom: '8px' }}>
            Factor 4 — Fundamental Rights
          </h4>
          <ul style={{ fontSize: '14px', lineHeight: '1.7', color: COLORS.text, marginBottom: '16px', paddingLeft: '20px' }}>
            <li>4.1 Equal treatment and absence of discrimination</li>
            <li>4.2 The right to life and security of the person is effectively guaranteed</li>
            <li>4.3 Due process of law and rights of the accused</li>
            <li>4.4 Freedom of opinion and expression is effectively guaranteed</li>
            <li>4.5 Freedom of belief and religion is effectively guaranteed</li>
            <li>4.6 Freedom from arbitrary interference with privacy is effectively guaranteed</li>
            <li>4.7 Freedom of assembly and association is effectively guaranteed</li>
            <li>4.8 Fundamental labor rights are effectively guaranteed</li>
          </ul>

          {/* Factor 5 */}
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.text, marginTop: '24px', marginBottom: '8px' }}>
            Factor 5 — Order and Security
          </h4>
          <ul style={{ fontSize: '14px', lineHeight: '1.7', color: COLORS.text, marginBottom: '16px', paddingLeft: '20px' }}>
            <li>5.1 Crime is effectively controlled</li>
            <li>5.2 Civil conflict is effectively limited</li>
            <li>5.3 People do not resort to violence to redress personal grievances</li>
          </ul>

          {/* Factor 6 */}
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.text, marginTop: '24px', marginBottom: '8px' }}>
            Factor 6 — Regulatory Enforcement
          </h4>
          <ul style={{ fontSize: '14px', lineHeight: '1.7', color: COLORS.text, marginBottom: '16px', paddingLeft: '20px' }}>
            <li>6.1 Government regulations are effectively enforced</li>
            <li>6.2 Government regulations are applied and enforced without improper influence</li>
            <li>6.3 Administrative proceedings are conducted without unreasonable delay</li>
            <li>6.4 Due process is respected in administrative proceedings</li>
            <li>6.5 The Government does not expropriate without lawful process and adequate compensation</li>
          </ul>

          {/* Factor 7 */}
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.text, marginTop: '24px', marginBottom: '8px' }}>
            Factor 7 — Civil Justice
          </h4>
          <ul style={{ fontSize: '14px', lineHeight: '1.7', color: COLORS.text, marginBottom: '16px', paddingLeft: '20px' }}>
            <li>7.1 People can access and afford civil justice</li>
            <li>7.2 Civil justice is free of discrimination</li>
            <li>7.3 Civil justice is free of corruption</li>
            <li>7.4 Civil justice is free of improper government influence</li>
            <li>7.5 Civil justice is not subject to unreasonable delay</li>
            <li>7.6 Civil justice is effectively enforced</li>
            <li>7.7 Alternative Dispute Resolution Mechanisms are accessible, impartial, and effective</li>
          </ul>

          {/* Factor 8 */}
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.text, marginTop: '24px', marginBottom: '8px' }}>
            Factor 8 — Criminal Justice
          </h4>
          <ul style={{ fontSize: '14px', lineHeight: '1.7', color: COLORS.text, marginBottom: '16px', paddingLeft: '20px' }}>
            <li>8.1 Criminal investigation system is effective</li>
            <li>8.2 Criminal adjudication system is timely and effective</li>
            <li>8.3 Correctional system is effective in reducing criminal behavior</li>
            <li>8.4 Criminal system is impartial</li>
            <li>8.5 Criminal system is free of corruption</li>
            <li>8.6 Criminal system is free of improper government influence</li>
            <li>8.7 Due process of the law and rights of the accused</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
