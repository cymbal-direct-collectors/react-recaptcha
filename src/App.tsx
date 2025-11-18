import React, { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { Mail, Phone, User, CheckCircle, AlertTriangle, LucideIcon } from 'lucide-react';


/*
Map the grecaptcha object to void values. This will allow the code to compile, but at run time
this will allow the recaptcha/enterprise.js JavaScript to be triggered by the React code.
*/
declare global {
    interface Window {
        grecaptcha: {
          enterprise: {
            ready(cb: () => void): void;
            execute(siteKey: string, opts: { action: string }): Promise<string>;
          };
        };
    }
}

// Email validation regex (basic but effective for common formats)
const EMAIL_REGEX = /\S+@\S+\.\S+/;

// Put your site key here
const RECAPTCHA_SITE_KEY = "YOUR PBC SITE KEY";

// Define the shape of the component's state
interface SubmitStatus {
  type: 'success' | 'error' | null;
  message: string;
}

// Define the shape of the reusable input component's props
interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  icon: LucideIcon;
  placeholder: string;
  isSubmitting: boolean;
}

// Reusable Input Component
const FormInput: React.FC<FormInputProps> = ({ id, label, type = 'text', value, onChange, error, icon: Icon, placeholder, isSubmitting }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative rounded-md shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          block w-full rounded-lg border-gray-300 py-3 pl-10 pr-4 text-gray-900 transition duration-150 ease-in-out
          focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        disabled={isSubmitting}
      />
    </div>
    {error && (
      <p className="text-sm text-red-600" id={`${id}-error`}>
        {error}
      </p>
    )}
  </div>
);

// Main App Component
const App: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ type: null, message: '' });

  /*  
    You can place this JavaScript in index.js (or equivalent), or dynamically insert it on page load
    by uncommenting the code below.  
  */
  /*if (!window.grecaptcha) {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  };*/

  // Function to validate all fields
  const validate = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required.';
    }
    if (!email.trim() || !EMAIL_REGEX.test(email)) {
      newErrors.email = 'A valid email address is required.';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, phone]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ type: null, message: '' });
    
    if (!validate()) {
      return;
    }
    else{
      /*
      Embed the form submission logic inside the reCAPTCHA token generation/execute.
      */
      window.grecaptcha.enterprise.ready(async () => {
        window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, {action: 'LOGIN'}).then(
          function(recaptchaToken){
            const formData = {
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
              token: recaptchaToken.trim(),
            };

            setIsSubmitting(true);
            console.log('--- Submitting Data ---');
            console.log('API Endpoint: https://mysite.com/dataCollection');
            console.log('Payload:', JSON.stringify(formData, null, 2));

            try {
              // Simulate a successful response
              setSubmitStatus({
                type: 'success',
                message: 'Data successfully collected and posted to the API endpoint!',
              });

              // Clear the form after successful submission
              setName('');
              setEmail('');
              setPhone('');

            } catch (error) {
              console.error('Submission Error:', error);
              setSubmitStatus({
                type: 'error',
                message: `Submission failed. Check the console for details.`,
              });
            } finally {
              setIsSubmitting(false);
            }
          }
        );
      });
    }    
  }, [name, email, phone, validate]);

  return (    
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white p-8 md:p-10 rounded-xl shadow-2xl transition duration-500 hover:shadow-3xl">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          User Data Collection
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Please enter your details to proceed. All fields are required.
        </p>

        {/* Submission Status Message */}
        {submitStatus.type && (
          <div
            className={`p-4 mb-6 rounded-lg flex items-center space-x-3 ${
              submitStatus.type === 'success'
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}
            role="alert"
          >
            {submitStatus.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <p className="text-sm font-medium">{submitStatus.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <FormInput
            id="name"
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            icon={User}
            placeholder="Jane Doe"
            isSubmitting={isSubmitting}
          />

          <FormInput
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            icon={Mail}
            placeholder="jane.doe@example.com"
            isSubmitting={isSubmitting}
          />

          <FormInput
            id="phone"
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            icon={Phone}
            placeholder="(555) 555-5555"
            isSubmitting={isSubmitting}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white
              ${isSubmitting
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Submit Information'
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
                Note: The API call to `https://mysite.com/dataCollection` is simulated for demonstration purposes. The payload is logged to the console upon submission.
            </p>
        </div>
      </div>
    </div>
  );
};

export default App;
