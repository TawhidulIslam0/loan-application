describe('Personal Loan Happy Path E2E', () => {
  it('Completes a full personal loan application successfully', () => {
    cy.fixture('valid-personal-loan').then((data) => {
      cy.visit('/');
      
      cy.fillStep1(data);
      cy.fillStep2(data);
      cy.fillStep3(data);
      cy.fillStep4(data);
      cy.fillStep5(data);
      // Business loans do not have a co-applicant step
      if (data.loanType !== 'Personal') {
        cy.fillStep6(data);
      }
      cy.fillStep7(data);
      cy.completeReviewAndSubmit();

      // Assertions
      cy.contains(/application submitted!/i).should('be.visible');
      cy.get('.space-y-3').should('contain', 'Personal Loan');
    });
  });
});