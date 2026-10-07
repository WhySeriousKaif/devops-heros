# 01. AWS IAM — Governance

## What is IAM?

AWS Identity and Access Management (IAM) controls who can authenticate to AWS and what actions they are authorized to perform. IAM is a global AWS service rather than a regional workload service.

## Core Components

- **User:** a long-lived identity for a person or workload. Human users should normally use federation instead of permanent access keys.
- **Group:** a collection of IAM users that receive common permissions. Roles cannot belong to groups.
- **Role:** an identity with permissions that is assumed temporarily by trusted users, services, or external identities.
- **Policy:** a JSON document containing statements with `Effect`, `Action`, `Resource`, and optional `Condition` elements.
- **Permission:** the result of policy evaluation that allows or denies an action on a resource.

An explicit deny overrides an allow. Without an applicable allow, access is denied by default.

## Least Privilege

Least privilege means granting only the actions and resources required for a task, for only as long as required. Start with narrow permissions, use access data to refine them, and remove unused access.

## Best Practices

- Protect the root user, enable MFA, and do not create root access keys.
- Use IAM Identity Center or federation for human access.
- Use temporary role credentials for applications and AWS services.
- Require MFA for privileged operations.
- Scope policies to specific actions and resources; avoid unrestricted `*` permissions.
- Rotate or remove unused credentials and review access regularly.
- Use separate accounts and permission boundaries or service control policies for guardrails.
- Monitor activity with CloudTrail and use Access Analyzer to identify unintended access.
- Never store access keys in Git repositories or container images.

## Common Use Cases

- Let an EC2 instance read one S3 bucket through an instance role.
- Give a CI workflow temporary deployment access through OIDC federation.
- Give developers read-only access while administrators manage infrastructure.
- Permit one AWS account to assume a controlled cross-account role.
- Attach a service role to Lambda, ECS, or EKS workloads.

## Example Least-Privilege Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::example-bucket/app/*"]
    }
  ]
}
```

This policy allows object reads only under the `app/` prefix; it does not permit bucket deletion or object writes.

## References

- [What is IAM?](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
- [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
