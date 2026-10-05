import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PersonIcon from "@mui/icons-material/Person";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "./signup.css";
import LegalModal, { type LegalTab } from "../../common components/LegalModal";

interface FormData {
  labName: string;
  adminName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  labName?: string;
  adminName?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const initialForm: FormData = {
  labName: "",
  adminName: "",
  email: "",
  phone: "",
  address: "",
  role: "",
  password: "",
  confirmPassword: "",
};

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState<LegalTab>("terms");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));
  };

  const handleRoleChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = event.target;

    setFormData((previous) => ({
      ...previous,
      role: value,
    }));

    setErrors((previous) => ({
      ...previous,
      role: undefined,
    }));
  };

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!formData.labName.trim()) {
      newErrors.labName = "Laboratory name is required.";
    }

    if (!formData.adminName.trim()) {
      newErrors.adminName = "Admin name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Laboratory address is required.";
    }

    if (!formData.role) {
      newErrors.role = "Please select a role.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!acceptedTerms) {
      newErrors.terms =
        "Please accept the Terms & Conditions and Privacy Policy.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const signupData = {
        labName: formData.labName.trim(),
        adminName: formData.adminName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        role: formData.role,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      localStorage.setItem(
        "lab_signup_data",
        JSON.stringify(signupData)
      );

      console.log("Signup successful:", {
        ...signupData,
        password: "********",
        confirmPassword: "********",
      });

      navigate("/login");
    } catch (error) {
      console.error("Signup localStorage error:", error);

      setErrors({
        email: "Unable to create account. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openLegalModal = (tab: LegalTab) => {
    setActiveLegalTab(tab);
    setShowLegalModal(true);
  };

  const handleAcceptLegal = () => {
    setAcceptedTerms(true);

    setErrors((previous) => ({
      ...previous,
      terms: undefined,
    }));

    setShowLegalModal(false);
  };

  return (
    <div className="signup-page">
      <div className="signup-layout">
        <section className="signup-brand-panel">
          <div className="brand-content">
            <div className="brand-logo">
              <div className="brand-logo-icon">
                <ScienceOutlinedIcon />
              </div>

              <div>
                <h1>LabCare</h1>
                <span>Laboratory Management System</span>
              </div>
            </div>

            <div className="brand-main-content">
              <div className="brand-badge">
                <CheckCircleIcon />
                <span>Smart Laboratory Operations</span>
              </div>

              <h2>
                Manage your laboratory
                <span> smarter and faster.</span>
              </h2>

              <p>
                Bring patients, samples, testing, results, billing and
                laboratory operations together in one secure platform.
              </p>

              <div className="brand-features">
                <div className="brand-feature">
                  <div className="feature-icon">
                    <ScienceOutlinedIcon />
                  </div>

                  <div>
                    <strong>Complete Lab Management</strong>
                    <span>
                      Organize laboratory operations from one platform.
                    </span>
                  </div>
                </div>

                <div className="brand-feature">
                  <div className="feature-icon">
                    <CheckCircleIcon />
                  </div>

                  <div>
                    <strong>Accurate & Secure</strong>
                    <span>
                      Keep laboratory and patient information protected.
                    </span>
                  </div>
                </div>

                <div className="brand-feature">
                  <div className="feature-icon">
                    <PersonIcon />
                  </div>

                  <div>
                    <strong>Role-Based Access</strong>
                    <span>
                      Give every team member the right level of access.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="brand-footer">
              © 2026 LabCare. All rights reserved.
            </div>
          </div>
        </section>

        {/* Signup Form */}
        <section className="signup-form-section">
          <div className="signup-form-wrapper">
            <div className="mobile-brand">
              <div className="mobile-brand-icon">
                <ScienceOutlinedIcon />
              </div>

              <div>
                <strong>LabCare</strong>
                <span>Laboratory Management System</span>
              </div>
            </div>

            <div className="signup-heading">
              <span className="signup-eyebrow">
                GET STARTED
              </span>

              <h2>Create your laboratory account</h2>

              <p>
                Set up your laboratory and administrator account to get
                started.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="signup-form"
            >

              {/* Laboratory Information */}
              <div className="form-section">
                <div className="form-section-heading">
                  <div className="section-number">01</div>

                  <div>
                    <h3>Laboratory Information</h3>
                    <p>Tell us about your laboratory.</p>
                  </div>
                </div>

                <div className="form-grid">
                  {/* Laboratory Name */}
                  <div className="form-field full-width">

                    <label htmlFor="labName">
                      Laboratory Name
                      <span>*</span>
                    </label>

                    <div
                      className={`input-wrapper ${errors.labName ? "input-error" : ""
                        }`}
                    >
                      <ScienceOutlinedIcon />

                      <input
                        id="labName"
                        name="labName"
                        type="text"
                        placeholder="Enter laboratory name"
                        value={formData.labName}
                        onChange={handleChange}
                      />
                    </div>

                    {errors.labName && (
                      <p className="field-error">
                        {errors.labName}
                      </p>
                    )}
                  </div>

                  <div className="form-field full-width">
                    <label htmlFor="address">
                      Laboratory Address
                      <span>*</span>
                    </label>

                    <div
                      className={`input-wrapper textarea-wrapper ${errors.address ? "input-error" : ""
                        }`}
                    >
                      <LocationOnOutlinedIcon />

                      <textarea
                        id="address"
                        name="address"
                        placeholder="Enter complete laboratory address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>

                    {errors.address && (
                      <p className="field-error">
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Information */}
              <div className="form-section">
                <div className="form-section-heading">
                  <div className="section-number">02</div>

                  <div>
                    <h3>Administrator Information</h3>
                    <p>
                      Create the primary administrator account.
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="adminName">
                      Administrator Name
                      <span>*</span>
                    </label>

                    <div
                      className={`input-wrapper ${errors.adminName ? "input-error" : ""
                        }`}
                    >
                      <PersonIcon />

                      <input
                        id="adminName"
                        name="adminName"
                        type="text"
                        placeholder="Enter administrator name"
                        value={formData.adminName}
                        onChange={handleChange}
                      />
                    </div>

                    {errors.adminName && (
                      <p className="field-error">
                        {errors.adminName}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone">
                      Phone Number
                      <span>*</span>
                    </label>

                    <div
                      className={`input-wrapper ${errors.phone ? "input-error" : ""
                        }`}
                    >
                      <PhoneOutlinedIcon />

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="10-digit phone number"
                        value={formData.phone}
                        onChange={(event) => {
                          const value =
                            event.target.value.replace(/\D/g, "");

                          setFormData((previous) => ({
                            ...previous,
                            phone: value,
                          }));

                          setErrors((previous) => ({
                            ...previous,
                            phone: undefined,
                          }));
                        }}
                      />
                    </div>

                    {errors.phone && (
                      <p className="field-error">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="form-field">

                    <label htmlFor="email">
                      Email Address
                      <span>*</span>
                    </label>

                    <div
                      className={`input-wrapper ${errors.email ? "input-error" : ""
                        }`}
                    >
                      <EmailOutlinedIcon />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="admin@example.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    {errors.email && (
                      <p className="field-error">
                        {errors.email}
                      </p>
                    )}

                  </div>

                  {/* Role */}
                  <div className="form-field">

                    <label htmlFor="role">
                      Role
                      <span>*</span>
                    </label>

                    <div
                      className={`role-input-wrapper ${errors.role ? "input-error" : ""
                        }`}
                    >
                      <PersonIcon />

                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleRoleChange}
                      >
                        <option value="">Select your role</option>
                        <option value="admin">Admin</option>
                        <option value="receptionist">Receptionist</option>
                        <option value="lab_technician">Lab Technician</option>
                      </select>
                    </div>

                    {errors.role && (
                      <p className="field-error">
                        {errors.role}
                      </p>
                    )}

                  </div>

                  {/* Password */}
                  <div className="form-field">

                    <label htmlFor="password">
                      Password
                      <span>*</span>
                    </label>

                    <div
                      className={`input-wrapper ${errors.password ? "input-error" : ""
                        }`}
                    >
                      <LockOutlinedIcon />

                      <input
                        id="password"
                        name="password"
                        type={
                          showPassword ? "text" : "password"
                        }
                        placeholder="Minimum 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowPassword(
                            (previous) => !previous
                          )
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </button>
                    </div>

                    {errors.password && (
                      <p className="field-error">
                        {errors.password}
                      </p>
                    )}

                  </div>

                  {/* Confirm Password */}
                  <div className="form-field">

                    <label htmlFor="confirmPassword">
                      Confirm Password
                      <span>*</span>
                    </label>

                    <div
                      className={`input-wrapper ${errors.confirmPassword
                        ? "input-error"
                        : ""
                        }`}
                    >
                      <LockOutlinedIcon />

                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowConfirmPassword(
                            (previous) => !previous
                          )
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </button>
                    </div>

                    {errors.confirmPassword && (
                      <p className="field-error">
                        {errors.confirmPassword}
                      </p>
                    )}

                  </div>

                </div>
              </div>

              {/* Legal Consent */}
              <div className="terms-container">

                <label className="terms-checkbox">

                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => {
                      setAcceptedTerms(
                        event.target.checked
                      );

                      if (event.target.checked) {
                        setErrors((previous) => ({
                          ...previous,
                          terms: undefined,
                        }));
                      }
                    }}
                  />

                  <span className="custom-checkbox">
                    {acceptedTerms && "✓"}
                  </span>

                  <span className="terms-text">
                    I agree to{" "}
                    <button
                      type="button"
                      className="terms-link"
                      onClick={() =>
                        openLegalModal("terms")
                      }
                    >
                      Terms & Conditions
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      className="terms-link"
                      onClick={() =>
                        openLegalModal("privacy")
                      }
                    >
                      Privacy Policy
                    </button>
                    .
                  </span>

                </label>

                {errors.terms && (
                  <p className="field-error terms-error">
                    {errors.terms}
                  </p>
                )}

              </div>

              {/* Submit */}
              <button
                type="submit"
                className="signup-submit"
                disabled={isSubmitting}
              >
                <span>
                  {isSubmitting
                    ? "Creating Account..."
                    : "Create Laboratory Account"}
                </span>

                <span className="submit-arrow">
                  {isSubmitting ? "..." : "→"}
                </span>
              </button>

            </form>

            <div className="login-link">
              Already have an account?
              <Link to="/login">Sign in</Link>
            </div>

            <div className="mobile-footer">
              <span>
                Secure laboratory management platform
              </span>
            </div>

          </div>
        </section>
      </div>

      <LegalModal
        isOpen={showLegalModal}
        activeTab={activeLegalTab}
        onTabChange={setActiveLegalTab}
        onAccept={handleAcceptLegal}
        onClose={() => setShowLegalModal(false)}
      />
    </div>
  );
};

export default Signup;