import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', inquiryType: '', message: '', general: '' });
  const [isLoading, setIsLoading] = useState(false);

  const inquiryTypes = [
    { value: '', label: 'Select inquiry type' },
    { value: 'support', label: 'Support' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'bug-report', label: 'Bug Report' },
    { value: 'feature-request', label: 'Feature Request' },
    { value: 'pricing', label: 'Pricing Inquiry' },
    { value: 'demo', label: 'Request Demo' },
    { value: 'other', label: 'Other' }
  ];

  const validateEmail = (email: string): boolean => {
    // More comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

  const validate = () => {
    let valid = true;
    let newErrors = { name: '', email: '', inquiryType: '', message: '', general: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
      valid = false;
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name must not contain numbers or special characters.';
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
      valid = false;
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
      valid = false;
    }

    if (!formData.inquiryType) {
      newErrors.inquiryType = 'Please select an inquiry type.';
      valid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ name: '', email: '', inquiryType: '', message: '', general: '' });
    if (!validate()) return;
    setIsLoading(true);

    try {
      // Create the payload with subject derived from inquiry type
      const payload = {
        name: formData.name,
        email: formData.email,
        subject: inquiryTypes.find(type => type.value === formData.inquiryType)?.label || 'General Inquiry',
        message: formData.message
      };

      const response = await apiService.submitContactForm(payload);

      if (!response.success) {
        setErrors(prev => ({ ...prev, general: response.message || 'Failed to send message.' }));
        setIsLoading(false);
        return;
      }

      // Extract reference number from response
      const refNumber = response.referenceNumber || response.data?.referenceNumber || `REF-${Date.now()}`;
      setReferenceNumber(refNumber);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setReferenceNumber('');
      }, 8000); // Extended time to show reference number
      setFormData({ name: '', email: '', inquiryType: '', message: '' });
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'Failed to send message. Please try again later.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get In
            <span className="bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent"> Touch</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about ExamWizards? We'd love to hear from you.
            Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <p className="text-gray-600 mb-8">
                Ready to revolutionize your examination process? Our team is here to help you get started.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Email</h4>
                  <p className="text-gray-600">support@examwizards.com</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Phone</h4>
                  <p className="text-gray-600">+91-12345-67890</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Address</h4>
                  <p className="text-gray-600">Pune, Maharashtra, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-3xl p-8 shadow-2xl border border-purple-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h3>

            {isSubmitted && (
              <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-green-800 font-bold text-lg mb-2">Message sent successfully!</h4>
                    <p className="text-green-700 text-sm mb-3">
                      Thank you for contacting us. We'll get back to you as soon as possible.
                    </p>
                    {referenceNumber && (
                      <div className="bg-white border border-green-300 rounded-lg p-3">
                        <p className="text-green-800 font-semibold text-sm mb-1">Your Reference Number:</p>
                        <p className="text-green-900 font-mono text-lg font-bold tracking-wider">
                          {referenceNumber}
                        </p>
                        <p className="text-green-600 text-xs mt-1">
                          Please save this reference number for future correspondence.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Your Name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                  Inquiry Type
                </label>
                <select
                  id="inquiryType"
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors bg-white"
                >
                  {inquiryTypes.map((type) => (
                    <option key={type.value} value={type.value} disabled={type.value === ''}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.inquiryType && <p className="text-red-500 text-xs mt-1">{errors.inquiryType}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Tell us more about your needs..."
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>

              {errors.general && <div className="mb-2 text-red-500 text-center">{errors.general}</div>}
              <button
                type="submit"
                className={`w-full bg-gradient-to-r from-purple-600 to-teal-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;