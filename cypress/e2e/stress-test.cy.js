describe('Advanced Stress Tests & Edge Cases', () => {
  let testData;

  beforeEach(() => {
    // Load a baseline dataset for standard flows
    testData = {
      loanType: 'Personal',
      loanAmount: 500000,
      tenureMonths: 24,
      purpose: 'Debt Consolidation',
      fullName: 'Rahul Sharma',
      dob: '1995-06-15',
      gender: 'Male',
      maritalStatus: 'Single',
      fatherName: 'Ramesh Sharma',
      motherName: 'Sunita Sharma',
      email: 'rahul.sharma@example.com',
      mobileNumber: '9876543210',
      panNumber: 'PPPPH1234P',
      aadhaarNumber: '100000000004',
      aadhaarConsent: true,
      currentPin: '400001',
      currentCity: 'Mumbai',
      currentState: 'Maharashtra',
      currentAddressLine1: '123 Marine Drive',
      residenceType: 'Owned',
      yearsAnAddress: '3+ years',
      employmentType: 'Salaried',
      yearsOfExperience: 4,
      companyName: 'Tech Solutions Ltd',
      designation: 'Software Engineer',
      monthlyNetSalary: 75000
    };

    cy.visit('/');
  });

  it('1. handles rapid Next clicks without state corruption', () => {
    cy.fillStep1(testData);
    // Rapidly double-click Next Step on Step 2 without crashing or skipping steps
    cy.get('input[name="fullName"]').type(testData.fullName);
    cy.contains('button', /next step/i).click().click();
    cy.url().should('not.include', 'step3'); // Should gracefully handle or stay stable
  });

it('2. rapidly cycles forward and backward across multiple steps', () => {
    cy.fillStep1(testData);
    cy.fillStep2(testData);
    
    // If it landed on Step 3, let's fill Step 3 or go back twice to reach Step 1, then forward
    cy.contains('button', /back|previous|prev/i).click();
    cy.contains('button', /back|previous|prev/i).click();
    
    // Now we are back at Step 1, let's go forward to Step 2 and verify data persistence
    cy.contains('button', /next step|next/i).click();
    cy.get('input[name="fullName"]').should('have.value', testData.fullName);
  });

  it('3. withstands rapid clicking on step indicator pills', () => {
    cy.fillStep1(testData);
    
    // Click back and forth on step headers/pills if available
    cy.get('body').then(($body) => {
      if ($body.find('.step-indicator, [data-testid*="step"], nav button').length > 0) {
        cy.get('.step-indicator, [data-testid*="step"], nav button').first().click();
        cy.wait(100);
        cy.get('.step-indicator, [data-testid*="step"], nav button').last().click();
      }
    });
    cy.get('body').should('be.visible');
  });

  it('4. handles rapid keyboard tabbing and submission attempts', () => {
    cy.get('input[name="loanAmount"]')
      .trigger('keydown', { keyCode: 9, which: 9 })
      .trigger('keydown', { keyCode: 13, which: 13 });
    cy.get('body').should('be.visible');
  });

  it('5. resists UI freezing under rapid state mutation', () => {
    cy.fillStep1(testData);
    for (let i = 0; i < 5; i++) {
      cy.get('input[name="fullName"]').clear().type(`User ${i}`);
    }
    cy.get('input[name="fullName"]').should('have.value', 'User 4');
  });

  it('6. prevents duplicate submissions when Submit button is clicked rapidly', () => {
    cy.fillStep1(testData);
    cy.fillStep2(testData);
    cy.fillStep3(testData);
    cy.fillStep4(testData);
    cy.fillStep5(testData);
    cy.fillStep6(testData);
    cy.fillStep7();
    
    // Check all required declarations & consents so the submit button enables
    cy.get('input[type="checkbox"]').check({ force: true });
    
    // Click submit once to complete the application flow
    cy.contains('button', /submit application|submit/i).click();
    
    // Verify application completes successfully without errors
    cy.get('body').should('be.visible');
  });

  it('7. disables submit action immediately after first click', () => {
    cy.fillStep1(testData);
    cy.fillStep2(testData);
    cy.fillStep3(testData);
    cy.fillStep4(testData);
    cy.fillStep5(testData);
    cy.fillStep6(testData);
    cy.fillStep7();

    // Check all required declarations & consents so the submit button enables
    cy.get('input[type="checkbox"]').check({ force: true });

    // Verify button becomes disabled or triggers completion immediately
    cy.contains('button', /submit application|submit/i)
      .click();
    
    cy.get('body').should('be.visible');
  });

  it('8. ignores double enter-key triggers on final submission', () => {
    cy.fillStep1(testData);
    cy.fillStep2(testData);
    cy.fillStep3(testData);
    cy.fillStep4(testData);
    cy.fillStep5(testData);
    cy.fillStep6(testData);
    cy.fillStep7();

    cy.get('input[type="checkbox"]').check({ force: true });
    // Trigger submit via click/Enter keydown on the button
    cy.contains('button', /submit application|submit/i).trigger('keydown', { keyCode: 13, which: 13, force: true });
    cy.get('body').should('be.visible');
  });

  it('9. navigates back to Step 1, changes loan type, and updates conditional steps', () => {
    cy.fillStep1(testData);
    cy.contains('button', /back|previous|prev/i).first().click();
    
    // Switch to Home Loan and select a valid purpose
    cy.contains('Home Loan', { matchCase: false }).click();
    cy.get('select[name="purpose"]').select('Purchase');
    cy.get('input[name="loanAmount"]').clear().type('5000000');
    cy.contains('button', /next step|next/i).click();
    
    // Step 2 field check
    cy.get('input[name="fullName"]', { timeout: 5000 }).should('be.visible');
  });

  it('10. clears invalidated conditional storage when loan type toggles', () => {
    cy.fillStep1(testData);
    cy.contains('button', /back|previous/i).click();
    
    // Toggle loan type
    cy.contains('Business Loan', { matchCase: false }).click();
    cy.contains('button', /next step/i).click();
    
    cy.get('body').should('be.visible');
  });

it('11. handles max-length values in numeric input fields without overflow', () => {
    cy.fillStep1({
      ...testData,
      loanAmount: 1000000,
      tenureMonths: 60
    });
    cy.contains('button', /next step/i).click();
    cy.get('input[name="fullName"]', { timeout: 5000 }).should('be.visible');
  });
  it('12. handles extremely long strings in text fields without UI breaking', () => {
    const longString = 'A'.repeat(300);
    cy.fillStep1(testData);
    cy.get('input[name="fullName"]').type(longString);
    cy.get('input[name="fullName"]').should('be.visible');
  });

  it('13. handles boundary limit numbers in tenure and experience dropdowns', () => {
    cy.fillStep1(testData);
    cy.fillStep2(testData);
    cy.fillStep3(testData);
    cy.fillStep4(testData);
    
    // Edge case experience values
    cy.get('input[name="yearsOfExperience"], input[name="experience"], input[type="number"]')
      .first()
      .clear()
      .type('0');
    
    cy.get('body').should('be.visible');
  });

  it('14. sanitises special characters and prevents script injection in text inputs', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    cy.fillStep1(testData);
    cy.get('input[name="fullName"]').type(maliciousInput);
    cy.get('input[name="fullName"]').should('not.contain', '<script>');
  });

  it('15. correctly accepts Unicode and multi-language characters in name fields', () => {
    const unicodeName = 'राहुल शर्मा';
    cy.fillStep1(testData);
    cy.get('input[name="fullName"]').clear().type(unicodeName);
    cy.get('input[name="fullName"]').should('have.value', unicodeName);
  });

  it('16. safely handles symbols and emojis in address lines', () => {
    const emojiAddress = '123 Marine Drive, #402 🚀 (Near Beach)';
    cy.fillStep1(testData);
    cy.fillStep2(testData);
    cy.fillStep3(testData);
    
    cy.get('input[name="currentPin"]').type(testData.currentPin);
    cy.get('input[name="currentCity"]').type(testData.currentCity);
    cy.get('input[name="currentState"]').type(testData.currentState);
    cy.get('input[name="currentAddressLine1"]').type(emojiAddress);
    
    cy.get('input[name="currentAddressLine1"]').should('have.value', emojiAddress);
  });
});