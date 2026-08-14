describe('E-Signature Edge Cases & Validation', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.fillStep2(data);
      cy.fillStep3(data);
      cy.fillStep4(data);
      cy.fillStep5(data);
      cy.fillStep6(data);
      
      // fillStep7 signs and clicks Next, landing us on Step 8
      cy.fillStep7(); 
    });

    //  FIX: Go back to Step 7 so we can test the signature canvas!
    cy.contains('button', /previous/i).should('be.visible').click();
  });

  it('validates empty canvas submission error', () => {
    // Clear the signature that fillStep7 initially drew
    cy.contains('button', /clear signature/i).click();
    
    // Try to proceed without a signature
    cy.contains('button', /next step/i).click({ force: true });
    
    // Verify the validation error appears
    cy.contains(/signature is required/i).should('be.visible');
  });

  it('allows drawing, clearing, redrawing, and verifying preview in Step 8', () => {
    // Clear initial signature from fillStep7
    cy.contains('button', /clear signature/i).click();

    // Draw new signature ( FIX: Added both pointer and mouse events to ensure it registers)
    cy.get('canvas')
      .first()
      .trigger('pointerdown', { pointerId: 1, bubbles: true, clientX: 40, clientY: 50 })
      .trigger('pointermove', { pointerId: 1, bubbles: true, clientX: 150, clientY: 50 })
      .trigger('pointerup', { pointerId: 1, bubbles: true })
      .trigger('mousedown', { which: 1, clientX: 40, clientY: 50, force: true })
      .trigger('mousemove', { clientX: 150, clientY: 50, force: true })
      .trigger('mouseup', { force: true });

    // Give it a tiny wait for state to catch up, then proceed to final review step
    cy.wait(500);
    cy.contains('button', /next step/i).click();

    // Verify we made it to Step 8 and the signature snippet/image exists
    cy.contains(/review/i, { matchCase: false }).should('be.visible');
    cy.get('img[alt*="ignature"], .signature-preview, canvas').should('exist');
  });
});