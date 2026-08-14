describe('Auto-Save and Resume Functionality', () => {
  it('saves progress up to Step 4 and resumes successfully', () => {
    cy.visit('/');
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.fillStep2(data);
      cy.fillStep3(data);
      cy.fillStep4(data);
    });

    // Click the Save Draft button visible in your UI to ensure it saves
    cy.contains('button', /save draft/i).click();
    cy.wait(1000);

    // Simulate closing the browser and coming back
    cy.clearCookies();
    cy.visit('/'); // Re-visit the main URL like a returning user

    // Since your app automatically restores the session without a modal, 
    // we just verify that it successfully put us back on Step 5
    cy.contains(/step 5.*employment/i, { matchCase: false }).should('be.visible');
    
    // Check that the form successfully loaded the Employment step
    cy.contains('label', /employment type/i).should('be.visible');
  });
});