describe('Authentication', () => {
  it('completes full signup and login flow', () => {
    // Test email signup
    cy.visit('/development/signup');
    cy.get('[data-testid="email-input"]').type('test@university.edu');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="role-select"]').click();
    cy.get('[data-testid="role-student"]').click();
    cy.get('[data-testid="signup-submit"]').click();
    
    // Verify redirect to login
    cy.url().should('include', '/development/login');
    
    // Test login
    cy.get('[data-testid="email-input"]').type('test@university.edu');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-submit"]').click();
    
    // Verify successful login
    cy.url().should('include', '/development/dashboard');
  });

  it('handles Google authentication', () => {
    cy.visit('/development/login');
    cy.get('[data-testid="google-signin"]').click();
    
    // Mock Google OAuth response
    cy.window().then(win => {
      win.postMessage({ 
        type: 'oauth',
        email: 'test@university.edu'
      }, '*');
    });
    
    cy.url().should('include', '/development/dashboard');
  });
}); 