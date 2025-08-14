import React, { useState } from 'react';
import { CONSENT_MESSAGES } from '../constants/consent';

interface ConsentCheckboxProps {
  stepNumber: number;
  register: any;
  errors: any;
  watch: any;
}

const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({ 
  stepNumber, 
  register, 
  errors, 
  watch 
}) => {
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');
  const fieldName = `consent_step${stepNumber}`;
  
  // Safe message access function
  const getConsentMessage = (): string => {
    const stepKey = `step${stepNumber}`;
    const messageObj = CONSENT_MESSAGES[stepKey];
    
    if (messageObj && messageObj[language]) {
      return messageObj[language];
    }
    
    // Fallback to step1 if current step doesn't exist
    return CONSENT_MESSAGES.step1[language];
  };
  
  return (
    <div style={consentStyles.container}>
      {/* Language Toggle */}
      <div style={consentStyles.languageToggle}>
        <button
          type="button"
          style={{
            ...consentStyles.langBtn,
            ...(language === 'english' ? consentStyles.langBtnActive : {})
          }}
          onClick={() => setLanguage('english')}
        >
          English
        </button>
        <button
          type="button"
          style={{
            ...consentStyles.langBtn,
            ...(language === 'hindi' ? consentStyles.langBtnActive : {})
          }}
          onClick={() => setLanguage('hindi')}
        >
          हिंदी
        </button>
      </div>

      <div style={consentStyles.box}>
        <label style={consentStyles.label}>
          <input
            type="checkbox"
            {...register(fieldName, { 
              required: "Declaration and consent is required to proceed" 
            })}
            style={consentStyles.checkbox}
          />
          <span style={consentStyles.icon}>✓</span>
        </label>
        
        <div style={consentStyles.content}>
          <div style={consentStyles.declarationText}>
            <p style={{
              ...consentStyles.text,
              fontFamily: language === 'hindi' ? 
                "'Noto Sans Devanagari', 'Arial Unicode MS', sans-serif" : 
                "inherit"
            }}>
              {getConsentMessage()}
            </p>
          </div>
          
          <div style={consentStyles.links}>
            <a href="/privacy-policy" target="_blank" rel="noopener" style={consentStyles.link}>
              {language === 'english' ? 'Privacy Policy' : 'गोपनीयता नीति'}
            </a>
            <span> | </span>
            <a href="/terms-conditions" target="_blank" rel="noopener" style={consentStyles.link}>
              {language === 'english' ? 'Terms & Conditions' : 'नियम व शर्तें'}
            </a>
          </div>
        </div>
      </div>
      
      {errors[fieldName] && (
        <div style={consentStyles.error}>
          {language === 'english' 
            ? errors[fieldName].message 
            : 'आगे बढ़ने के लिए घोषणा और सहमति आवश्यक है'
          }
        </div>
      )}
    </div>
  );
};

// Consent styles
const consentStyles: Record<string, React.CSSProperties> = {
  container: {
    margin: "20px 0",
    padding: "20px",
    border: "2px solid #444",
    borderRadius: "8px",
    backgroundColor: "#1a1a1a",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },
  languageToggle: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
    justifyContent: "flex-end",
  },
  langBtn: {
    padding: "6px 12px",
    border: "1px solid #555",
    background: "#2b2b2b",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    transition: "all 0.2s",
    color: "#ddd",
    fontWeight: "500",
  },
  langBtnActive: {
    background: "#2f80ed",
    color: "white",
    borderColor: "#2f80ed",
  },
  box: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    position: "relative" as const,
    marginTop: "4px",
  },
  checkbox: {
    width: "20px",
    height: "20px",
    margin: "0",
    cursor: "pointer",
    accentColor: "#2f80ed",
  },
  icon: {
    display: "none",
    position: "absolute" as const,
    left: "3px",
    top: "1px",
    color: "white",
    fontSize: "12px",
    pointerEvents: "none" as const,
  },
  content: {
    flex: 1,
  },
  declarationText: {
    padding: "12px",
    background: "#252525",
    borderLeft: "4px solid #2f80ed",
    borderRadius: "4px",
    marginBottom: "12px",
  },
  text: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#ddd",
    margin: "0",
    fontWeight: "500",
    textAlign: "justify" as const,
  },
  links: {
    marginTop: "8px",
    fontSize: "12px",
    textAlign: "center" as const,
  },
  link: {
    color: "#56ccf2",
    textDecoration: "none",
    fontWeight: "500",
  },
  error: {
    color: "#ff4444",
    fontSize: "12px",
    marginTop: "8px",
    padding: "8px",
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    borderRadius: "4px",
    borderLeft: "4px solid #ff4444",
  },
};

export default ConsentCheckbox;
