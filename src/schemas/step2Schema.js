import { z } from 'zod';

// Helper to calculate age from DOB string/Date
export const calculateAge = (dobString) => {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export const step2Schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  dob: z.string().refine((val) => {
    if (!val) return false;
    const age = calculateAge(val);
    return age >= 18 && age <= 65;
  }, {
    message: 'You must be between 18 and 65 years old',
  }),
  gender: z.enum(['Male', 'Female', 'Other'], {
    required_error: 'Please select a gender',
  }),
  maritalStatus: z.string().min(1, 'Please select marital status').refine(
    (val) => ['Single', 'Married', 'Divorced', 'Widowed'].includes(val),
    { message: 'Please select a valid marital status' }
  ),
  email: z.string().email('Invalid email address format'),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Mobile number must be 10 digits starting with 6, 7, 8, or 9'),
  alternateMobile: z.string().optional(),
}).refine((data) => {
  if (data.alternateMobile && data.alternateMobile.trim() !== '') {
    // Check if alternate mobile matches primary mobile
    return data.alternateMobile !== data.mobileNumber;
  }
  return true;
}, {
  message: 'Alternate mobile number must be different from primary mobile number',
  path: ['alternateMobile'],
});
