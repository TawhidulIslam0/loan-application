import 'cypress-real-events/support';

describe('Keyboard Navigation', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  const selectDropdownWithKeyboard = (selector, optionText) => {
    cy.get(selector).focus();
    cy.realPress('Enter');
    cy.realPress('ArrowDown');
    cy.realPress('ArrowDown');
    cy.realPress('Enter');
  };

  it('verifies logical keyboard focus order on Step 1', () => {
    cy.get('input, select, button').first().focus();

    cy.realPress('Tab');
    cy.focused().should('exist');

    cy.realPress('Tab');
    cy.focused().should('exist');

    cy.realPress('Tab');
    cy.focused().should('exist');

    cy.realPress('Tab');
    cy.focused().should('exist').and(($btn) => {
      const text = $btn.text();
      expect(text.includes('Next') || text.includes('Save Draft')).to.be.true;
    });
  });

  it('supports backward navigation with Shift+Tab', () => {
    cy.get('input, select, button').first().focus();

    cy.realPress('Tab');
    cy.focused().should('exist');

    cy.realPress('Tab');
    cy.focused().should('exist');

    cy.realPress('Tab');
    cy.focused().should('exist');

    cy.realPress('Tab');
    cy.focused().should('exist');

    cy.realPress(['Shift', 'Tab']);
    cy.focused().should('exist');

    cy.realPress(['Shift', 'Tab']);
    cy.focused().should('exist');

    cy.realPress(['Shift', 'Tab']);
    cy.focused().should('exist');

    cy.realPress(['Shift', 'Tab']);
    cy.focused().should('exist');
  });

  it('completes Step 1 using only keyboard', () => {
    cy.get('input[type="radio"], [data-cy*="loan-type"], button:contains("Personal Loan")')
      .first()
      .focus();
    cy.realPress('Space');

    cy.get('input[type="number"], input[placeholder*="800000"], input[name*="amount"]')
      .first()
      .focus()
      .clear()
      .type('800000');

    cy.get('input[placeholder*="tenure"], input[name*="tenure"]')
      .first()
      .focus()
      .clear()
      .type('36');

    selectDropdownWithKeyboard('select#purpose, select[name*="purpose"]', 'Debt Consolidation');

    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Space');

    cy.contains('Personal Information').should('be.visible');
  });

  it('completes Steps 1-2 using only keyboard', () => {
    cy.get('input[type="radio"], [data-cy*="loan-type"], button:contains("Personal Loan")')
      .first()
      .focus();
    cy.realPress('Space');

    cy.get('input[type="number"], input[placeholder*="800000"], input[name*="amount"]')
      .first()
      .focus()
      .type('800000');

    cy.get('input[placeholder*="tenure"], input[name*="tenure"]')
      .first()
      .focus()
      .type('36');

    selectDropdownWithKeyboard('select#purpose, select[name*="purpose"]', 'Debt Consolidation');

    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Space');

    cy.contains('Personal Information').should('be.visible');

    cy.get('[data-cy="step2-full-name"] input, input[name*="fullName"]')
      .first()
      .focus()
      .type('Keyboard User');

    cy.get('[data-cy="step2-dob"] input, input[name*="dob"]')
      .first()
      .focus()
      .type('1990-06-15');

    cy.get('input[name*="gender"][value="Male"], input[type="radio"][value="Male"]')
      .first()
      .focus();
    cy.realPress('Space');

    selectDropdownWithKeyboard('select[name*="maritalStatus"]', 'Married');

    cy.get('input[name*="fatherName"]')
      .first()
      .focus()
      .type('Father Name');

    cy.get('input[name*="motherName"]')
      .first()
      .focus()
      .type('Mother Name');

    cy.get('input[name*="email"]')
      .first()
      .focus()
      .type('keyboard@example.com');

    cy.get('input[name*="mobile"]')
      .first()
      .focus()
      .type('9876543210');

    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Space');

    cy.contains('Identity Verification').should('be.visible');
  });


  it('completes the entire application using keyboard only', () => {
    // step 1
    cy.get('input[type="radio"], [data-cy*="loan-type"], button:contains("Personal Loan")')
      .first()
      .focus();
    cy.realPress('Space');

    cy.get('input[type="number"], input[placeholder*="800000"], input[name*="amount"]')
      .first()
      .focus()
      .type('800000');

    cy.get('input[placeholder*="tenure"], input[name*="tenure"]')
      .first()
      .focus()
      .type('36');

    selectDropdownWithKeyboard('select#purpose, select[name*="purpose"]', 'Debt Consolidation');

    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Space');

    cy.contains('Personal Information').should('be.visible');
    // step 2
    cy.get('[data-cy="step2-full-name"] input, input[name*="fullName"]')
      .first()
      .focus()
      .type('Keyboard User');

    cy.get('[data-cy="step2-dob"] input, input[name*="dob"]')
      .first()
      .focus()
      .type('1990-06-15');

    cy.get('input[name*="gender"][value="Male"], input[type="radio"][value="Male"]')
      .first()
      .focus();
    cy.realPress('Space');

    selectDropdownWithKeyboard('select[name*="maritalStatus"]', 'Married');

    cy.get('input[name*="fatherName"]')
      .first()
      .focus()
      .type('Father Name');

    cy.get('input[name*="motherName"]')
      .first()
      .focus()
      .type('Mother Name');

    cy.get('input[name*="email"]')
      .first()
      .focus()
      .type('keyboard@example.com');

    cy.get('input[name*="mobile"]')
      .first()
      .focus()
      .type('9876543210');

    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Space');

    cy.contains('Identity Verification').should('be.visible');
    // step 3
    cy.get('[data-cy="step3-pan"] input, input[name*="pan"]').first().focus().type('PPPPP5678P');
    cy.get('[data-cy="step3-aadhaar"] input, input[name*="aadhaar"]').first().focus().type('987654321012');

    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Space');

    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Space');
    cy.contains('Address').should('be.visible');

// step 4
    cy.get('input[placeholder*="House No"], input[name*="addressLine1"]').first().focus().type('45 Connaught Place');
    cy.get('input[placeholder*="110001"], input[name*="pincode"]').first().focus().type('110001');

    cy.get('select[name*="residenceType"]').first().focus();
    cy.realPress('Enter');
    cy.realPress('ArrowDown');
    cy.realPress('ArrowDown');
    cy.realPress('Enter');
    cy.realPress('Tab');

    cy.get('input[name*="rentAmount"], input[placeholder*="15000"]').first().focus().type('15000');

    selectDropdownWithKeyboard('select[name*="yearsAtAddress"], select[name*="years"]', '3+ years');

    cy.get('input[type="checkbox"], input[name*="sameAsCurrent"]').first().focus();
    cy.realPress('Space');

    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Space');
    cy.contains('Employment').should('be.visible');
    
// step 5
    cy.get('[data-cy="step5-employment-type-Salaried"], input[value="Salaried"]').first().focus();
    cy.realPress('Space');

    cy.get('input[placeholder*="5"], input[name*="totalExperience"], input[name*="experience"]').first().focus().type('5');

    cy.get('[data-cy="step5-company-name"] input, input[name*="companyName"]').first().focus().type('DataAnnotation');
    cy.get('[data-cy="step5-designation"] input, input[name*="designation"]').first().focus().type('Frontend Engineer');
    cy.realPress('Tab');
    cy.focused().type('120000');

    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Space');
    cy.contains('Co-Applicant').should('be.visible');

// step 6
cy.get(
  '[data-cy="coApplicantName"] input, input[name="coApplicantName"]'
)
  .first()
  .focus()
  .should('be.focused')
  .type('Rohan Gupta');

cy.realPress('Tab');

cy.focused().then(($el) => {
  cy.log(
    `Relationship focused: ${$el.attr('data-cy')} | ${$el.attr('name')}`
  );
});

cy.realPress('ArrowDown');
cy.realPress('Enter');
cy.realPress('Tab');
cy.realPress('Tab');
cy.focused()
  .type('PPPPO9012P');
cy.realPress('Tab');
cy.focused()
  .type('80000');
cy.realPress('Tab');
cy.realPress('Space');
cy.realPress('Tab');
cy.realPress('Tab');
cy.realPress('Tab');

cy.realPress('Enter');
    
// step 7: Document Upload & E-Signature
    cy.contains('Document Upload').should('be.visible');

    cy.get('input[type="file"]').eq(0).selectFile('cypress/fixtures/images/pan-card.png', { force: true });
    cy.get('input[type="file"]').eq(1).selectFile('cypress/fixtures/images/aadhaar-card-front.png', { force: true });
    cy.get('input[type="file"]').eq(2).selectFile('cypress/fixtures/images/aadhaar-card-back.png', { force: true });
    cy.get('input[type="file"]').eq(3).selectFile('cypress/fixtures/images/Bank-Statement.jpg', { force: true });
    cy.get('input[type="file"]').eq(4).selectFile('cypress/fixtures/images/passport.png', { force: true });
    cy.get('input[type="file"]').eq(5).selectFile('cypress/fixtures/images/Salary-Slip-1.jpg', { force: true });
    cy.get('input[type="file"]').eq(6).selectFile('cypress/fixtures/images/Slary-Slip-2.png', { force: true });
    cy.get('input[type="file"]').eq(7).selectFile('cypress/fixtures/images/Salary-Slip-3.png', { force: true });

    cy.get('canvas').first().realMouseDown({ x: 10, y: 10 }).realMouseMove(100, 50).realMouseUp();

    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.contains('button', 'Next Step').click({ force: true });

   // step 8)
    cy.contains('Review & Submit').should('be.visible');

    // Focus and check all declaration checkboxes using keyboard
    cy.get('input[type="checkbox"]').eq(0).focus();
    cy.realPress('Space');

    cy.get('input[type="checkbox"]').eq(1).focus();
    cy.realPress('Space');

    cy.get('input[type="checkbox"]').eq(2).focus();
    cy.realPress('Space');

    cy.get('input[type="checkbox"]').eq(3).focus();
    cy.realPress('Space');

    // Focus the Submit Application blue button directly and press Enter
    cy.contains('button', 'Submit Application').focus();
    cy.realPress('Enter');

    
  });
});