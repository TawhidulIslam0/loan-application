# LendSwift Architecture Documentation

Comprehensive guide to the internal architecture, design patterns, validation, persistence, state management, and extension points of the LendSwift loan application.

## Table of Contents

* [Overview](#overview)
* [Wizard Pattern](#wizard-pattern)
* [Schema Factory & Validation](#schema-factory--validation)
* [Auto-Save & Data Persistence](#auto-save--data-persistence)
* [Cross-Step Dependency Management](#cross-step-dependency-management)
* [Component Hierarchy](#component-hierarchy)
* [State Management Flow](#state-management-flow)
* [Key Design Patterns](#key-design-patterns)
* [Extension Guide](#extension-guide)
* [Summary](#summary)

---

## Overview

LendSwift uses a **Wizard Pattern** for multi-step loan application management, combined with **React Hook Form** for centralized form state and **Zod** for schema-driven validation.

The architecture prioritizes:

* **Progressive Disclosure:** Each step reveals only relevant fields.
* **Data Persistence:** Form progress is automatically saved with encryption.
* **Cross-Step Dependencies:** Fields, validation, calculations, and steps can depend on previous selections.
* **Modularity:** Each step is independently testable and reusable.
* **Type Safety:** Zod schemas provide validation and TypeScript type inference.
* **Maintainability:** Business rules are separated from presentation components.

The application consists of eight primary steps:

1. Loan Details
2. Personal Information
3. KYC
4. Address
5. Employment
6. Co-Applicant
7. Documents
8. Review & Consent

---

## Wizard Pattern

### Core Concept

The Wizard pattern divides the loan application into sequential steps. Users complete one logical group of fields at a time and must pass validation before progressing.

Instead of displaying 50+ fields simultaneously, the application guides users through:

**Loan Details → Personal Info → KYC → Address → Employment → Co-Applicant → Documents → Review**

### Implementation Architecture

The central `Wizard.jsx` component orchestrates the application flow.

```text
Wizard.jsx
    ↓
FormProvider (React Hook Form context)
    ↓
StepRenderer
    ↓
Step Component
    ↓
useFormContext()
    ↓
User fills form
    ↓
Auto-save
    ↓
Validate
    ↓
Navigate
```

The Wizard is responsible for:

1. Managing the current step.
2. Determining which steps are visible.
3. Handling Previous/Next navigation.
4. Triggering step-specific validation.
5. Loading saved drafts.
6. Coordinating auto-save.
7. Providing React Hook Form context to all steps.
8. Handling final submission.

### Step Definition

Each step is represented by an object in a centralized `STEPS` array.

```javascript
const STEPS = [
  {
    id: 1,
    name: 'Loan Details',
    component: Step1LoanType,
    schema: step1Schema,
  },
  {
    id: 2,
    name: 'Personal Info',
    component: Step2PersonalInfo,
    schema: step2Schema,
  },
  // ...
  {
    id: 6,
    name: 'Co-Applicant',
    component: Step6CoApplicant,
    schema: step6Schema,
    conditional: isStep6Active,
  },
];
```

A step definition can contain:

* `id` — Unique numeric identifier.
* `name` — User-facing step name.
* `component` — React component rendered for the step.
* `schema` — Zod validation schema.
* `conditional` — Optional function determining whether the step is active.

### Step Component Pattern

Every step follows the same general pattern:

* Use `useFormContext()` to access form state.
* Register fields using `register()`.
* Read validation errors from `formState.errors`.
* Use `watch()` when a field depends on another field.
* Keep presentation and step-specific UI logic inside the step component.
* Keep reusable business validation inside schemas and utilities.

This makes each step independently testable and reusable.

### Conditional Step Rendering

Step 6, the Co-Applicant step, is conditionally displayed.

The documented business rules are:

* **Home:** Always show the Co-Applicant step.
* **Personal:** Show when the loan amount is greater than ₹5L.
* **Business:** Do not show the Co-Applicant step.

The conditional logic should remain centralized in `isStep6Active()` rather than being duplicated throughout the UI.

---

## Schema Factory & Validation

### Why a Schema Factory?

Validation is centralized through Zod schemas and a Schema Factory rather than being hardcoded into individual components.

This provides:

* **Single Source of Truth:** Rules are defined centrally.
* **Type Safety:** Zod can infer TypeScript types.
* **Consistency:** The same rules can be reused by UI and APIs.
* **Flexibility:** Context-dependent rules can be generated dynamically.
* **Maintainability:** Business rules can change without rewriting components.

### Schema Organization

Schemas are organized by step:

```text
src/schemas/
├── step1Schema.js
├── step2Schema.js
├── step5Schema.js
├── step6Schema.js
└── schemaFactory.js
```

### Step 1: Loan Type Schema

Step 1 validates:

* Loan type: `Personal`, `Home`, or `Business`
* Loan amount: Minimum ₹50K
* Tenure: Minimum 12 months
* Purpose: Must be valid for the selected loan type

Type-specific limits:

| Loan Type | Maximum Amount | Maximum Tenure |
| --------- | -------------: | -------------: |
| Personal  |           ₹10L |      60 months |
| Home      |           ₹1Cr |     360 months |
| Business  |           ₹50L |     120 months |

Cross-field validation ensures that amount and tenure limits are consistent with the selected loan type.

### Purpose Rules

Purpose options depend on the loan type.

```text
Home
├── Purchase
├── Construction
└── Renovation

Personal
├── Medical
├── Travel
├── Debt Consolidation
└── Wedding

Business
├── Working Capital
├── Equipment
└── Expansion
```

If the user changes the loan type, an existing purpose should be reset when it is no longer valid.

### Step 5: Employment Schema

Employment validation uses a Zod discriminated union.

Three employment types are supported:

#### Salaried

Requires:

* Company name
* Designation
* Monthly salary

#### Self-Employed

Requires:

* Business name
* Annual turnover
* Office address

#### Business Owner

Requires:

* Business name
* GST number
* Relevant self-employed fields

Conceptually:

```javascript
const step5Schema = z.discriminatedUnion('employmentType', [
  salariedSchema,
  selfEmployedSchema,
  businessOwnerSchema,
]);
```

The selected `employmentType` determines which fields are required and validated.

This avoids large conditional `if/else` validation blocks and allows TypeScript to understand the valid fields for each employment type.

### Validator Utilities

Custom validation utilities handle Indian-specific formats and business rules.

Supported validators include:

* **PAN:** `^[A-Z]{5}[0-9]{4}[A-Z]$` plus Verhoeff check-digit validation.
* **Aadhaar:** 12-digit number plus Verhoeff check-digit validation.
* **GST:** GST-specific format validation.
* **Mobile:** 10 digits beginning with 6–9.
* **Age:** 21–65 years.
* **PIN Code:** Six-digit Indian postal code with city/state/post-office lookup.

---

## Auto-Save & Data Persistence

### Why Auto-Save?

Long forms can be abandoned because of:

* Accidental browser closure.
* Browser crashes.
* Network interruptions.
* Navigation away from the application.
* Users needing to complete the application later.

Auto-save provides:

* **User Confidence:** Progress is continuously preserved.
* **Persistence:** Drafts survive application reloads.
* **Offline Resilience:** Locally stored drafts can be recovered after connectivity issues.
* **Encryption:** Stored draft data is encrypted before being written to local storage.

### Auto-Save Flow

The `useAutoSave` hook encapsulates draft persistence.

```text
Monitor Form Changes
        ↓
Serialize Form Data
        ↓
Encrypt Data
        ↓
Store Encrypted Blob
        ↓
Repeat Every 1 Second
```

The interval should be configurable rather than hardcoded.

### Draft Loading

When the application starts:

```text
User opens app
    ↓
Check localStorage for lend_swift_draft
    ↓
Draft found?
    ├── Yes → Decrypt
    │          ↓
    │       Restore form data
    │          ↓
    │       Restore current step
    │          ↓
    │       Resume application
    │
    └── No → Start at Step 1
```

### Encryption Details

The intended browser-side encryption design uses the Web Crypto API:

| Property          | Configuration        |
| ----------------- | -------------------- |
| Encryption        | AES-256-GCM          |
| Key Derivation    | PBKDF2               |
| PBKDF2 Iterations | 100,000              |
| IV                | Random 12-byte value |
| Storage Encoding  | Base64               |
| Storage           | `localStorage`       |

AES-GCM provides authenticated encryption, while the random IV prevents identical plaintexts from producing predictable ciphertext patterns.

### Important Security Consideration

Client-side encryption protects stored drafts from casual inspection and reduces exposure of plaintext in local storage. It **does not** make sensitive data secure against an attacker who has full access to the running application or JavaScript environment.

In particular, a passphrase or encryption key embedded directly in client-side code should not be treated as a secret. Production implementations should use an appropriate key-management strategy and carefully evaluate whether highly sensitive information should be stored in browser storage at all.

### Manual Save vs Auto-Save

**Auto-Save**

* Runs silently in the background.
* Saves approximately every second.
* Requires no user interaction.

**Manual Save**

* Triggered through a "Save Draft" button.
* Provides an explicit checkpoint.
* Can show confirmation to the user.

Both mechanisms can coexist.

---

## Cross-Step Dependency Management

The centralized React Hook Form state allows later steps to depend on information collected earlier.

### Dependency Types

#### 1. Display Dependencies

Determine whether a field or option should be shown.

Example:

```text
Loan Type → Available Purpose Options
```

#### 2. Validation Dependencies

Change validation rules based on other data.

Example:

```text
Primary Income + Co-Applicant Income → Affordability Validation
```

#### 3. Calculation Dependencies

Combine data from multiple steps.

Example:

```text
Loan Amount
+ Tenure
+ Income
+ Co-Applicant Income
        ↓
EMI Calculation
```

#### 4. Conditional Step Dependencies

Determine whether an entire step should exist in the current application.

Example:

```text
Loan Type + Loan Amount
        ↓
Step 6 Visibility
```

### Real-World Example: Purpose Field

The purpose field depends on `loanType`.

```text
Home
    → Purchase
    → Construction
    → Renovation

Personal
    → Medical
    → Travel
    → Debt Consolidation
    → Wedding

Business
    → Working Capital
    → Equipment
    → Expansion
```

When `loanType` changes, the current purpose must be checked. If the selected purpose is no longer valid, it should be cleared.

A step can observe the value using:

```javascript
const { watch, setValue } = useFormContext();

const loanType = watch('loanType');
```

### Real-World Example: EMI Calculation

The review step combines information from multiple steps.

#### Step 1

* Loan amount
* Tenure
* Loan type

#### Step 5

* Employment type
* Monthly income

#### Step 6

* Co-applicant income

The `calculateLoanDetails()` function can calculate:

* Interest rate.
* Monthly EMI.
* Total interest.
* Affordability ratio.
* Combined income.
* Whether EMI is within the configured affordability threshold.

Affordability can be represented as:

```text
Affordability Ratio = EMI / Combined Monthly Income
```

The documented business rule is that the EMI should not exceed 50% of applicable income.

### Real-World Example: Co-Applicant Visibility

```javascript
isStep6Active(loanType, loanAmount)
```

Business rules:

```text
Home
    → Always show

Personal + amount > ₹5L
    → Show

Business
    → Never show
```

Keeping this logic in one function prevents inconsistent visibility behavior.

### Dependency Map

```text
Step 1: Loan Details
├── loanType
│   └── Purpose options
├── loanAmount
│   └── Step 6 visibility
└── loanAmount + tenureMonths + loanType
    └── EMI calculation

Step 2: Personal Info
└── dob
    └── Age validation

Step 3: KYC
├── panNumber
│   └── Format + check-digit validation
└── aadhaarNumber
    └── Format + check-digit validation

Step 4: Address
└── pinCode
    └── City/state/post-office lookup

Step 5: Employment
├── employmentType
│   └── Required employment fields
└── monthlyIncome
    └── EMI calculation

Step 6: Co-Applicant
├── hasCoApplicant
│   └── Co-applicant field visibility
└── coApplicantIncome
    └── EMI + affordability calculation

Step 8: Review
└── All previous steps
    └── Final calculations + application summary
```

---

## Component Hierarchy

### Component Tree

```text
App
└── Wizard
    ├── ProgressBar
    ├── FormProvider
    │   └── StepRenderer
    │       ├── Step1LoanType
    │       ├── Step2PersonalInfo
    │       ├── Step3KYC
    │       ├── Step4Address
    │       ├── Step5Employment
    │       ├── Step6CoApplicant (conditional)
    │       ├── Step7Documents
    │       └── Step8Review
    │
    └── StepNavigation
        ├── Previous
        ├── Next
        └── Submit
```

### Reusable Components

The `common/` component library contains reusable UI elements:

```text
common/
├── Input
├── Select
├── Checkbox
├── RadioGroup
├── MaskedInput
├── CurrencyInput
├── FileUpload
└── SignatureCanvas
```

Specialized components include:

* `MaskedInput` — PAN/Aadhaar and other masked values.
* `CurrencyInput` — Currency-formatted loan amounts.
* `FileUpload` — Document uploads and dropzone interactions.
* `SignatureCanvas` — Electronic signature capture.

### Component Communication

All steps communicate through React Hook Form's `FormProvider`.

```text
Step A sets loanType
       ↓
FormProvider stores loanType
       ↓
Step B calls watch("loanType")
       ↓
Step B reacts to loanType
       ↓
Step C schema can validate based on loanType
```

This eliminates unnecessary prop drilling and keeps steps loosely coupled.

---

## State Management Flow

### Form State Lifecycle

```text
1. App loads
       ↓
2. Wizard mounts
       ↓
3. useAutoSave initializes
       ↓
4. Check localStorage
       ↓
   ├── Draft found
   │      ↓
   │   Decrypt
   │      ↓
   │   Restore form data + step
   │
   └── No draft
          ↓
       Start fresh
       ↓
5. FormProvider wraps application
       ↓
6. User fills fields
       ↓
7. Auto-save runs
       ↓
8. User clicks Next
       ↓
9. Current step is validated
       ↓
   ├── Valid → Navigate
   └── Invalid → Display errors
       ↓
10. Repeat for remaining steps
       ↓
11. User reaches Review
       ↓
12. User submits application
       ↓
13. Success state is displayed
       ↓
14. User can start a new application
```

### Form Data Structure

The application maintains a single centralized form state object.

```javascript
{
  // Step 1
  loanType: 'Personal',
  loanAmount: 500000,
  tenureMonths: 24,
  purpose: 'Debt Consolidation',

  // Step 2
  fullName: 'Rahul Sharma',
  dob: '1995-06-15',
  gender: 'Male',
  email: 'rahul@example.com',
  mobileNumber: '9876543210',

  // Step 3
  panNumber: 'PPPPH1234P',
  aadhaarNumber: '100000000004',

  // Step 4
  // ... address fields

  // Step 5
  employmentType: 'Salaried',
  monthlyNetSalary: 75000,

  // Step 6
  hasCoApplicant: false,

  // Step 7
  documents: {
    panCard: File
  },

  // Step 8
  signature: 'data:image/png;base64,...',
  consents: {
    termsAndConditions: true
  }
}
```

This state is used for:

* Rendering fields.
* Validation.
* Conditional logic.
* Calculations.
* Draft persistence.
* Final review.

---

## Key Design Patterns

### 1. Compound Components / Context Pattern

Instead of passing form methods through multiple component levels:

```javascript
// Avoid prop drilling
<Wizard formMethods={methods}>
  <Step1
    formMethods={methods}
    errors={errors}
    register={register}
  />
</Wizard>
```

Use `FormProvider`:

```javascript
<FormProvider {...methods}>
  <Step1 />
</FormProvider>
```

The step can then access the form directly:

```javascript
const {
  register,
  watch,
  formState: { errors },
} = useFormContext();
```

Benefits:

* Eliminates prop drilling.
* Reduces component coupling.
* Simplifies refactoring.
* Makes individual steps easier to test.

### 2. Schema-Driven Validation

Zod schemas provide a centralized definition of validation rules.

```javascript
// Type inference
type Step1Data = z.infer<typeof step1Schema>;

// React Hook Form
useForm({
  resolver: zodResolver(step1Schema),
});

// API validation
const result = step1Schema.safeParse(apiResponse);
```

This keeps validation behavior consistent across consumers.

### 3. Custom Hooks Pattern

Complex functionality is encapsulated in focused hooks.

Examples:

```text
useAutoSave()
    → Encryption + localStorage persistence

usePinCodeLookup()
    → PIN → city/state/post-office lookup

useVerification()
    → PAN/Aadhaar verification simulation
```

Each hook should have a focused responsibility and be independently testable.

### 4. Conditional Rendering Pattern

Entire steps can be conditionally filtered:

```javascript
const visibleSteps = STEPS.filter((step) => {
  if (step.conditional) {
    return step.conditional(loanType, loanAmount);
  }

  return true;
});
```

Individual fields can also be conditional:

```javascript
{selectedLoanType === 'Business' && (
  <Input
    label="GST Number"
    {...register('gstNumber')}
  />
)}
```

### 5. Discriminated Union Pattern

Employment validation uses the selected `employmentType` to determine the applicable schema.

```javascript
const step5Schema = z.discriminatedUnion('employmentType', [
  salariedSchema,
  selfEmployedSchema,
  businessOwnerSchema,
]);
```

This provides:

* Clear validation rules.
* Stronger type inference.
* Less conditional validation code.
* Automatic switching of validation requirements when employment type changes.

---

## Extension Guide

### Adding a New Step

For example, adding Step 9 for bank details:

#### 1. Create the Component

Create:

```text
src/steps/Step9BankDetails.jsx
```

The component should:

* Use `useFormContext()`.
* Register its fields.
* Display validation errors.
* Avoid duplicating business validation.

#### 2. Create the Schema

Create:

```text
src/schemas/step9Schema.js
```

Define the Zod object containing the bank-detail validation rules.

#### 3. Update the Schema Factory

Update:

```text
src/schemas/schemaFactory.js
```

Map the new step ID to its schema.

#### 4. Update the Wizard

Add the step to the `STEPS` array in:

```text
src/components/Wizard.jsx
```

Example:

```javascript
{
  id: 9,
  name: 'Bank Details',
  component: Step9BankDetails,
  schema: step9Schema,
}
```

#### 5. Add E2E Tests

Create:

```text
cypress/e2e/bank-details.cy.js
```

Test:

* Rendering.
* Required fields.
* Invalid values.
* Valid values.
* Navigation.
* Draft persistence.
* Interaction with dependent steps, where applicable.

### Adding a Cross-Step Dependency

For a dependency such as an employment field depending on loan type:

#### 1. Identify the Source

Determine which field controls the dependency.

```text
Step 1 → loanType
```

#### 2. Watch the Source Field

```javascript
const { watch } = useFormContext();

const loanType = watch('loanType');
```

#### 3. React to Changes

Use an effect when state must be reset or synchronized:

```javascript
useEffect(() => {
  // Update dependent state or fields.
}, [loanType]);
```

#### 4. Update Validation

If the dependency changes validation rules, update the relevant schema or Schema Factory rather than putting validation logic directly into the component.

#### 5. Add E2E Coverage

Test both directions of the dependency:

```text
Initial selection
    ↓
Dependent field appears / validates
    ↓
Source field changes
    ↓
Dependent field updates / resets
    ↓
Validation remains correct
```

---

## Best Practices for Extensions

### Keep Steps Independent

Each step should contain only the UI and behavior necessary for that step.

### Use `useFormContext()`

Avoid passing form methods through multiple component layers.

### Centralize Validation

Define business validation in Zod schemas and validator utilities rather than directly in components.

### Test Dependencies

Cross-step behavior should have E2E coverage because dependency bugs can be difficult to identify through isolated component tests.

### Document Conditional Logic

Whenever a field or step is conditionally displayed, document the business reason.

### Keep Business Rules Centralized

Rules such as:

* Loan limits.
* Tenure limits.
* Purpose mappings.
* Co-applicant eligibility.
* Affordability thresholds.

should live in centralized functions/configuration where practical.

### Preserve Form State Consistency

When a controlling field changes, dependent fields should be:

1. Re-evaluated.
2. Reset if invalid.
3. Revalidated.
4. Reflected in calculations.

### Treat Persisted Data as Untrusted

Draft data loaded from local storage should be parsed and validated before being restored into the form.

---

## Summary

LendSwift's architecture is built around five primary principles:

1. **Modularity** — Each step is independent, reusable, and testable.
2. **Type Safety** — Zod schemas provide validation and TypeScript inference.
3. **Progressive Disclosure** — Users see only the fields and steps relevant to their application.
4. **Data Persistence** — Auto-save protects user progress through encrypted draft storage.
5. **Cross-Step Integration** — Centralized form state enables dynamic validation, calculations, and conditional behavior.

The resulting architecture is:

* **Maintainable:** Clear separation between UI, state, validation, and business rules.
* **Scalable:** New steps, dependencies, and validations can be added systematically.
* **Testable:** Components, schemas, hooks, and cross-step workflows can be tested independently.
* **User-Friendly:** Progressive disclosure and immediate validation reduce form complexity.
* **Resilient:** Auto-save allows users to recover unfinished applications.
* **Consistent:** Centralized schemas and dependency logic reduce duplicated business rules.

### Architecture at a Glance

```text
                         ┌─────────────────────┐
                         │         App         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       Wizard        │
                         │ Navigation + Steps  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    FormProvider     │
                         │  React Hook Form    │
                         └──────────┬──────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
        ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
        │ Step 1 - 5   │    │ Step 6 - 7   │    │ Step 8 Review│
        │ Form Fields  │    │ Conditional  │    │ Calculations │
        └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
               │                   │                   │
               └───────────────────┼───────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
             ┌──────────────┐             ┌──────────────┐
             │ Zod Schemas  │             │  useAutoSave │
             │ + Validators │             │ + Encryption │
             └──────────────┘             └──────┬───────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │ localStorage │
                                          │ Encrypted    │
                                          │ Draft        │
                                          └──────────────┘
```

The architecture should remain centered around **one source of truth for form state, centralized validation, explicit dependency management, and isolated step components**.
