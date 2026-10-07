# 03. Amazon S3 — Storage

## What is S3?

Amazon Simple Storage Service (S3) is object storage. Data is stored as objects inside buckets and accessed through APIs, SDKs, the AWS CLI, or supported integrations.

## Core Concepts

- **Bucket:** the top-level container for objects. A general-purpose bucket name must be globally unique.
- **Object:** data plus metadata identified by a key within a bucket.
- **Key:** the full object name, which can use `/` characters to imitate folders.
- **Version ID:** an identifier assigned to an object version when versioning is enabled.

## Storage Classes

- **S3 Standard:** frequently accessed data.
- **S3 Intelligent-Tiering:** moves data between access tiers based on usage patterns.
- **S3 Standard-IA:** infrequently accessed data that still needs rapid retrieval.
- **S3 One Zone-IA:** infrequent data stored in one Availability Zone; suitable only when it can be recreated.
- **S3 Glacier classes:** archive storage with different retrieval time and cost trade-offs.

## Versioning and Lifecycle

Versioning retains multiple versions of an object and helps recover from accidental overwrite or deletion. Lifecycle rules can transition objects to cheaper storage classes or expire current versions, noncurrent versions, and incomplete multipart uploads.

## Encryption

S3 encrypts new uploads at rest by default. Depending on requirements, use S3-managed keys, AWS KMS keys, dual-layer KMS encryption, or client-side encryption. TLS protects data in transit. KMS policies and permissions must be designed alongside bucket access.

## Bucket Policies

A bucket policy is a resource-based JSON policy. It can grant cross-account access, require TLS, restrict access to a VPC endpoint, or deny uploads that do not meet encryption rules. S3 Block Public Access should remain enabled unless public access is deliberately required.

## Common Use Cases

- Backups and archives.
- Static website assets.
- Data lakes and analytics input.
- Application uploads and generated reports.
- Log storage.
- Software packages and CI/CD artifacts.

## Operational Practices

- Enable versioning for important data.
- Use lifecycle rules to control cost and retention.
- Enable appropriate access logging and CloudTrail data events.
- Use least-privilege IAM and bucket policies.
- Test recovery and deletion protections for critical buckets.

## References

- [What is Amazon S3?](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)
- [S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)
- [S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html)
