# Contributing to Cloud DevOps Labs

Thank you for your interest in contributing to the Cloud DevOps Labs! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion for improvement:

1. Check if the issue already exists in the GitHub Issues section
2. If not, create a new issue with a descriptive title and detailed information:
   - Steps to reproduce (for bugs)
   - Expected behavior
   - Actual behavior
   - Screenshots if applicable
   - Environment details (OS, AWS region, etc.)

### Submitting Changes

1. Fork the repository
2. Create a new branch from `main` for your changes
3. Make your changes following the coding standards
4. Add or update documentation as needed
5. Add or update tests as needed
6. Commit your changes with clear, descriptive commit messages
7. Push your branch to your fork
8. Submit a pull request to the `main` branch

### Pull Request Process

1. Ensure your PR includes a clear description of the changes
2. Update the README.md or documentation with details of changes if applicable
3. The PR should work on all supported platforms
4. Ensure all tests pass
5. Address any review comments or requested changes

## Lab Structure Guidelines

When contributing a new lab or project, please follow this structure:

```
lab-name/
├── README.md           # Overview, objectives, instructions
├── metadata.yaml       # Lab metadata
├── instructions/       # Detailed step-by-step guides
├── src/                # Source code (if applicable)
├── infra/              # Infrastructure code (Terraform, CloudFormation, etc.)
└── diagrams/           # Architecture diagrams
```

### README.md Template

Each lab should include a README.md with:

- Title and brief description
- Learning objectives
- Prerequisites
- Instructions or link to instructions
- Additional resources

### Metadata Format

Each lab should include a metadata.yaml file with:

```yaml
title: Lab Title
level: 100|200|300|400
tags:
  - aws
  - terraform
  - etc
primary_tech: aws|iac|cicd|etc
description: Brief description of the lab
status: planned|in-progress|complete
```

## Coding Standards

- Follow language-specific best practices
- Use meaningful variable and function names
- Include comments for complex logic
- Follow AWS best practices for all AWS resources
- Follow security best practices

## Security Guidelines

- Never commit secrets, credentials, or personal data
- Use IAM roles with least privilege principles
- Follow secure coding practices
- Keep dependencies updated
- Use secure defaults in all configurations
- Document security considerations for each lab/project

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
