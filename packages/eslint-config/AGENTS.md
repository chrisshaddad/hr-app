# ESLint Config Package

Shared ESLint configurations for the HR app.

## Project Description

ESLint configuration presets for NestJS, Next.js, and React projects.

## Key Paths

- [`base.js`](base.js) - Base configuration
- [`nest.js`](nest.js) - NestJS-specific rules
- [`next.js`](next.js) - Next.js-specific rules
- [`react-internal.js`](react-internal.js) - React internal rules

## Usage

```bash
# Add to package.json
"eslintConfig": {
  "extends": "# Add actual turborepo specific path"
}
```

## See Also

- [Root AGENTS.md](../../AGENTS.md)
