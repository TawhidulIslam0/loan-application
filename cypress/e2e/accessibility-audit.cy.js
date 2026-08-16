describe('Loan Application - Responsive Viewport & Screenshot Generator', () => {
  const viewports = [
    { label: 'mobile-320', width: 320, height: 568 },
    { label: 'mobile-375', width: 375, height: 667 },
    { label: 'mobile-414', width: 414, height: 896 },
    { label: 'tablet-768', width: 768, height: 1024 },
    { label: 'desktop-1024', width: 1024, height: 768 },
    { label: 'desktop-1440', width: 1440, height: 900 },
    { label: 'desktop-1920', width: 1920, height: 1080 }
  ];

  viewports.forEach((viewport) => {
    it(`should render correctly and capture screenshots at ${viewport.width}x${viewport.height}`, () => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit('/');

      // Step 1: Loan Details
      cy.contains('Personal Loan').click({ force: true });
      
      // Target Loan Amount input
      cy.get('input[placeholder*="loan amount"], input[placeholder*="Enter loan amount"]')
        .first()
        .clear({ force: true })
        .type('800000', { force: true })
        .blur();

      // Target Tenure input
      cy.get('input[placeholder*="tenure"], input[placeholder*="Enter tenure"]')
        .first()
        .clear({ force: true })
        .type('36', { force: true })
        .blur();
      // Select Loan Purpose from the dropdown
      cy.get('select').first().select('Medical', { force: true });
      // Short pause to ensure the UI updates completely
      cy.wait(500);
      // Capture screenshot with all fields filled
      cy.screenshot(`step1-${viewport.label}`, { capture: 'fullPage' });
      // Step 2: Personal Information
      cy.contains('button', 'Next Step').click();
      cy.get('[data-cy="step2-full-name"] input, input[name*="fullName"]').first().type('Ally User', { force: true });
      cy.get('[data-cy="step2-dob"] input, input[name*="dob"]').first().type('1990-06-15', { force: true });
      cy.get('input[name*="gender"][value="Male"], input[type="radio"][value="Male"]').first().check({ force: true });
      cy.get('select[name*="maritalStatus"]').select('Married', { force: true });
      cy.get('input[name*="fatherName"]').first().type('Father Name', { force: true });
      cy.get('input[name*="motherName"]').first().type('Mother Name', { force: true });
      cy.get('input[name*="email"]').first().type('a11y@example.com', { force: true });
      cy.get('input[name*="mobile"]').first().type('9999999999', { force: true });

      cy.wait(500);
      cy.screenshot(`step2-${viewport.label}`, { capture: 'fullPage' });

      // --- Step 3: Identity Verification ---
      cy.contains('button', 'Next Step').click({ force: true });
      cy.contains('Identity Verification', { timeout: 10000 }).should('be.visible');

      // Fill PAN and Aadhaar
      cy.get('input[placeholder*="PAN"], input[name*="pan"], [data-cy="step3-pan"] input')
        .first()
        .clear({ force: true })
        .type('PPPPP5678P', { force: true })
        .blur();

      cy.get('input[placeholder*="Aadhaar"], input[name*="aadhaar"], [data-cy="step3-aadhaar"] input')
        .first()
        .clear({ force: true })
        .type('987654321012', { force: true })
        .blur();

      // Check the mandatory consent checkbox
      cy.get('input[type="checkbox"]').first().check({ force: true });

      // Wait for the async verification check to settle and avoid 30s timeout
      cy.wait(500);
      cy.screenshot(`step3-${viewport.label}`, { capture: 'fullPage' });
      
  // --- Step 4: Address Details ---
      cy.contains('button', 'Next Step').click({ force: true });
      cy.contains('Address Details', { timeout: 10000 }).should('be.visible');

      // Fill Address Line 1
      cy.get('input[placeholder*="House No"], input[name*="addressLine1"]')
        .first()
        .clear({ force: true })
        .type('45 Connaught Place', { force: true })
        .blur();

      // Fill PIN Code and wait for location fetch
      cy.get('input[placeholder*="110001"], input[name*="pincode"]')
        .first()
        .clear({ force: true })
        .type('110001', { force: true })
        .blur();

      cy.wait(1200); // Wait for async location lookup to resolve

      // Select Residence Type ('Owned')
      cy.get('select').eq(0).select('Owned', { force: true });

      // Select Years at Current Address using exact matching text ('3+ years')
      cy.get('select').eq(1).select('3+ years', { force: true });

      // Check the permanent address checkbox by targeting its container label
      cy.contains('Permanent address is same as current address')
        .parent()
        .find('input[type="checkbox"]')
        .check({ force: true });

      cy.wait(500);
      cy.screenshot(`step4-${viewport.label}`, { capture: 'fullPage' });

    // --- Step 5: Employment & Income Details ---
      cy.contains('button', 'Next Step').click({ force: true });
      cy.contains('Employment', { timeout: 10000 }).should('be.visible');

      // Click 'Salaried' employment type and wait for conditional fields to render
      cy.contains('Salaried').click({ force: true });
      cy.wait(500);

      // Fill Years of Experience
      cy.get('input[placeholder*="5"], input[name*="experience"]')
        .first()
        .clear({ force: true })
        .type('5', { force: true })
        .blur();

      // Fill Company Name inside Salaried Details
      cy.get('input[placeholder*="Acme Corp"], input[name*="companyName"]')
        .first()
        .clear({ force: true })
        .type('Tech Corp', { force: true })
        .blur();

      // Fill Designation
      cy.get('input[placeholder*="Software Engineer"], input[name*="designation"]')
        .first()
        .clear({ force: true })
        .type('Senior Developer', { force: true })
        .blur();

      // Fill Monthly Net Salary
      cy.get('input[placeholder*="65000"], input[name*="monthlySalary"]')
        .first()
        .clear({ force: true })
        .type('85000', { force: true })
        .blur();

      cy.wait(500);
      cy.screenshot(`step5-${viewport.label}`, { capture: 'fullPage' });

      // --- Step 6: Co-Applicant & Guarantor Details ---
      cy.contains('button', 'Next Step').click({ force: true });
      cy.contains('Co-Applicant', { timeout: 10000 }).should('be.visible');

      // Fill Co-Applicant Full Name
      cy.get('input[placeholder*="Jane Doe"], input[name*="coApplicantName"]')
        .first()
        .clear({ force: true })
        .type('Jane Doe', { force: true })
        .blur();

      // Select Relationship ('Spouse')
      cy.get('select').first().select('Spouse', { force: true });

      // Fill Co-Applicant PAN Number
      cy.get('input[placeholder*="ABCDE1234P"], input[name*="coApplicantPan"]')
        .first()
        .clear({ force: true })
        .type('ABCDE1234P', { force: true })
        .blur();

      // Fill Co-Applicant Monthly Income
      cy.get('input[placeholder*="40000"], input[name*="coApplicantIncome"]')
        .first()
        .clear({ force: true })
        .type('40000', { force: true })
        .blur();

      // Check verification consent checkbox
      cy.contains('I verify that the co-applicant details provided')
        .parent()
        .find('input[type="checkbox"]')
        .check({ force: true });

      cy.wait(500);
      cy.screenshot(`step6-${viewport.label}`, { capture: 'fullPage' });

  // Step 7
      cy.contains('button', 'Next Step').click({ force: true });
      cy.contains('PAN Card Copy', { timeout: 10000 }).should('be.visible');

      cy.get('input[type="file"]').eq(0).selectFile('cypress/fixtures/images/pan-card.png', { force: true });
      cy.get('input[type="file"]').eq(1).selectFile('cypress/fixtures/images/aadhaar-card-front.png', { force: true });
      cy.get('input[type="file"]').eq(2).selectFile('cypress/fixtures/images/aadhaar-card-back.png', { force: true });
      cy.get('input[type="file"]').eq(3).selectFile('cypress/fixtures/images/Bank-Statement.jpg', { force: true });
      cy.get('input[type="file"]').eq(4).selectFile('cypress/fixtures/images/passport.png', { force: true });
      cy.get('input[type="file"]').eq(5).selectFile('cypress/fixtures/images/Salary-Slip-1.jpg', { force: true });
      cy.get('input[type="file"]').eq(6).selectFile('cypress/fixtures/images/Slary-Slip-2.png', { force: true });
      cy.get('input[type="file"]').eq(7).selectFile('cypress/fixtures/images/Salary-Slip-3.png', { force: true });

      // Render the signature stroke directly on canvas and fire pointer/mouse events
      cy.get('canvas')
        .first()
        .then(($canvas) => {
          const canvas = $canvas[0];
          const ctx = canvas.getContext('2d');
          
          // Draw visible stroke on canvas context directly
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(40, 50);
          ctx.lineTo(150, 50);
          ctx.lineTo(120, 20);
          ctx.stroke();
        })
        .trigger('pointerdown', { pointerId: 1, bubbles: true, clientX: 40, clientY: 50 })
        .trigger('pointermove', { pointerId: 1, bubbles: true, clientX: 150, clientY: 50 })
        .trigger('pointerup', { pointerId: 1, bubbles: true })
        .trigger('mousedown', { which: 1, clientX: 40, clientY: 50, force: true })
        .trigger('mousemove', { clientX: 150, clientY: 50, force: true })
        .trigger('mouseup', { force: true });

      cy.wait(1000);
      cy.screenshot(`step7-${viewport.label}`, { capture: 'fullPage' });

      // Step 8
      cy.contains('button', 'Next Step').click({ force: true });
      cy.contains('I confirm all information and documents')
        .parent()
        .find('input[type="checkbox"]')
        .check({ force: true });

      cy.contains('I authorise LendSwift to check my credit score')
        .parent()
        .find('input[type="checkbox"]')
        .check({ force: true });

      cy.contains('I agree to the Terms and Conditions')
        .parent()
        .find('input[type="checkbox"]')
        .check({ force: true });

      cy.contains('I consent to receive status updates')
        .parent()
        .find('input[type="checkbox"]')
        .check({ force: true });

      cy.wait(500);
      cy.screenshot(`declarations-${viewport.label}`, { capture: 'fullPage' });

      // Click the Submit Application button
      cy.contains('button, [role="button"]', 'Submit Application')
        .click({ force: true });

      cy.wait(2000);
      cy.screenshot(`submitted-${viewport.label}`, { capture: 'fullPage' });
    });
  });
});