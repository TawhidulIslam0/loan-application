# LendSwift Loan Application

**Live Application:** loan-application-beryl.vercel.app

A comprehensive, production-ready multi-step loan application form built with React, designed to support Personal, Home, and Business loan types with advanced form management, validation, and E2E testing.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture & Design Decisions](#architecture--design-decisions)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [Configuration & Schemas](#configuration--schemas)
- [Screenshots](#screenshots)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)

---

## Project Overview

**LendSwift** is an enterprise-grade loan application platform that guides users through an 8-step wizard to apply for different types of loans. The application dynamically adapts its form fields based on loan type, handles complex validation rules, auto-saves progress to encrypted local storage, and provides comprehensive E2E tests.

### Key Capabilities

- **Multi-Loan Support**: Personal, Home, and Business loans with type-specific validations
- **8-Step Guided Wizard**: Loan Details → Personal Info → KYC → Address → Employment → Co-Applicant → Documents → Review & Submit
- **Dynamic Form Rendering**: Step 6 (Co-Applicant) conditionally appears based on loan type and amount
- **Auto-Save with Encryption**: Client-side AES-256-GCM encryption for sensitive data
- **Comprehensive Validation**: Indian-specific formats (PAN, Aadhaar, GST, PIN codes, phone numbers)
- **EMI Calculator**: Real-time interest rate & EMI calculations
- **E-Signature Canvas**: Draw signatures directly in-app
- **File Upload & Compression**: Smart image compression with format validation
- **Accessibility**: WCAG compliance with ARIA labels, keyboard navigation, axe testing
- **Mobile Responsive**: Tailored layouts for tablet (768px) and mobile (414px, 375px)

---

## Architecture & Design Decisions

### 1. Wizard Pattern (Multi-Step Form)

**Why Wizard Over Single-Page Form?**

- **User Experience**: Breaking complex forms into steps reduces cognitive load and improves completion rates
- **Progress Visibility**: Users see progress with the progress bar, encouraging continuation
- **Validation Scoping**: Validate one step at a time, providing focused feedback
- **Mobile Friendly**: Smaller viewport doesn't overwhelm users with all fields at once
- **Draft Management**: Easier to save and resume from specific checkpoints

**Implementation**:
- `Wizard.jsx` orchestrates step navigation and state management
- Each step component is independently testable
- `useAutoSave` hook manages encrypted persistence

---

### 2. React Hook Form (RHF) Over Formik

**Why RHF?**

| Feature | RHF | Formik |
|---------|-----|--------|
| **Bundle Size** | ~8.5kb | ~15kb |
| **Re-renders** | Minimal, field-level | Higher, form-level |
| **API** | Functional composition | OOP wrapper |
| **Validation** | Integrates with Zod/Yup natively | Requires conversion layer |
| **TypeScript** | Excellent support | Good support |
| **Learning Curve** | Moderate | Moderate-steep |

**Why It Matters for This Project**:
- Mobile users benefit from fewer re-renders (reduced CPU/battery drain)
- `useFormContext` enables nested components to access form state without prop drilling
- Built-in resolver pattern (`@hookform/resolvers`) seamlessly integrates Zod
- Form state is isolated per component, reducing test complexity

**Implementation Details**:
```javascript
// Step-specific form using RHF context
export default function Step2PersonalInfo() {
  const { register, watch, formState: { errors } } = useFormContext();
  // No need to pass form methods down through props
}
```

---

### 3. Zod Over Yup

**Why Zod?**

| Aspect | Zod | Yup |
|--------|-----|-----|
| **Syntax** | Fluent, chainable | Fluent, chainable |
| **TypeScript** | Native inference (no extra steps) | Requires manual typing |
| **Bundle Size** | ~12kb | ~15kb |
| **Discriminated Unions** | First-class support | Requires workarounds |
| **Parsing** | Built-in data transformation | Limited |
| **Error Messages** | Highly customizable | Less flexible |
| **Community** | Growing rapidly | Mature, large ecosystem |

**Why It Matters for This Project**:
- **Discriminated Unions**: Employment type has different required fields per employment type (Salaried vs. Self-Employed vs. Business Owner). Zod's `.discriminatedUnion()` handles this elegantly:
  ```javascript
  export const step5Schema = z.discriminatedUnion('employmentType', [
    salariedSchema,
    selfEmployedSchema,
    businessOwnerSchema,
  ]);
  ```
- **Type Safety**: Zod infers TypeScript types automatically, reducing boilerplate
- **Custom Validators**: Easy to add domain-specific validations (PAN format, age calculations, etc.)

---

### 4. Encrypted Client-Side Storage

**Why Client-Side Encryption?**

- **Privacy**: Sensitive data never leaves the user's device unencrypted
- **GDPR Compliance**: User data stored locally under user's control
- **Offline Support**: Draft can be recovered even without network
- **Trust**: Users can verify encryption in browser DevTools

**Implementation**:
- Uses Web Crypto API (`AES-256-GCM`)
- Random IV generated per encryption
- Passphrase-derived key (PBKDF2 with 100k iterations)
- Auto-save every 1 second via `useAutoSave` hook

---

### 5. Dynamic Conditional Rendering

**Step 6 (Co-Applicant) Activation Logic**:
```javascript
export const isStep6Active = (loanType, loanAmount) => {
  const amount = Number(loanAmount) || 0;
  if (type.includes('home')) return true;           // All home loans
  if (type.includes('personal') && amount > 500000) return true;   // Large personal loans
  if (type.includes('business') && amount > 2000000) return true;  // Large business loans
  return false;
};
```

This ensures co-applicant step only appears when required, keeping the form streamlined.

---

## Tech Stack

### Frontend
- **React 19** - UI framework with hooks
- **React Hook Form 7** - Form state management
- **Zod 3** - Schema validation & TypeScript inference
- **Tailwind CSS 4** - Utility-first CSS with Vite integration
- **Vite 8** - Lightning-fast build tool & dev server

### Form Components
- **react-dropzone** - File upload with drag-and-drop
- **react-signature-canvas** - E-signature drawing canvas
- Custom reusable components: `Input`, `Select`, `Checkbox`, `RadioGroup`, `MaskedInput`, `CurrencyInput`

### Testing
- **Cypress 15** - E2E testing with visual regression support
- **Vitest 4** - Unit testing (Jest-compatible)
- **@testing-library/react** - Component testing utilities
- **cypress-axe** - Accessibility testing

### Utilities
- **@hookform/resolvers** - Zod integration with RHF
- **PropTypes** - Runtime type checking (legacy, kept for component documentation)

### Development Tools
- **ESLint 9** - Code quality with airbnb config
- **PostCSS** - CSS transformation
- **Autoprefixer** - Vendor prefix automation

---

## Features

### 1. **Multi-Step Wizard Navigation**
- Visual progress bar showing completion percentage
- Step indicators (Step X of Y)
- Previous/Next/Submit button logic
- Ability to edit specific steps after initial fill

### 2. **Loan Types & Conditional Logic**
| Loan Type | Max Amount | Max Tenure | Co-Applicant? | GST Required? |
|-----------|-----------|-----------|--------------|---------------|
| Personal | ₹10L | 60 months | >₹5L | No |
| Home | ₹1Cr | 360 months | Always | No |
| Business | ₹50L | 120 months | Never | Yes |

### 3. **Advanced Validation**
- **PAN Format**: `^[A-Z]{5}[0-9]{4}[A-Z]$` with check-digit (Verhoeff algorithm)
- **Aadhaar**: 12-digit with Verhoeff validation
- **GST Number**: `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`
- **Mobile**: 10-digit starting with 6-9 (Indian format)
- **Age**: Must be 21-65 years
- **PIN Code Lookup**: Real-time city/state/post-office lookup from JSON database
- **Income Validation**: Co-applicant income must be different from primary income

### 4. **EMI Calculator**
Real-time calculations including:
- Monthly EMI: `P × r × (1+r)^n / ((1+r)^n - 1)`
- Total Interest
- Processing Fee (1-1.5% based on loan type)
- Affordability Check (EMI ≤ 50% of combined income)

Interest rates vary by type:
- Home: 8.5% (base)
- Personal: 11-12.5% (based on amount)
- Business: 14% (base)
- Salaried discount: -0.5%

### 5. **Auto-Save & Resume**
- Automatically encrypts and saves form state every 1 second
- On page reload, checks for draft and resumes from last step
- Manual "Save Draft" button for explicit checkpointing
- Encrypted storage key: `lend_swift_draft`

### 6. **File Upload & Management**
Supported formats: PDF, PNG, JPG, JPEG
- Max size: 5MB
- Auto-compression for images (quality 0.7, down to 0.3 if needed)
- Preview thumbnails
- Remove/re-upload capability
- Document types: PAN, Aadhaar, ITR, Proof of Address, etc.

### 7. **E-Signature Canvas**
- Draw signature directly in browser
- Pointer events for touch support
- Clear and redraw functionality
- Exports as base64 PNG for submission
- Validation error if submitted blank

### 8. **Accessibility (A11y)**
- WCAG 2.1 Level AA compliance target
- ARIA labels and descriptions
- Keyboard navigation support
- `aria-invalid`, `aria-describedby` attributes
- Color contrast verified
- axe accessibility scanning in Cypress tests

### 9. **Mobile Responsiveness**
- Tailored layouts for:
  - **Desktop**: Full multi-column layouts
  - **Tablet** (768px): Adjusted padding, single-column forms
  - **Mobile** (414px, 375px): Optimized font sizes, touch targets
- Cypress screenshot tests for tablet and mobile viewports

### 10. **Application Review & Summary**
Final review displays:
- Summary of all provided information
- Calculated EMI and loan details
- Submission consent checkboxes
- Success confirmation modal with full application details

---

## Project Structure

```
loan-application/
├── src/
│   ├── components/
│   │   ├── common/                    # Reusable form components
│   │   │   ├── Input.jsx              # Text input with validation styling
│   │   │   ├── Select.jsx             # Dropdown select
│   │   │   ├── Checkbox.jsx           # Checkbox with label
│   │   │   ├── RadioGroup.jsx         # Radio button group
│   │   │   ├── MaskedInput.jsx        # Masked input (PAN, Aadhaar)
│   │   │   ├── CurrencyInput.jsx      # Indian currency formatting (₹)
│   │   │   ├── ErrorMessage.jsx       # Accessible error display
│   │   │   ├── FileUpload.jsx         # Dropzone file upload
│   │   │   ├── SignatureCanvas.jsx    # E-signature drawing
│   │   │   └── __tests__/             # Component tests
│   │   ├── ProgressBar.jsx            # Step progress visualization
│   │   ├── StepNavigation.jsx         # Previous/Next/Submit buttons
│   │   └── Wizard.jsx                 # Main orchestrator component
│   ├── steps/                         # Step-specific form components
│   │   ├── Step1LoanType.jsx          # Loan selection & amount
│   │   ├── Step2PersonalInfo.jsx      # Name, DOB, contact details
│   │   ├── Step3KYC.jsx               # PAN, Aadhaar verification
│   │   ├── Step4Address.jsx           # Address & PIN lookup
│   │   ├── Step5Employment.jsx        # Employment & income details
│   │   ├── Step6CoApplicant.jsx       # Co-applicant (conditional)
│   │   ├── Step7Documents.jsx         # File uploads
│   │   └── Step8Review.jsx            # Summary & submission
│   ├── schemas/                       # Zod validation schemas
│   │   ├── schemaFactory.js           # Schema factory for all steps
│   │   ├── step1Schema.js             # Loan type validation
│   │   ├── step2Schema.js             # Personal info validation
│   │   ├── step5Schema.js             # Employment validation (discriminated union)
│   │   └── step6Schema.js             # Co-applicant validation
│   ├── hooks/                         # Custom React hooks
│   │   ├── useAutoSave.js             # Auto-save with encryption
│   │   ├── usePinCodeLookup.js        # PIN code to city lookup
│   │   ├── useVerification.js         # PAN/Aadhaar verification
│   ├── utils/                         # Utility functions
│   │   ├── encryption.js              # AES-256-GCM encrypt/decrypt
│   │   ├── emiCalculator.js           # EMI calculations
│   │   ├── imageCompression.js        # Image compression for uploads
│   │   ├── validators.js              # PAN, Aadhaar, GST validators
│   │   ├── pinCodeData.json           # PIN code database
│   ├── App.jsx                        # Root component
│   ├── App.css                        # Global styles
│   ├── index.css                      # Tailwind imports
│   └── main.jsx                       # React DOM render
├── cypress/
│   ├── e2e/                           # E2E test scenarios
│   │   ├── personal-loan-happy-path.cy.js
│   │   ├── home-loan-happy-path.cy.js
│   │   ├── business-loan-happy-path.cy.js
│   │   ├── auto-save-resume.cy.js
│   │   ├── file-upload.cy.js
│   │   ├── e-signature.cy.js
│   │   └── keyboard-navigation.cy.js
│   ├── fixtures/                      # Test data
│   │   ├── valid-personal-loan.json
│   │   ├── valid-home-loan.json
│   │   ├── valid-business-loan.json
│   │   └── images/
│   ├── support/
│   │   ├── commands.js                # Custom Cypress commands
│   │   └── e2e.js                     # Setup file
│   └── screenshots/                   # Visual regression captures
├── public/
├── vite.config.js                     # Vite configuration
├── cypress.config.js                  # Cypress configuration
├── package.json
├── tailwind.config.js                 # Tailwind CSS config (if exists)
└── README.md                          # This file
```

---

## Setup Instructions

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ or **yarn** 1.22+
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TawhidulIslam0/loan-application.git
   cd loan-application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   npm run lint
   ```

### Environment Setup

No environment variables are required. The application uses:
- Encrypted localStorage for draft storage
- Static PIN code database (`src/utils/pinCodeData.json`)
- Client-side form validation

---

## Running the Application

### Development Server

Start the Vite dev server on `http://localhost:5173`:

```bash
npm run dev
```

The application will:
- Hot-reload on file changes
- Display HMR status in browser
- Show any ESLint warnings

### Production Build

Build optimized bundle for deployment:

```bash
npm run build
```

Output: `dist/` directory with:
- Minified JS
- Optimized CSS
- Gzipped assets (~180kb gzipped)

### Preview Production Build

Test the production build locally:

```bash
npm run preview
```

Then visit `http://localhost:4173`

---

## Running Tests

### Unit & Component Tests (Vitest)

Run all unit tests:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test -- --watch
```

Run tests with coverage:

```bash
npm run test -- --coverage
```

**Test Files**:
- `src/components/common/__tests__/afternoon-components.test.jsx` - Tests for CurrencyInput, MaskedInput, ErrorMessage

### E2E Tests (Cypress)

**Prerequisites**: Dev server must be running (`npm run dev` in another terminal)

Open Cypress Test Runner (interactive mode):

```bash
npx cypress open
```

Then select **E2E Testing** and choose a browser.

Run all E2E tests headless:

```bash
npx cypress run
```

Run specific test file:

```bash
npx cypress run --spec "cypress/e2e/personal-loan-happy-path.cy.js"
```

Generate HTML report:

```bash
npx cypress run --reporter html
# Report: cypress/reports/html/index.html
```

**Test Coverage**:

| Test File | Scenario | Loan Type |
|-----------|----------|-----------|
| `personal-loan-happy-path.cy.js` | Complete application flow | Personal |
| `home-loan-happy-path.cy.js` | With co-applicant step | Home |
| `business-loan-happy-path.cy.js` | With GST number | Business |
| `auto-save-resume.cy.js` | Draft recovery | Personal |
| `file-upload.cy.js` | Upload/remove/compress | All |
| `e-signature.cy.js` | Canvas drawing/clearing | All |
| `keyboard-navigation.cy.js` | A11y keyboard support | All |

### Code Quality

Lint all files:

```bash
npm run lint
```

Fix linting issues automatically:

```bash
npm run lint -- --fix
```

---

## Configuration & Schemas

### Validation Schemas (Zod)

Located in `src/schemas/`:

**step1Schema.js** - Loan Details
```javascript
z.object({
  loanType: z.enum(['Personal', 'Home', 'Business']),
  loanAmount: z.number().min(50000),
  tenureMonths: z.number().min(12),
  purpose: z.string(),
})
```

**step2Schema.js** - Personal Information
```javascript
z.object({
  fullName: z.string().regex(/^[A-Za-z\s.]+$/),
  dob: z.string().refine(calculateAge >= 21 && calculateAge <= 65),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/),
  // ... more fields
})
```

**step5Schema.js** - Employment (Discriminated Union)
```javascript
z.discriminatedUnion('employmentType', [
  salariedSchema,      // Has: companyName, designation, monthlyNetSalary
  selfEmployedSchema,  // Has: businessName, annualTurnover, officeAddress
  businessOwnerSchema, // Has: gstNumber, annualTurnover, officeAddress
])
```

### Interest Rates & EMI

In `src/utils/emiCalculator.js`:

```javascript
const getIndicativeInterestRate = (loanType, loanAmount, employmentType) => {
  let rate = 10.5;
  if (type === 'Home') rate = 8.5;
  if (type === 'Business') rate = 14.0;
  if (type === 'Personal' && amount > 1000000) rate = 11.0;
  if (employment === 'Salaried') rate -= 0.5;
  return rate;
};
```

### Loan Amount & Tenure Limits

| Type | Min | Max | Tenure |
|------|-----|-----|--------|
| Personal | ₹50K | ₹10L | 12-60 months |
| Home | ₹50K | ₹1Cr | 12-360 months |
| Business | ₹50K | ₹50L | 12-120 months |

---

## Screenshots

### Step 1: Loan Type Selection
Loan type buttons with amount and tenure input fields.

### Step 2: Personal Information
Personal details form with date of birth and mobile validation.

### Step 3: KYC (PAN & Aadhaar)
Identity verification with masked input for sensitive numbers.

### Step 4: Address & PIN Code
Automatic city/state lookup on valid 6-digit PIN code entry.

### Step 5: Employment
Employment details form (Salaried, Self-Employed, or Business Owner options).

### Step 6: Co-Applicant (Conditional)
Appears only for home loans or large personal loans (>₹5L).

### Step 7: Document Upload
Drag-and-drop zone for PAN, Aadhaar, ITR, proof of address documents.

### Step 7 E-Signature Canvas
Draw signature with mouse or touch, clear and redraw as needed.

### Step 8: Review & Submit
Summary of all entered information with EMI calculation and consent checkboxes.

**Success Modal**: Application submitted confirmation with complete application details.

---

## Known Limitations

1. **Form Validation Only**
   - PAN/Aadhaar validations use format checks and check-digit algorithms only
   - No real-time verification against government databases
   - Suitable for demo/testing purposes

2. **PIN Code Database**
   - Static JSON file included in repository
   - Contains 12,000+ PIN codes but may not cover all locations
   - Updates require manual database refresh

3. **Local Storage Only**
   - Drafts persist only in the user's browser
   - No cross-device sync
   - Draft is lost if browser data is cleared
   - Each browser/device has separate draft

4. **Single Language**
   - English only
   - Indian-specific formatting (addresses, phone numbers, currency)

5. **Limited Document Preview**
   - Uploaded files can be removed but not re-downloaded
   - File preview is limited to filename display

6. **EMI Calculation**
   - Interest rates are fixed approximations
   - Does not account for actual CIBIL scores or customer-specific eligibility
   - Processing fees are fixed percentages per loan type

---

## Contributing

### Code Style

This project follows the **Airbnb ESLint config**. Before committing:

```bash
npm run lint -- --fix
```

### Adding New Steps

1. Create step component in `src/steps/Step{N}{Name}.jsx`
2. Add validation schema in `src/schemas/step{N}Schema.js`
3. Export from `src/schemas/schemaFactory.js`
4. Add step definition to `STEPS` array in `src/components/Wizard.jsx`
5. Add E2E test in `cypress/e2e/`

### Testing New Features

Write tests for:
- Unit tests: Component behavior in isolation
- E2E tests: User flow through wizard
- Accessibility tests: Keyboard navigation, screen reader compat

Example:
```javascript
describe('New Feature', () => {
  it('does what it should', () => {
    cy.visit('/');
    // ... test steps
  });
});
```

---

## Browser Support

- **Chrome/Edge**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Mobile**: iOS 13+, Android 9+

**Note**: Internet Explorer 11 is not supported.

---

## License

This project is proprietary to LendSwift. All rights reserved.

---

## Support

For issues or feature requests, please open an issue in the repository.

---

**Last Updated**: August 2026  
**Version**: 1.0.0
