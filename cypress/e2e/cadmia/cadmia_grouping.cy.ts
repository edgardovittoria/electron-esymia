describe('Cadmia Grouping Operations', () => {
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

    it('should group two shapes', () => {
        createShapes();

        // 1. Activate GROUP mode
        // The button initially says "GROUP"
        cy.contains('GROUP').parent().parent().click();

        // 2. Select entities to group
        cy.contains('BRICK_').click();
        cy.contains('SPHERE_').click();

        // 3. Confirm Grouping
        // The button text changes to "CONFIRM GROUP"
        cy.contains('CONFIRM GROUP').parent().parent().click();

        // 4. Verify result
        // A new group should appear, likely named "GROUP_{key}" or similar.
        // The original items should be inside it (or replaced by it in the main list).
        // We check for the history node "Group {key}"
        cy.contains('History').click();
        cy.contains(/Group \d+/).should('exist');
    });

    it('should ungroup a group', () => {
        createShapes();

        // --- Create a Group first ---
        cy.contains('GROUP').parent().parent().click();
        cy.contains('BRICK_').click();
        cy.contains('SPHERE_').click();
        cy.contains('CONFIRM GROUP').parent().parent().click();

        // Verify Group exists
        cy.contains('History').click();
        cy.contains(/Group \d+/).should('exist');

        // Switch back to Objects Details to select the group
        cy.contains('Objects Details').click();

        // Find and select the group in the Outliner
        // The group name will be something like "GROUP_..."
        // We need to find it. Since it's the only group, we can look for "GROUP_"
        cy.contains(/GROUP_\d+/).click();

        // --- Ungroup ---
        // The UNGROUP button should now be visible (check parent button visibility)
        cy.contains('UNGROUP').should('exist');
        cy.contains('UNGROUP').parent().parent().should('be.visible').click();

        // Verify result
        // The group should be gone (or at least the Ungroup operation recorded)
        cy.contains('History').click();
        cy.contains(/Ungroup GROUP_\d+/).should('exist');
    });
});
