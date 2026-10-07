# Session 18: Terraform and Infrastructure as Code

> **Status:** Complete — the S3 resource was created, verified, documented, and destroyed successfully.

## Student Information

- **Name:** MD Kaif Molla
- **Enrollment Number:** 24BCS10221
- **Repository:** [WhySeriousKaif/devops-heros](https://github.com/WhySeriousKaif/devops-heros)

## Project Overview

This homework demonstrates Infrastructure as Code by provisioning an Amazon S3 bucket with Terraform. It also documents the core AWS services IAM, EC2, S3, VPC, DynamoDB, and RDS.

## Architecture

```text
Terraform configuration
        |
        v
AWS provider (ap-south-1)
        |
        v
Amazon S3 bucket
        |
        +--> bucket name output
        +--> bucket ARN output
        `--> bucket Region output
```

## Deliverable Structure

```text
session18-terraform-iac/
├── terraform-s3-demo/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── provider.tf
│   ├── terraform.tfvars
│   └── README.md
└── homework/terraform-and-aws-services/
    ├── README.md
    ├── aws-services/
    │   ├── 01-iam/README.md
    │   ├── 02-ec2/README.md
    │   ├── 03-s3/README.md
    │   ├── 04-vpc/README.md
    │   └── 05-dynamodb-rds/README.md
    └── screenshots/
        ├── png1.png
        ├── png2.png
        ├── png3.png
        ├── png4.png
        └── png5.png
```

## Prerequisites

- Terraform installed.
- AWS CLI installed and authenticated.
- Permission to create, inspect, and delete the demonstration S3 bucket.

On macOS, install Terraform if the command is unavailable:

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

Check the tools and authenticated identity:

```bash
terraform version
aws --version
aws sts get-caller-identity
```

Do not continue if the displayed AWS account or identity is not the account you intend to use. Never commit AWS credentials or Terraform state.

## Commands and Screenshot Guide

### Screenshot 1 — Initialize, Format, and Validate

```bash
cd /Users/mdkaif/devops-heros/session18-terraform-iac/terraform-s3-demo

terraform init
terraform fmt
terraform validate
```

Capture the successful initialization and `Success! The configuration is valid.` Save it as `screenshots/png1.png`.

### Screenshot 2 — Terraform Plan

```bash
terraform plan -out=tfplan
```

Review the plan before continuing. It should create `aws_s3_bucket.demo`. Capture the plan summary and save it as `screenshots/png2.png`.

### Screenshot 3 — Apply and Verify S3

```bash
terraform apply tfplan
aws s3api head-bucket --bucket "$(terraform output -raw bucket_name)"
aws s3api get-bucket-location --bucket "$(terraform output -raw bucket_name)"
```

Capture `Apply complete!` and successful AWS CLI verification. Save it as `screenshots/png3.png`.

### Screenshot 4 — Show State and Outputs

```bash
terraform show
terraform state list
terraform output
```

Capture the S3 resource, `aws_s3_bucket.demo`, and the bucket outputs. Save it as `screenshots/png4.png`.

### Screenshot 5 — Destroy

```bash
terraform plan -destroy
terraform destroy
```

Enter `yes` when prompted. Capture `Destroy complete! Resources: 1 destroyed.` and save it as `screenshots/png5.png`.

## Terraform Concepts Demonstrated

- **Provider:** connects Terraform to AWS.
- **Variables:** make the Region and bucket name configurable.
- **Resource:** declares the desired S3 bucket.
- **Outputs:** expose the bucket name, ARN, and Region.
- **Plan:** previews infrastructure changes before execution.
- **Apply:** reconciles AWS infrastructure with the configuration.
- **State:** records the relationship between configuration and the deployed resource.
- **Destroy:** removes resources managed by the configuration.

The working project and its detailed instructions are in [`terraform-s3-demo`](../../terraform-s3-demo/README.md).

## AWS Services Research

- [01. IAM — Governance](aws-services/01-iam/README.md)
- [02. EC2 — Compute](aws-services/02-ec2/README.md)
- [03. S3 — Storage](aws-services/03-s3/README.md)
- [04. VPC — Networking](aws-services/04-vpc/README.md)
- [05. DynamoDB and RDS — Databases](aws-services/05-dynamodb-rds/README.md)

## Screenshots

### Initialization, Formatting, and Validation

![Terraform initialization and validation](screenshots/png1.png)

### Terraform Plan

![Terraform plan](screenshots/png2.png)

### Terraform Apply and S3 Verification

![Terraform apply and S3 verification](screenshots/png3.png)

### Terraform State and Outputs

![Terraform state and outputs](screenshots/png4.png)

### Terraform Destroy

![Terraform destroy](screenshots/png5.png)

## Checklist

- [x] Terraform provider, variables, resource, and outputs
- [x] Required Terraform project files
- [x] Separate IAM, EC2, S3, VPC, DynamoDB, and RDS documentation
- [x] Successful Terraform command screenshots
- [x] S3 bucket created and destroyed in the selected AWS account

## Push the Completed Work

After adding all five screenshots:

```bash
cd /Users/mdkaif/devops-heros
git add session18-terraform-iac
git commit -m "complete Session 18 Terraform and AWS homework"
git push origin main
```

---

*Maintained by MD Kaif Molla (24BCS10221) — DevOps Homework Submission*
