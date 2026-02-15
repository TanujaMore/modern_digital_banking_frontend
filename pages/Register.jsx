import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false); // ✅ NEW (only addition)
  const [showSuccess, setShowSuccess] = useState(false);


  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};

    if (!fullName.trim())
      newErrors.fullName = "Full Name is required";
    else if (!/^[A-Za-z\s]+$/.test(fullName))
      newErrors.fullName = "Only letters and spaces allowed";
    else if (!/^[A-Z][a-zA-Z]*(\s[A-Z][a-zA-Z]*)*$/.test(fullName))
      newErrors.fullName = "Each word must start with a capital letter";

    if (!email.trim())
      newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Enter valid email (example@gmail.com)";

    if (!phone.trim())
      newErrors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(phone))
      newErrors.phone = "Phone must be exactly 10 digits";

    if (!password.trim())
      newErrors.password = "Password is required";
    else if (
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)
    )
      newErrors.password =
        "Min 8 chars, include letter, number & special character";

    if (!confirmPassword.trim())
      newErrors.confirmPassword = "Confirm Password is required";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!agree)
      newErrors.agree = "You must accept Terms & Privacy Policy";

    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      await API.post("/users/register", {
        name: fullName,
        email,
        phone,
        password,
      });

      setShowSuccess(true);

    } catch {
      alert("Registration failed. Try again.");
    }
  };

  const handleChange = (setter, field) => (value) => {
    setter(value);

    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black animate-gradient" />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

          <div className="flex flex-col items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-blue-900 text-white flex items-center justify-center text-3xl font-bold animate-pulse">
              🏦
            </div>
            <h2 className="mt-3 text-2xl font-bold">Create Account</h2>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">

            <FormInput
              label="Full Name"
              value={fullName}
              onChange={handleChange(setFullName, "fullName")}
              error={errors.fullName}
            />

            <FormInput
              label="Email Address"
              value={email}
              onChange={handleChange(setEmail, "email")}
              error={errors.email}
            />

            <FormInput
              label="Phone Number"
              value={phone}
              onChange={handleChange(setPhone, "phone")}
              error={errors.phone}
            />

            <FormInput
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handleChange(setPassword, "password")}
              error={errors.password}
              showToggle
              toggle={() => setShowPassword(!showPassword)}
            />

            <FormInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={handleChange(setConfirmPassword, "confirmPassword")}
              error={errors.confirmPassword}
            />

            {/* ================= ONLY CHECKBOX SECTION MODIFIED ================= */}

            {errors.agree && (
              <p className="text-red-500 text-sm">{errors.agree}</p>
            )}

            <div className="text-sm">
              <span
                className="text-blue-600 underline cursor-pointer"
                onClick={() => setShowTerms(true)}
              >
                View Terms of Service and Privacy Policy
              </span>
            </div>

            <label className="flex gap-2 text-sm mt-2">
              <input
                type="checkbox"
                checked={agree}
                onChange={() => {
                  const newValue = !agree;
                  setAgree(newValue);

                  if (newValue) {
                    setErrors((prev) => {
                      const updated = { ...prev };
                      delete updated.agree;
                      return updated;
                    });
                  }
                }}
              />
              I agree to the Terms of Service and Privacy Policy
            </label>

            {/* ================================================================ */}

            <button className="bg-green-600 hover:bg-green-700 text-white w-full p-2 rounded">
              Create Account
            </button>

            <p className="text-sm text-center mt-4">
              Already registered?{" "}
              <Link to="/login" className="text-blue-600">
                Login
              </Link>
            </p>

          </form>
        </div>
      </div>
      {/* ================= TERMS MODAL ================= */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[600px] max-h-[80vh] rounded-lg p-6 overflow-hidden relative">
                        {/* ❌ Close Button */}
            <button
              onClick={() => setShowTerms(false)}
              className="absolute top-3 right-4 text-xl font-bold text-gray-600 hover:text-black"
            >
              ✕
            </button>


            <h2 className="text-xl font-bold mb-4">
              Terms & Conditions
            </h2>

            <div className="h-64 overflow-y-auto border p-4 text-sm space-y-3">
              <p>1. You agree to follow all banking security policies.</p>
              <p>2. Your data will be securely encrypted and stored.</p>
              <p>3. You must provide accurate information.</p>
              <p>4. Fraudulent activity is strictly prohibited.</p>
              <p>5. Account misuse may result in suspension.</p>
              <p>6. Password confidentiality is your responsibility.</p>
              <p>7. Transactions may be monitored for security.</p>
              <p>8. Unauthorized access attempts are prohibited.</p>
              <p>9. System maintenance may cause temporary downtime.</p>
              <p>10. Updates to policies may occur periodically.</p>
              <p>11. Continued use implies acceptance of changes.</p>
              <p>12. Legal action may be taken for violations.</p>
              <p>13. Report suspicious activity immediately.</p>
              <p>14. Services are subject to regulatory compliance.</p>
              <p>15. By agreeing, you confirm you have read all terms.</p>
            </div>

            <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => {
                const value = e.target.checked;
                setAgree(value);

                if (value) {
                  setErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.agree;
                    return updated;
                  });
                  setShowTerms(false);
                }
              }}
            />
            <span className="text-sm">
              I have read and agree to the Terms & Conditions
            </span>
          </div>


          </div>
        </div>
      )}
      {/* ================= SUCCESS MODAL ================= */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-2xl shadow-2xl p-8 text-center relative">

            <button
              onClick={() => setShowSuccess(false)}
              className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <div className="text-5xl text-green-600 mb-4">✔</div>

            <h2 className="text-xl font-bold mb-2">
              Account Created Successfully 🎉
            </h2>

            <p className="text-gray-600 text-sm mb-6">
              Please login to continue.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Go to Login
            </button>

          </div>
        </div>
      )}

      {/* ================================================= */}
    </div>
  );
} 

function FormInput({
  label,
  value,
  onChange,
  error,
  type = "text",
  showToggle,
  toggle,
}) {
  const isValid = value && !error;

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-lg px-4 py-2 pr-10
          ${error ? "border-red-500" : ""}
          ${isValid ? "border-green-500" : ""}
        `}
      />

      {isValid && (
        <span className="absolute right-3 top-9 text-green-500">✔</span>
      )}

      {showToggle && (
        <span
          onClick={toggle}
          className="absolute right-3 top-9 cursor-pointer"
        >
          👁️
        </span>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}