// Step 1
Cypress.Commands.add('fillStep1', (data) => {
  cy.log(`Selecting loan type: ${data.loanType} Loan`);

  cy.contains(`${data.loanType} Loan`, { matchCase: false })
    .should('be.visible')
    .click();

  cy.get('input[name="loanAmount"]')
    .should('be.visible')
    .clear()
    .type(String(data.loanAmount));

  cy.get('input[name="tenureMonths"]')
    .should('be.visible')
    .clear()
    .type(String(data.tenureMonths));

  if (data.purpose) {
    cy.get('select[name="purpose"]')
      .should('be.visible')
      .select(data.purpose)
      .blur();
  }

  cy.contains('button', /next step/i)
    .should('be.visible')
    .click();

  cy.get('input[name="fullName"]', { timeout: 5000 }).should('be.visible');
});

// Step 2
Cypress.Commands.add('fillStep2', (data) => {
  cy.get('input[name="fullName"]')
    .should('be.visible')
    .clear()
    .type(data.fullName);

  cy.get('input[name="dob"]')
    .should('be.visible')
    .clear()
    .type(data.dob);

  cy.get('select[name="gender"], [name="gender"], #gender')
    .first()
    .should('be.visible')
    .then(($el) => {
      if ($el.is('select')) {
        cy.wrap($el).select(data.gender).blur();
      } else {
        cy.wrap($el).click();
        cy.contains(new RegExp(`^${data.gender}$`, 'i')).click();
      }
    });

  cy.get('select[name="maritalStatus"], [name="maritalStatus"], #maritalStatus')
    .first()
    .should('be.visible')
    .then(($el) => {
      if ($el.is('select')) {
        cy.wrap($el).select(data.maritalStatus).blur();
      } else {
        cy.wrap($el).click();
        cy.contains(new RegExp(`^${data.maritalStatus}$`, 'i')).click();
      }
    });

  cy.get('input[name="fatherName"]')
    .should('be.visible')
    .clear()
    .type(data.fatherName);

  cy.get('input[name="motherName"]')
    .should('be.visible')
    .clear()
    .type(data.motherName);

  cy.get('input[name="email"]')
    .should('be.visible')
    .clear()
    .type(data.email);

  cy.get('input[name="mobileNumber"]')
    .should('be.visible')
    .clear()
    .type(data.mobileNumber);

  cy.contains('button', /next step/i)
    .should('be.visible')
    .click();
});

// Step 3
Cypress.Commands.add('fillStep3', (data) => {
  cy.get('input[name="panNumber"]')
    .should('be.visible')
    .clear()
    .type(data.panNumber);

  cy.get('input[name="aadhaarNumber"]')
    .should('be.visible')
    .clear()
    .type(data.aadhaarNumber);

  if (data.aadhaarConsent) {
    cy.get('input[name="aadhaarConsent"]')
      .check({ force: true });
  }

  cy.contains('button', /verify|next step/i)
    .should('be.visible')
    .click();
});

// Step 4
Cypress.Commands.add('fillStep4', (data) => {
  cy.get('input[name="currentPin"]')
    .should('be.visible')
    .clear()
    .type(data.currentPin);

  cy.get('input[name="currentCity"]')
    .should('be.visible')
    .clear()
    .type(data.currentCity);

  cy.get('input[name="currentState"]')
    .should('be.visible')
    .clear()
    .type(data.currentState);

  cy.get('input[name="currentAddressLine1"]')
    .should('be.visible')
    .clear()
    .type(data.currentAddressLine1);

  cy.get('select[name="residenceType"]')
    .should('be.visible')
    .select(data.residenceType);

  if (data.rentAmount !== undefined) {
    cy.get('input[name="rentAmount"]')
      .should('be.visible')
      .clear()
      .type(String(data.rentAmount));
  }

  cy.get('select[name="yearsAnAddress"], [name="yearsAnAddress"]')
    .should('be.visible')
    .select(String(data.yearsAnAddress))
    .blur();

  cy.contains('label', /permanent address is same/i)
    .invoke('attr', 'for')
    .then((id) => {
      if (id) {
        cy.get(`#${id}`).check({ force: true });
      } else {
        cy.contains('label', /permanent address is same/i)
          .find('input[type="checkbox"]')
          .check({ force: true });
      }
    });

  cy.contains('button', /next step/i)
    .should('be.visible')
    .click();
});

// Step 5 (Supports both Salaried and Business/Self-Employed details dynamically)
Cypress.Commands.add('fillStep5', (data) => {
  cy.log(`Selecting employment type: ${data.employmentType}`);

  cy.contains('button, label, div', data.employmentType, { matchCase: false })
    .should('be.visible')
    .click();

  // Years of Experience / Practice (Common field)
  cy.get('input[name="yearsOfExperience"], input[name="experience"], input[type="number"]')
    .first()
    .should('be.visible')
    .clear()
    .type(String(data.yearsOfExperience || '5'));

  // If Salaried (Personal Loan fields)
  if (data.employmentType.toLowerCase() === 'salaried') {
    if (data.companyName) {
      cy.get('input[name="companyName"], input[placeholder*="Acme Corp"]')
        .should('be.visible')
        .clear()
        .type(data.companyName);
    }

    if (data.designation) {
      cy.get('input[name="designation"], input[placeholder*="Software Engineer"]')
        .should('be.visible')
        .clear()
        .type(data.designation);
    }

    if (data.monthlyNetSalary !== undefined) {
      cy.get('input[name="monthlyNetSalary"], input[name="netSalary"]')
        .should('be.visible')
        .clear()
        .type(String(data.monthlyNetSalary));
    }
  } else {
    // If Self-Employed or Business Owner (Original Business fields)
    if (data.businessName) {
      cy.get('input[name="businessName"]')
        .should('be.visible')
        .clear()
        .type(data.businessName);
    }

    if (data.businessType) {
      cy.get('select[name="businessType"], [name="businessType"]')
        .should('be.visible')
        .select(data.businessType)
        .blur();
    }

    if (data.annualTurnover !== undefined) {
      cy.get('input[name="annualTurnover"]')
        .should('be.visible')
        .clear()
        .type(String(data.annualTurnover));
    }

    if (data.yearsInBusiness !== undefined) {
      cy.get('input[name="yearsInBusiness"]')
        .should('be.visible')
        .clear()
        .type(String(data.yearsInBusiness));
    }

    if (data.gstNumber) {
      cy.get('input[name="gstNumber"]')
        .should('be.visible')
        .clear()
        .type(data.gstNumber);
    }

    if (data.officeAddressLine1) {
      cy.contains('label', /office address line 1/i)
        .parent()
        .find('input')
        .should('be.visible')
        .clear()
        .type(data.officeAddressLine1);
    }

    if (data.officePin) {
      cy.contains('label', /pin code/i)
        .parent()
        .find('input')
        .last()
        .should('be.visible')
        .clear()
        .type(data.officePin);
    }

    if (data.officeCity) {
      cy.contains('label', /^city$/i)
        .parent()
        .find('input')
        .last()
        .should('be.visible')
        .clear()
        .type(data.officeCity);
    }

    if (data.officeState) {
      cy.contains('label', /^state$/i)
        .parent()
        .find('input')
        .last()
        .should('be.visible')
        .clear()
        .type(data.officeState);
    }
  }

  cy.contains('button', /next step/i)
    .should('be.visible')
    .click();
});

// Dynamic Step 6 (Co-Applicant) - Fills if available, completely bypasses if skipped
Cypress.Commands.add('fillStep6', (data) => {
  cy.get('body').then(($body) => {
    if ($body.find('input[name="coApplicantName"]').length > 0) {
      cy.log('Co-applicant step is active, filling data...');
      
      if (data && data.coApplicantName) {
        // 1. Co-Applicant Name
        cy.get('input[name="coApplicantName"]')
          .should('be.visible')
          .clear()
          .type(data.coApplicantName);

        // 2. Relationship Dropdown
        cy.contains('label', /relationship/i)
          .parent()
          .find('select')
          .should('be.visible')
          .select(data.coApplicantRelation);

        // 3. Co-Applicant PAN Number (Found via label)
        cy.contains('label', /co-applicant pan number/i)
          .parent()
          .find('input')
          .should('be.visible')
          .clear()
          .type(data.coApplicantPan);

        // 4. Co-Applicant Monthly Income (Found via label)
        cy.contains('label', /co-applicant monthly income/i)
          .parent()
          .find('input')
          .should('be.visible')
          .clear()
          .type(String(data.coApplicantIncome));

        // 5. Consent Checkbox
        cy.get('input[type="checkbox"]')
          .first()
          .check({ force: true });
      }

      cy.contains('button', /next step/i)
        .should('be.visible')
        .not('[disabled]')
        .click();
    } else {
      cy.log('Co-applicant step is skipped, safely continuing to documents.');
    }
  });
});

// Step 7 - Document Upload & E-Signature
Cypress.Commands.add('fillStep7', () => {
  cy.log('Uploading documents and signing...');

  const imgPath = 'images/';

  // 1. PAN Card Copy
  cy.get('body').then(($body) => {
    if ($body.find('label:contains("PAN Card Copy")').length > 0) {
      cy.contains('label', /pan card copy/i, { matchCase: false })
        .parent()
        .find('input[type="file"]')
        .then(($input) => {
          cy.fixture(imgPath + 'pan-card.png', null).then((fileContent) => {
            cy.wrap($input).selectFile({
              contents: fileContent,
              fileName: 'pan-card.png',
              mimeType: 'image/png'
            }, { force: true });
          });
        });
    }
  });

  // 2. Aadhaar Card - Front
  cy.get('body').then(($body) => {
    if ($body.find('label:contains("Aadhaar Card - Front")').length > 0) {
      cy.contains('label', /aadhaar card - front/i, { matchCase: false })
        .parent()
        .find('input[type="file"]')
        .then(($input) => {
          cy.fixture(imgPath + 'aadhaar-card-front.png', null).then((fileContent) => {
            cy.wrap($input).selectFile({
              contents: fileContent,
              fileName: 'aadhaar-card-front.png',
              mimeType: 'image/png'
            }, { force: true });
          });
        });
    }
  });

  // 3. Aadhaar Card - Back
  cy.get('body').then(($body) => {
    if ($body.find('label:contains("Aadhaar Card - Back")').length > 0) {
      cy.contains('label', /aadhaar card - back/i, { matchCase: false })
        .parent()
        .find('input[type="file"]')
        .then(($input) => {
          cy.fixture(imgPath + 'aadhaar-card-back.png', null).then((fileContent) => {
            cy.wrap($input).selectFile({
              contents: fileContent,
              fileName: 'aadhaar-card-back.png',
              mimeType: 'image/png'
            }, { force: true });
          });
        });
    }
  });

  // 4. Bank Statements
  cy.get('body').then(($body) => {
    if ($body.find('label:contains("Bank Statements")').length > 0) {
      cy.contains('label', /bank statements/i, { matchCase: false })
        .parent()
        .find('input[type="file"]')
        .then(($input) => {
          cy.fixture(imgPath + 'Bank-Statement.jpg', null).then((fileContent) => {
            cy.wrap($input).selectFile({
              contents: fileContent,
              fileName: 'Bank-Statement.jpg',
              mimeType: 'image/jpeg'
            }, { force: true });
          });
        });
    }
  });

  // 5. Passport Size Photograph
  cy.get('body').then(($body) => {
    if ($body.find('label').filter((_, el) => /photograph.*passport/i.test(el.textContent)).length > 0) {
      cy.contains('label', /photograph.*passport/i)
        .parent()
        .find('input[type="file"]')
        .then(($input) => {
          cy.fixture(imgPath + 'passport.png', null).then((fileContent) => {
            cy.wrap($input).selectFile({
              contents: fileContent,
              fileName: 'passport.png',
              mimeType: 'image/png'
            }, { force: true });
          });
        });
    }
  });

  // 6. Salary Slips - Last 3 Months
  for (let i = 1; i <= 3; i++) {
    cy.get('body').then(($body) => {
      if ($body.find(`label:contains("Salary Slip - Month ${i}")`).length > 0) {
        cy.contains('label', new RegExp(`salary slip - month ${i}`, 'i'))
          .parent()
          .find('input[type="file"]')
          .then(($input) => {
            let fileName, mimeType;
            if (i === 1) {
              fileName = 'Salary-Slip-1.jpg';
              mimeType = 'image/jpeg';
            } else if (i === 2) {
              fileName = 'Slary-Slip-2.png';
              mimeType = 'image/png';
            } else {
              fileName = 'Salary-Slip-3.png';
              mimeType = 'image/png';
            }

            cy.fixture(imgPath + fileName, null).then((fileContent) => {
              cy.wrap($input).selectFile({
                contents: fileContent,
                fileName: fileName,
                mimeType: mimeType
              }, { force: true });
            });
          });
      }
    });
  }

  // 7. ITR - Year 1
  cy.get('body').then(($body) => {
    if ($body.find('label:contains("ITR - Year 1")').length > 0) {
      cy.contains('label', /itr - year 1/i, { matchCase: false })
        .parent()
        .find('input[type="file"]')
        .then(($input) => {
          cy.fixture(imgPath + 'ITR-1.pdf', null).then((fileContent) => {
            cy.wrap($input).selectFile({
              contents: fileContent,
              fileName: 'ITR-1.pdf',
              mimeType: 'application/pdf'
            }, { force: true });
          });
        });
    }
  });

  // 8. ITR - Year 2
  cy.get('body').then(($body) => {
    if ($body.find('label:contains("ITR - Year 2")').length > 0) {
      cy.contains('label', /itr - year 2/i, { matchCase: false })
        .parent()
        .find('input[type="file"]')
        .then(($input) => {
          cy.fixture(imgPath + 'ITR-2.pdf', null).then((fileContent) => {
            cy.wrap($input).selectFile({
              contents: fileContent,
              fileName: 'ITR-2.pdf',
              mimeType: 'application/pdf'
            }, { force: true });
          });
        });
    }
  });

  // 9. Business Registration Certificate
  cy.get('body').then(($body) => {
    if ($body.find('label:contains("Business Registration Certificate")').length > 0) {
      cy.contains('label', /business registration certificate/i, { matchCase: false })
        .parent()
        .find('input[type="file"]')
        .then(($input) => {
          cy.fixture(imgPath + 'Business Registration Certificate.pdf', null).then((fileContent) => {
            cy.wrap($input).selectFile({
              contents: fileContent,
              fileName: 'Business Registration Certificate.pdf',
              mimeType: 'application/pdf'
            }, { force: true });
          });
        });
    }
  });

  // 10. GST Returns (Quarters 1 to 4)
  for (let i = 1; i <= 4; i++) {
    cy.get('body').then(($body) => {
      if ($body.find(`label:contains("GST Return - Quarter ${i}")`).length > 0) {
        cy.contains('label', new RegExp(`gst return - quarter ${i}`, 'i'))
          .parent()
          .find('input[type="file"]')
          .then(($input) => {
            cy.fixture(imgPath + `GST-${i}.pdf`, null).then((fileContent) => {
              cy.wrap($input).selectFile({
                contents: fileContent,
                fileName: `GST-${i}.pdf`,
                mimeType: 'application/pdf'
              }, { force: true });
            });
          });
      }
    });
  }

  // 11. Property Documents (Home Loan specific)
  cy.get('body').then(($body) => {
    if ($body.find('label:contains("Property Documents")').length > 0) {
      cy.contains('label', /property documents/i, { matchCase: false })
        .parent()
        .find('input[type="file"]')
        .then(($input) => {
          cy.fixture(imgPath + 'property.pdf', null).then((fileContent) => {
            cy.wrap($input).selectFile({
              contents: fileContent,
              fileName: 'property.pdf',
              mimeType: 'image/pdf'
            }, { force: true });
          });
        });
    }
  });

  // Draw signature on the canvas and trigger both Pointer and Mouse events 
  cy.get('canvas')
    .first()
    .should('be.visible')
    .then(($canvas) => {
      const canvas = $canvas[0];
      const width = canvas.width || 300;
      const height = canvas.height || 150;
      const context = canvas.getContext('2d');

      context.strokeStyle = '#000000';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(30, height / 2);
      context.lineTo(width - 30, height / 2);
      context.stroke();
    });

  // Simulating real pointer/mouse actions that signature pads look for
  cy.get('canvas')
    .first()
    .trigger('pointerdown', { pointerId: 1, bubbles: true, clientX: 30, clientY: 75 })
    .trigger('pointermove', { pointerId: 1, bubbles: true, clientX: 200, clientY: 75 })
    .trigger('pointerup', { pointerId: 1, bubbles: true })
    .trigger('mousedown', { which: 1, clientX: 30, clientY: 75, force: true })
    .trigger('mousemove', { clientX: 200, clientY: 75, force: true })
    .trigger('mouseup', { force: true });

  // Give a small moment for state to update, then click Next Step
  cy.wait(500);
  
  cy.contains('button', /next step/i)
    .should('be.visible')
    .not('[disabled]')
    .click();
});

// Step 8

Cypress.Commands.add('completeReviewAndSubmit', () => {
  cy.log('Reviewing and submitting application');

  // Wait for the Review screen.
  cy.contains(/review|review & submit/i, {
    timeout: 10000,
  }).should('be.visible');

  // Check required review checkboxes if they exist.
  cy.get('body').then(($body) => {
    const checkboxes = $body
      .find('input[type="checkbox"]')
      .filter(':not(:checked)');

    if (checkboxes.length > 0) {
      cy.wrap(checkboxes).check({ force: true });
    }
  });

  // Submit the application.
  cy.contains('button', /submit application|submit/i, {
    matchCase: false,
    timeout: 10000,
  })
    .should('be.visible')
    .click();
});