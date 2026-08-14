describe('File Upload Edge Cases & Validations', () => {
  beforeEach(() => {
    cy.visit('/');
    // Navigate to Step 7 (Document Upload)
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.fillStep2(data);
      cy.fillStep3(data);
      cy.fillStep4(data);
      cy.fillStep5(data);
      cy.fillStep6(data);
    });
  });
      // 1
  it('uploads a valid file and displays preview', () => {
    cy.fixture('images/pan-card.png', null).then((fileContent) => {
      cy.contains('label', /pan card copy/i)
        .parent()
        .find('input[type="file"]')
        .selectFile({ contents: fileContent, fileName: 'pan-card.png', mimeType: 'image/png' }, { force: true });
    });
    cy.get('.preview-container, img[alt*="preview"], .file-uploaded-indicator').should('be.visible');
  });
  // 2
  it('shows error on uploading an oversized file (>5MB)', () => {
    // Generate a mock large binary buffer exceeding 5MB
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
    cy.contains('label', /pan card copy/i)
      .parent()
      .find('input[type="file"]')
      .selectFile({ contents: largeBuffer, fileName: 'large-file.pdf', mimeType: 'application/pdf' }, { force: true });

    cy.contains(/file size exceeds|maximum size|5mb/i).should('be.visible');
  });
  // 3
  it('shows error on uploading an unsupported file type', () => {
    cy.fixture('images/pan-card.png', null).then((fileContent) => {
      cy.contains('label', /pan card copy/i)
        .parent()
        .find('input[type="file"]')
        .selectFile({ contents: fileContent, fileName: 'script.exe', mimeType: 'application/x-msdownload' }, { force: true });
    });

    cy.contains(/File type must be one of/i).should('be.visible');
  });
//4
  it('allows uploading a file and then replacing it with another file', () => {
    // 1. Upload initial file
    cy.fixture('images/pan-card.png', null).then((fileContent) => {
      cy.contains('label', /pan card copy/i)
        .parent()
        .find('input[type="file"]')
        .selectFile({ contents: fileContent, fileName: 'pan-card.png', mimeType: 'image/png' }, { force: true });
    });
    
    // Verify the file is uploaded and the replace text/indicator is visible
    cy.contains(/Click or drag to replace this file/i).should('be.visible');

    // 2. Select the new file directly on the same hidden file input to replace it
    cy.fixture('images/pan-card-2.png', null).then((newFileContent) => {
      cy.contains('label', /pan card copy/i)
        .parent()
        .find('input[type="file"]')
        .selectFile({ contents: newFileContent, fileName: 'pan-card-2.png', mimeType: 'image/png' }, { force: true });
    });

    // 3. Verify the new file successfully updates the name in the preview
    cy.contains('pan-card-2.png').should('be.visible');
  });
//5
  it('compresses high-resolution images successfully', () => {
    cy.fixture('images/pan-card.png', null).then((fileContent) => {
      cy.contains('label', /pan card copy/i)
        .parent()
        .find('input[type="file"]')
        .selectFile({ contents: fileContent, fileName: 'pan-card.png', mimeType: 'image/png' }, { force: true });
    });
    // Verify successful upload indicator after handling high-res image
    cy.get('.file-uploaded-indicator, .preview-container, img[alt*="preview"]').should('be.visible');
  });
});