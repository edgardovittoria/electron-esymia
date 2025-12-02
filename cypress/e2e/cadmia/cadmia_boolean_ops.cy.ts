describe('Cadmia Boolean Operations', () => {
    beforeEach(() => {
        cy.login(
            Cypress.env('auth0_username'),
            Cypress.env('auth0_password')
        );
        cy.get('[data-testid="cadmia"]').click();
        cy.contains('New Blank Project').click();
    });

    const createShapes = () => {
        // Add a Brick
        cy.contains('Add Brick').should('exist');
        cy.contains('Add Brick').parent().parent().click();
        // Add a Sphere
        cy.contains('Add Sphere').should('exist');
        cy.contains('Add Sphere').parent().parent().click();
        // Wait for them to appear in Outliner
        cy.contains('BRICK_').should('be.visible');
        cy.contains('SPHERE_').should('be.visible');
    };

    it('should perform a Union operation', () => {
        createShapes();

        // 1. Activate UNION mode
        cy.contains('UNION').parent().parent().click();

        // 2. Select operands in Outliner
        cy.contains('BRICK_').click();
        cy.contains('SPHERE_').click();

        // 3. Execute
        cy.contains('EXECUTE').parent().parent().click();

        // 4. Verify result
        // The original shapes should be removed/hidden and a new one added?
        // Based on code: "UNION" removes elements.
        // The new entity name depends on logic, but usually it's a Composite.
        // Let's check if the original items are gone or if a new item appears.
        // The history node name is "UNION Operation".
        // The Outliner might show the new composite entity.
        // Let's wait and see what happens in the UI.
        // For now, we check that the operation completes without error.
        cy.contains('History').click();
        cy.contains('UNION Operation').should('exist'); // Check History or Outliner if named so
    });

    it('should perform a Subtraction operation', () => {
        createShapes();

        // 1. Activate SUBTRACTION mode
        cy.contains('SUBTRACTION').parent().parent().click();

        // 2. Select operands
        // Main entity first (Brick), then tool (Sphere)
        cy.contains('BRICK_').click();
        cy.contains('SPHERE_').click();

        // 3. Execute
        cy.contains('EXECUTE').parent().parent().click();

        // 4. Verify result
        cy.contains('History').click();
        cy.contains('SUBTRACTION Operation').should('exist');
    });

    it('should perform an Intersection operation', () => {
        createShapes();

        // 1. Activate INTERSECTION mode
        cy.contains('INTERSECTION').parent().parent().click();

        // 2. Select operands
        cy.contains('BRICK_').click();
        cy.contains('SPHERE_').click();

        // 3. Execute
        cy.contains('EXECUTE').parent().parent().click();

        // 4. Verify result
        cy.contains('History').click();
        cy.contains('INTERSECTION Operation').should('exist');
    });
});
