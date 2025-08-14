"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { UdyamService, UdyamRegistrationData } from "../services/udyamService";
import ConsentCheckbox from "./ConsentCheckbox";
import { ConsentMessage, ConsentMessagesType } from "../constants/consent";

type Option = { value: string; text: string };
type Field = {
  step: number;
  id: string;
  label: string;
  type: string;
  required: boolean;
  pattern?: string;
  maxlength?: number;
  options?: Option[] | null;
  hint?: string;
};

interface SubmissionResult {
  success: boolean;
  message: string;
  udyam_id?: string;
}

export default function DynamicMultiStepForm() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<number>(1);
  const [pinError, setPinError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  const { register, handleSubmit, formState, trigger, setValue, watch, reset } = useForm({ mode: "onTouched" });

  const pinValue = watch("pincode") || "";

  useEffect(() => {
    fetch("/udyam-schema.json")
      .then((r) => r.json())
      .then((data: Field[]) => {
        setFields(data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load schema:", error);
        setFields([]);
        setLoading(false);
      });
  }, []);

  // Auto-fill city/state from PIN
  useEffect(() => {
    if (/^\d{6}$/.test(pinValue)) {
      setPinError("");
      fetch(`https://api.postalpincode.in/pincode/${pinValue}`)
        .then((res) => res.json())
        .then((data) => {
          if (data[0]?.Status === "Success" && data[0]?.PostOffice?.[0]) {
            const postOffice = data[0].PostOffice[0];
            setValue("city", postOffice.District, { shouldValidate: true });
            setValue("state", postOffice.State, { shouldValidate: true });
          } else {
            setPinError("Invalid PIN code");
            setValue("city", "");
            setValue("state", "");
          }
        })
        .catch(() => {
          setPinError("Failed to fetch location");
        });
    } else if (pinValue && pinValue.length === 6) {
      setPinError("Invalid PIN code format");
    }
  }, [pinValue, setValue]);

  // Group fields by step
  const stepsMap = useMemo(() => {
    const map: Record<number, Field[]> = {};
    fields.forEach((f) => {
      if (!map[f.step]) map[f.step] = [];
      map[f.step].push(f);
    });
    return map;
  }, [fields]);

  const maxStep = useMemo(() => Math.max(...fields.map(f => f.step), 1), [fields]);

  // Check if consent is given for current step
  const consentFieldName = `consent_step${step}`;
  const consentChecked = watch(consentFieldName);

  const onNext = async () => {
    // Include consent field in validation
    const current = [...(stepsMap[step]?.map((f) => f.id) || []), consentFieldName];
    const ok = await trigger(current as any);
    if (!ok) return;
    if (step < maxStep) setStep((s) => s + 1);
  };

  const onBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  // Fixed onSubmit function with consent fields
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      console.log("Original form data:", data);
      
      // Validate all fields including consent fields
      const allConsentFields = Array.from({ length: maxStep }, (_, i) => `consent_step${i + 1}`);
      const isValid = await trigger([...Object.keys(data), ...allConsentFields]);
      if (!isValid) {
        console.error("Form validation failed");
        setIsSubmitting(false);
        return;
      }

      // Transform the data before sending (include consent fields)
      const transformedData = {
        ...data,
        itr_filed: data.itr_filed === "yes" || data.itr_filed === true,
        gstin_available: data.gstin_available === "yes" || data.gstin_available === true,
        physically_handicapped: data.physically_handicapped === "yes" || data.physically_handicapped === true,
        // Add consent fields
        consent_step1: data.consent_step1 || false,
        consent_step2: data.consent_step2 || false,
        consent_step3: data.consent_step3 || false,
        consent_step4: data.consent_step4 || false,
        consent_step5: data.consent_step5 || false,
        consent_step6: data.consent_step6 || false,
      };
      
      console.log("Transformed data for backend:", transformedData);
      
      // Submit to backend
      const result = await UdyamService.submitRegistration(transformedData as UdyamRegistrationData);
      
      console.log("Backend response:", result);
      
      if (result.success) {
        setSubmissionResult({
          success: true,
          message: result.message || "Registration submitted successfully!",
          udyam_id: result.udyam_id
        });
        
        // Reset form after successful submission
        reset();
        setStep(1);
      } else {
        setSubmissionResult({
          success: false,
          message: result.message || "Registration failed. Please try again."
        });
        
        // Handle validation errors from backend
        if (result.errors) {
          result.errors.forEach((error: any) => {
            if (error.field) {
              console.error(`Field error - ${error.field}: ${error.message}`);
            }
          });
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmissionResult({
        success: false,
        message: "Network error occurred. Please check your connection and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset();
    setStep(1);
    setSubmissionResult(null);
    setPinError("");
  };

  const renderField = (f: Field) => {
    if (f.type === "checkbox") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input 
            type="checkbox" 
            {...register(f.id, { required: f.required ? "Required" : false })} 
            id={f.id} 
            style={{
              width: "18px",
              height: "18px",
              accentColor: "#2f80ed"
            }}
          />
          <label htmlFor={f.id} style={{ color: "#ddd", cursor: "pointer" }}>
            {f.label}
          </label>
        </div>
      );
    }
    
    if (f.type === "select" || (f.options && f.options.length > 0)) {
      return (
        <select 
          style={styles.input} 
          {...register(f.id, { required: f.required ? "Required" : false })}
        >
          <option value="">-- Select {f.label} --</option>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.text}
            </option>
          ))}
        </select>
      );
    }
    
    return (
      <input
        style={styles.input}
        type={f.type === "date" ? "date" : "text"}
        maxLength={f.maxlength || undefined}
        placeholder={f.hint || `Enter ${f.label}`}
        {...register(f.id, {
          required: f.required ? "Required" : false,
          pattern: f.pattern ? { 
            value: new RegExp(f.pattern), 
            message: "Invalid format" 
          } : undefined
        })}
      />
    );
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.formWrapper}>
          <div style={{ color: "#fff", fontSize: "1.2rem" }}>
            Loading Udyam Registration Form...
          </div>
        </div>
      </div>
    );
  }

  // Show submission result
  if (submissionResult) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ 
              fontSize: "4rem", 
              marginBottom: 20,
              color: submissionResult.success ? "#4caf50" : "#ff4444"
            }}>
            </div>
            
            <h2 style={{ 
              color: submissionResult.success ? "#4caf50" : "#ff4444",
              marginBottom: 16,
              fontSize: "2rem",
              fontWeight: "600"
            }}>
              {submissionResult.success ? "Registration Successful!" : "Registration Failed"}
            </h2>
            
            <p style={{ 
              color: "#ddd", 
              marginBottom: 24, 
              fontSize: "1.1rem",
              lineHeight: "1.5"
            }}>
              {submissionResult.message}
            </p>
            
            {submissionResult.success && submissionResult.udyam_id && (
              <div style={{
                background: "linear-gradient(135deg, #2f80ed, #56ccf2)",
                padding: "24px",
                borderRadius: "12px",
                marginBottom: 32,
                border: "1px solid rgba(255,255,255,0.1)"
              }}>
                <p style={{ 
                  color: "#fff", 
                  marginBottom: 8, 
                  fontSize: "0.95rem",
                  opacity: 0.9
                }}>
                  Your Udyam Registration Number:
                </p>
                <p style={{ 
                  color: "#fff", 
                  fontSize: "1.8rem", 
                  fontWeight: "bold",
                  letterSpacing: "1px"
                }}>
                  {submissionResult.udyam_id}
                </p>
              </div>
            )}
            
            <button
              onClick={resetForm}
              style={{
                ...styles.buttonPrimary,
                padding: "14px 28px",
                fontSize: "1rem"
              }}
            >
              Submit Another Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentFields = stepsMap[step] || [];

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%", maxWidth: 720 }}>
        <div style={styles.card}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{ 
              color: "#fff", 
              fontSize: "2.2rem", 
              fontWeight: "700",
              marginBottom: 8
            }}>
              Udyam Registration
            </h1>
            <p style={{ color: "#999", fontSize: "1rem" }}>
              Complete your MSME registration in {maxStep} simple steps
            </p>
          </div>

          {/* Progress Indicator */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: 16 
            }}>
              <h2 style={styles.heading}>Step {step} of {maxStep}</h2>
              <span style={{ 
                color: "#ddd", 
                fontSize: "0.9rem",
                fontWeight: "500"
              }}>
                {Math.round((step / maxStep) * 100)}% Complete
              </span>
            </div>
            
            {/* Progress Bar */}
            <div style={{
              width: "100%",
              height: 10,
              backgroundColor: "#333",
              borderRadius: 5,
              overflow: "hidden",
              border: "1px solid #444"
            }}>
              <div style={{
                width: `${(step / maxStep) * 100}%`,
                height: "100%",
                background: "linear-gradient(90deg, #2f80ed, #56ccf2)",
                transition: "width 0.4s ease",
                borderRadius: "4px"
              }} />
            </div>

            {/* Step Indicators */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 16
            }}>
              {Array.from({ length: maxStep }, (_, index) => (
                <div
                  key={index}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    backgroundColor: index < step ? "#2f80ed" : index === step ? "#56ccf2" : "#333",
                    color: index <= step ? "#fff" : "#999",
                    border: `2px solid ${index <= step ? "transparent" : "#555"}`,
                    transition: "all 0.3s ease"
                  }}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ marginBottom: 32 }}>
            {currentFields.map((f) => (
              <div key={f.id} style={{ marginBottom: 20 }}>
                {f.type !== "checkbox" && (
                  <label style={styles.label}>
                    {f.label}
                    {f.required ? <span style={{ color: "#ff4444" }}> *</span> : ""}
                  </label>
                )}
                {renderField(f)}
                {f.id === "pincode" && pinError && (
                  <div style={{ 
                    color: "#ff4444", 
                    fontSize: "0.85rem", 
                    marginTop: 6,
                    padding: "4px 8px",
                    backgroundColor: "rgba(255, 68, 68, 0.1)",
                    borderRadius: "4px",
                    border: "1px solid rgba(255, 68, 68, 0.2)"
                  }}>
                    {pinError}
                  </div>
                )}
                <div style={styles.errorText}>
                  {(formState.errors as any)[f.id]?.message}
                </div>
              </div>
            ))}

            {/* Add Consent Checkbox for Each Step */}
            <ConsentCheckbox
              stepNumber={step}
              register={register}
              errors={formState.errors}
              watch={watch}
            />
          </div>

          {/* Navigation Buttons */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            paddingTop: 24,
            borderTop: "1px solid #333"
          }}>
            <button 
              type="button" 
              style={step > 1 ? styles.button : styles.buttonDisabled} 
              onClick={onBack}
              disabled={step === 1}
            >
              ← Previous
            </button>

            <div style={{ 
              color: "#666", 
              fontSize: "0.9rem",
              textAlign: "center"
            }}>
              <div>Step {step} of {maxStep}</div>
              <div style={{ fontSize: "0.8rem", marginTop: 2 }}>
                {currentFields.length} field{currentFields.length !== 1 ? 's' : ''} in this step
              </div>
            </div>

            {step < maxStep ? (
              <button 
                type="button" 
                style={{
                  ...styles.buttonPrimary,
                  opacity: !consentChecked ? 0.6 : 1,
                  cursor: !consentChecked ? "not-allowed" : "pointer"
                }}
                onClick={onNext}
                disabled={!consentChecked}
              >
                Next →
              </button>
            ) : (
              <button 
                type="submit" 
                style={{
                  ...styles.buttonSubmit,
                  opacity: isSubmitting || !consentChecked ? 0.7 : 1,
                  cursor: isSubmitting || !consentChecked ? "not-allowed" : "pointer",
                  padding: "14px 28px"
                }}
                disabled={isSubmitting || !consentChecked}
              >
                {isSubmitting ? (
                  <>
                    <span style={{ marginRight: 8 }}>⏳</span>
                    Submitting...
                  </>
                ) : (
                  "Submit Registration"
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { 
    backgroundColor: "#0f0f0f", 
    minHeight: "100vh", 
    padding: 24, 
    display: "flex", 
    justifyContent: "center",
    alignItems: "flex-start"
  },
  card: { 
    backgroundColor: "#151515", 
    padding: 40, 
    borderRadius: 16, 
    boxShadow: "0 20px 60px rgba(0,0,0,0.8)", 
    width: "100%",
    border: "1px solid #333",
    maxWidth: "720px"
  },
  heading: { 
    color: "#fff", 
    marginBottom: 0,
    fontSize: "1.4rem",
    fontWeight: "600"
  },
  label: { 
    color: "#ddd", 
    marginBottom: 8, 
    display: "block",
    fontSize: "0.95rem",
    fontWeight: "500"
  },
  input: { 
    width: "100%", 
    padding: "14px 16px", 
    borderRadius: 8, 
    border: "1px solid #444", 
    background: "#1f1f1f", 
    color: "#fff",
    fontSize: "1rem",
    transition: "all 0.2s ease",
    outline: "none",
    boxSizing: "border-box" as const
  },
  errorText: { 
    color: "#ff7b7b", 
    fontSize: "0.85rem", 
    marginTop: 6,
    fontWeight: "500",
    padding: "4px 8px",
    backgroundColor: "rgba(255, 123, 123, 0.1)",
    borderRadius: "4px",
    display: "block"
  },
  button: { 
    background: "#2b2b2b", 
    color: "#fff", 
    padding: "12px 20px", 
    border: "none", 
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  buttonDisabled: {
    background: "#1a1a1a", 
    color: "#666", 
    padding: "12px 20px", 
    border: "none", 
    borderRadius: 8,
    cursor: "not-allowed",
    fontSize: "0.95rem"
  },
  buttonPrimary: { 
    background: "linear-gradient(90deg,#2f80ed,#56ccf2)", 
    color: "#fff", 
    padding: "12px 20px", 
    border: "none", 
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
    transition: "all 0.2s ease"
  },
  buttonSubmit: { 
    background: "linear-gradient(90deg,#4caf50,#2ecc71)", 
    color: "#fff", 
    padding: "12px 24px", 
    border: "none", 
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
    transition: "all 0.2s ease"
  },
  formWrapper: {
    color: "#fff",
    fontSize: "1.2rem",
    textAlign: "center" as const,
    padding: "60px 20px"
  }
};

