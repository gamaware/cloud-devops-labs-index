# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within any of the Cloud DevOps Labs repositories, please send an email to security@alexgarcia.info. All security vulnerabilities will be promptly addressed.

Please do not disclose security vulnerabilities publicly until they have been addressed by the maintainers.

## Security Best Practices

These repositories follow these security best practices:

1. **No Secrets in Code**: No API keys, passwords, or other secrets are stored in the code. All examples use environment variables, AWS Secrets Manager, or other secure methods for handling secrets.

2. **Least Privilege**: IAM roles and policies follow the principle of least privilege, granting only the permissions necessary for the specific task.

3. **Infrastructure as Code Security**: All IaC templates (Terraform, CloudFormation, CDK) follow security best practices and are regularly reviewed.

4. **Dependency Management**: Dependencies are regularly updated to address security vulnerabilities.

5. **Code Scanning**: GitHub code scanning is enabled to identify potential security issues.

## For Contributors

If you're contributing to these repositories, please follow these security guidelines:

1. Never commit secrets, credentials, or personal data
2. Use IAM roles with least privilege principles
3. Follow secure coding practices
4. Keep dependencies updated
5. Use secure defaults in all configurations
6. Document security considerations for each lab/project

## Security Tools Used

- GitHub Advanced Security
- Dependabot alerts and security updates
- AWS CloudFormation Guard
- Checkov for IaC scanning
- AWS Config rules for compliance checks
