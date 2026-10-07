# Terraform S3 Demo

This project creates one Amazon S3 bucket with Terraform and demonstrates the complete Terraform lifecycle.

## Project Structure

```text
terraform-s3-demo/
├── main.tf
├── variables.tf
├── outputs.tf
├── provider.tf
├── terraform.tfvars
├── terraform.tf
├── .terraform.lock.hcl
├── .gitignore
└── README.md
```

## Files

- `provider.tf` configures the AWS Region.
- `terraform.tf` defines the required Terraform and AWS provider versions.
- `variables.tf` declares the Region and globally unique bucket-name inputs.
- `terraform.tfvars` supplies the demonstration values and contains no credentials.
- `main.tf` creates the S3 bucket and its tags.
- `outputs.tf` prints the bucket name, ARN, and Region.

## Prerequisites

Install Terraform and AWS CLI, then configure an AWS identity that can manage an S3 bucket.

On macOS, install Terraform if required:

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

```bash
terraform version
aws --version
aws sts get-caller-identity
```

Never place AWS access keys in Terraform files or commit them to Git.

## Complete Workflow

Open the project:

```bash
cd /Users/mdkaif/devops-heros/session18-terraform-iac/terraform-s3-demo
```

Initialize, format, and validate:

```bash
terraform init
terraform fmt
terraform validate
```

Preview and save the execution plan:

```bash
terraform plan -out=tfplan
```

Create the bucket from the reviewed plan:

```bash
terraform apply tfplan
```

Inspect the deployed infrastructure and outputs:

```bash
terraform show
terraform state list
terraform state show aws_s3_bucket.demo
terraform output
terraform output bucket_name
```

Verify the bucket directly with AWS CLI:

```bash
aws s3api head-bucket --bucket "$(terraform output -raw bucket_name)"
aws s3api get-bucket-location --bucket "$(terraform output -raw bucket_name)"
```

Preview deletion and destroy the demonstration resource:

```bash
terraform plan -destroy
terraform destroy
```

Enter `yes` when Terraform asks for destroy approval. Successful cleanup ends with:

```text
Destroy complete! Resources: 1 destroyed.
```

## Terraform State

Terraform state connects `aws_s3_bucket.demo` in the configuration to the real AWS bucket. Local state and saved plans are ignored by Git because state can contain sensitive infrastructure data. Production teams normally use an encrypted remote backend with access control and state locking.

## Cleanup

Always run `terraform destroy` after the demonstration to avoid leaving resources in the AWS account. The bucket uses `force_destroy = true`, so Terraform can remove objects placed in this homework bucket during testing.
