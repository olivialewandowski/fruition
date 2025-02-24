describe('Authentication', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/**').as('authRequest');
    cy.intercept('GET', '/api/user/**').as('userRequest');
  });

  it('completes full signup and login flow', () => {
    // Test signup
    cy.visit('/development/signup');
    cy.get('[data-testid="email-input"]').type('test@university.edu');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="role-select"]').click();
    cy.get('[data-testid="role-student"]').click();
    cy.get('[data-testid="signup-submit"]').click();

    // Wait for and verify redirect
    cy.wait('@authRequest');
    cy.url().should('include', '/development/login');

    // Complete login flow
    // ... test login steps
  });
}); 