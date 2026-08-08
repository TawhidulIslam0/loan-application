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

const nameRegex = /^[A-Za-z\s.]+$/;

export const step2Schema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be under 100 characters')
    .regex(nameRegex, 'Only letters, spaces, and periods are allowed'),
  dob: z.string().refine((val) => {
    if (!val) return false;
    const age = calculateAge(val);
    return age >= 21 && age <= 65;
  }, {
    message: 'You must be between 21 and 65 years old',
  }),
  gender: z.enum(['Male', 'Female', 'Other'], {
    required_error: 'Please select a gender',
  }),
  maritalStatus: z.string().min(1, 'Please select marital status').refine(
    (val) => ['Single', 'Married', 'Divorced', 'Widowed'].includes(val),
    { message: 'Please select a valid marital status' }
  ),
  fatherName: z.string()
    .min(2, "Father's name must be at least 2 characters")
    .regex(nameRegex, 'Only letters, spaces, and periods are allowed'),
  motherName: z.string()
    .min(2, "Mother's name must be at least 2 characters")
    .regex(nameRegex, 'Only letters, spaces, and periods are allowed'),
  email: z.string().email('Invalid email address format'),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Mobile number must be 10 digits starting with 6, 7, 8, or 9'),
  alternateMobile: z.string().optional(),
}).refine((data) => {
  if (data.alternateMobile && data.alternateMobile.trim() !== '') {
    return data.alternateMobile !== data.mobileNumber;
  }
  return true;
}, {
  message: 'Alternate mobile number must be different from primary mobile number',
  path: ['alternateMobile'],
});