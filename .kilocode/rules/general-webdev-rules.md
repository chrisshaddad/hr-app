---
applyTo: '**'
---

# Next.js Project Development Guidelines

## Core Architectural Principles

Apply fundamental software principles across the entire stack, from UI components to API routes. Make sure that a native developer can understand and extend the codebase with minimal friction. Use sequential thinking to ensure that each step builds on the previous one.

### OCP & Component-Driven Design (Open/Closed Principle)

Structure the application around modular, reusable components and modules. These units should be "closed" for modification but "open" for extension.

### DRY (Don't Repeat Yourself)

Avoid code duplication. Abstract shared logic into custom hooks (use...), utility functions (in a lib/ or utils/ directory), and reusable components.

### KISS (Keep It Simple, Stupid)

Keep components, functions, and logic as simple and focused as possible. Prefer clear, readable code over complex or premature optimizations.

## Frontend & UI Development

### Responsive, Mobile-First Design

All UIs must be fully responsive, designed for mobile devices first, and then progressively enhanced for larger screens.

## Code Quality & Maintainability

The primary goal is for any developer to be able to understand, maintain, and extend the codebase with minimal friction.

### Self-Documenting Code & Naming

Write clean code with clear and consistent naming conventions for files, components, variables, and functions. Comments should explain the why, not the what.

### Project Structure

Maintain a logical project structure (e.g., app/, components/, lib/, hooks/, styles/) to ensure the codebase remains scalable and easy to navigate.

### Type Safety

Utilize and enforce type safety to reduce runtime bugs and improve the overall developer experience.
