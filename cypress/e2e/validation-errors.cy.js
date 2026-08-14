describe('Step-by-Step Validation Errors & Edge Cases', () => {
  beforeEach(() => {
    cy.visit('/');
  });

it('Step 1: Loan Details validation errors', () => {
    // 1. Attempt to submit empty to trigger errors
    cy.contains('button', /next step/i).click();
    cy.contains(/invalid enum value|loan type is required/i).should('be.visible');
    cy.contains(/please enter a valid loan amount/i).should('be.visible');
    cy.contains(/please enter a valid tenure/i).should('be.visible');
    cy.contains(/please select a loan purpose/i).should('be.visible');

    // 2. Blur validation
    cy.get('input[name="loanAmount"]').focus().blur();
    cy.contains(/please enter a valid loan amount/i).should('be.visible');

    // 3. Fill out the fields correctly
    cy.contains('button, div', /personal loan/i).click({ force: true });
    cy.get('input[name="loanAmount"]').type('500000');
    cy.get('input[name="tenureMonths"], input[placeholder*="tenure" i]').type('120');

    cy.get('select#purpose').then(($select) => {
      const optionVal = $select.find('option').eq(1).val() || $select.find('option').eq(1).text();
      cy.wrap($select).select(optionVal, { force: true });
    });
    
    // 4. Click Next Step again (or blur the last field) so validation updates
    cy.contains('button', /next step/i).click();

    // 5. Verify the error message disappears
    cy.contains(/please enter a valid loan amount/i).should('not.exist');
  });
  
 it('Step 2: Personal Information validation errors', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.fillStep1(data);
    });

    // 1. Submit empty Step 2 to trigger all field validations
    cy.contains('button', /next step/i).click();

    // 2. Assert against the exact error messages shown in your UI
    cy.contains(/only letters, spaces, and periods are allowed/i).should('be.visible');
    cy.contains(/you must be between 21 and 65 years old/i).should('be.visible');
    cy.contains(/invalid enum value/i).should('be.visible');
    cy.contains(/please select a valid marital status/i).should('be.visible');
    cy.contains(/invalid email address format/i).should('be.visible');
    cy.contains(/mobile number must be 10 digits/i).should('be.visible');
  });

  it('Step 3: Identity & PAN validation errors', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.fillStep2(data);
    });

    // 1. Submit empty Step 3 to trigger all validation messages
    cy.contains('button', /next step/i).click();
    cy.contains(/pan is required/i).should('be.visible');
    cy.contains(/aadhaar is required/i).should('be.visible');
    cy.contains(/you must provide aadhaar consent to proceed/i).should('be.visible');

    // 2. Test invalid PAN format on blur
    cy.get('input[name="panNumber"]').type('INVALIDPAN').blur();
    cy.contains(/invalid pan format/i).should('be.visible');

    // 3. Correct the PAN format and verify error clears
    cy.get('input[name="panNumber"]').clear().type('ABCDE1234P').blur();
    cy.contains(/invalid pan format/i).should('not.exist');
  });

  it('Step 4: Address Details validation errors', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.fillStep2(data);
      cy.fillStep3(data);
    });

    // Submit empty Step 4 to trigger all address validation errors
    cy.contains('button', /next step/i).click();

    cy.contains(/address is required/i).should('be.visible');
    cy.contains(/pin code is required/i).should('be.visible');
    cy.contains(/city is required/i).should('be.visible');
    cy.contains(/state is required/i).should('be.visible');
    cy.contains(/please select residence type/i).should('be.visible');
    cy.contains(/please specify duration/i).should('be.visible');
    cy.contains(/permanent address is required/i).should('be.visible');
  });

 it('Step 5: Employment & Income Details validation errors', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.fillStep2(data);
      cy.fillStep3(data);
      cy.fillStep4(data);
    });

    // Submit empty Step 5 to trigger employment validations
    cy.contains('button', /next step/i).click();
    cy.contains(/Please select employment type/i).should('be.visible');
    cy.contains(/Required/i).should('be.visible');
  });

  it('Step 6: Co-Applicant validation errors (if active)', () => {
    cy.fixture('valid-home-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.fillStep2(data);
      cy.fillStep3(data);
      cy.fillStep4(data);
      cy.fillStep5(data);
    });

    cy.get('body').then(($body) => {
      if ($body.find('input[name="coApplicantName"]').length > 0) {
        cy.log('Co-applicant step is present. Testing validation errors...');

        // Submit empty Step 6 to trigger errors
        cy.contains('button', /next step/i).click();

        // Assert against the exact UI error messages for Step 6
        cy.contains(/co-applicant name is required/i).should('be.visible');
        cy.contains(/please select a relationship/i).should('be.visible');
        cy.contains(/pan is required/i).should('be.visible');
        cy.contains(/income is required/i).should('be.visible');
        cy.contains(/consent is required to proceed/i).should('be.visible');
      } else {
        cy.log('Co-applicant step was bypassed for this loan configuration.');
      }
    });
  });

  it('Step 7: Document Upload validation errors', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.fillStep2(data);
      cy.fillStep3(data);
      cy.fillStep4(data);
      cy.fillStep5(data);
      cy.fillStep6(data);
    });
    cy.contains('button', /next step/i).click();
    cy.contains(/pan card copy is required/i).should('be.visible');
  });

it('Step 8: Review & Submit validation errors & button lock', () => {
  cy.fixture('valid-personal-loan.json').then((data) => {
    cy.fillStep1(data);
    cy.fillStep2(data);
    cy.fillStep3(data);
    cy.fillStep4(data);
    cy.fillStep5(data);
    cy.fillStep6(data);
    cy.fillStep7(data);
  });

  // Verify that the submit button is disabled/locked initially before checking consents
  cy.contains('button', /submit application/i).should('be.disabled');

  // Verify the helper text indicating requirements are missing
  cy.contains(/complete all required consents and mandatory documents before submitting/i).should('be.visible');

  // Optionally, check off the required boxes one by one to unlock it
  cy.get('input[type="checkbox"]').check({ force: true });

  // Now verify the button becomes enabled once everything is checked
  cy.contains('button', /submit application/i).should('not.be.disabled');
});
});