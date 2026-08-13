describe('Home Loan Happy Path E2E', () => {
  it('Completes a full home loan application with co-applicant successfully', () => {
    cy.fixture('valid-home-loan').then((data) => {
      cy.visit('/');
      
      cy.fillStep1(data);
      cy.fillStep2(data);
      cy.fillStep3(data);
      cy.fillStep4(data);
      cy.fillStep5(data);
      cy.fillStep6(data); // Will fill successfully since home loans trigger it
      cy.fillStep7(data);
      cy.completeReviewAndSubmit();

      // Assertions
      cy.contains(/application submitted!/i).should('be.visible');
      cy.get('.space-y-3').should('contain', 'Home Loan');
    });
  });
});