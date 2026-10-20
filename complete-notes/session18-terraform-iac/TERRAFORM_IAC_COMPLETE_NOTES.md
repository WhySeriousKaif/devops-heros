# Session 18 — Terraform and Infrastructure as Code Complete Notes

Terraform is an **Infrastructure as Code (IaC)** tool. Instead of creating cloud resources by clicking in a console, you describe the desired infrastructure in code and let Terraform create, update, or remove it through provider APIs.

```text
Terraform configuration → terraform plan → terraform apply → Cloud infrastructure
```

Terraform uses **HCL** (HashiCorp Configuration Language), usually in `.tf` files.

---

## 1. Why Infrastructure as Code?

| Manual cloud-console work | Infrastructure as Code |
|---|---|
| Click resources one by one | Describe resources in files |
| Easy for engineers to configure differently | Same reviewed configuration can be reused |
| Harder to reproduce an environment | Repeatable dev/test/prod environments |
| Changes may have no record | Changes can be reviewed through Git |
| Disaster recovery is manual | Reapply documented configuration |

Benefits:

- Repeatability
- Consistency
- Automation
- Version control and code review
- Easier environment recreation
- CI/CD integration

### Declarative idea

Terraform is **declarative**. You state what you want, not every API call needed to create it.

```hcl
# Desired result: an S3 bucket with this prefix and these tags.
resource "aws_s3_bucket" "demo" {
  bucket_prefix = "revision-demo-"

  tags = {
    Environment = "dev"
  }
}
```

Terraform decides whether it needs to create, update, replace, or remove resources to make reality match this desired state.

---

## 2. Terraform architecture and core terms

```text
main.tf (desired configuration)
        ↓
Terraform CLI
        ↓
Provider plugin
        ↓
Cloud/API: AWS, Azure, GCP, Kubernetes, GitHub, etc.

terraform.tfstate records Terraform's managed-resource mapping.
```

| Term | Meaning |
|---|---|
| Configuration | `.tf` files declaring desired infrastructure. |
| Provider | Plugin that lets Terraform communicate with an external API/platform. |
| Resource | A real managed infrastructure object, such as S3 bucket, EC2, VPC, or GitHub repository. |
| Data source | Reads existing external information without creating it. |
| Variable | Configurable input that makes code reusable. |
| Output | Useful value Terraform displays after apply. |
| State | Terraform's record mapping configuration addresses to real resources. |
| Module | Reusable group of Terraform configuration. |
| Backend | Where Terraform stores state, for example locally or remotely. |

---

## 3. Provider configuration and safe authentication

A provider is a plugin. AWS provider example:

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}
```

Important provider parts:

- `hashicorp/aws` — provider source address.
- `~> 6.0` — version constraint; it permits compatible 6.x versions, not a major version 7 upgrade.
- `region` — AWS region where regional resources are created.

Authenticate outside the Terraform code:

```bash
# Configure AWS CLI credentials locally when instructed and authorized.
aws configure

# Confirm the AWS identity/account before creating billable resources.
aws sts get-caller-identity
```

Never put access keys in a committed provider block:

```hcl
# Bad: this can leak credentials in Git history.
provider "aws" {
  access_key = "DO-NOT-PUT-REAL-KEYS-HERE"
  secret_key = "DO-NOT-PUT-REAL-SECRETS-HERE"
}
```

Use environment variables, an AWS profile, IAM role, or an approved secret system instead.

---

## 4. Resources and addresses

General resource syntax:

```hcl
resource "RESOURCE_TYPE" "LOCAL_NAME" {
  argument = value
}
```

Example:

```hcl
resource "aws_s3_bucket" "demo" {
  bucket_prefix = "session18-demo-"

  tags = {
    Name        = "Session 18 Demo"
    Environment = "dev"
    Owner       = "student"
  }
}
```

| Part | Meaning |
|---|---|
| `resource` | Terraform resource block keyword. |
| `aws_s3_bucket` | Resource type provided by AWS provider. |
| `demo` | Terraform local name; it need not be the AWS bucket's real name. |
| `bucket_prefix`, `tags` | Resource arguments/settings. |

Terraform resource address:

```text
aws_s3_bucket.demo
```

You use this address in state commands, for example:

```bash
# Show one managed resource from Terraform state.
terraform state show aws_s3_bucket.demo
```

---

## 5. Variables: make code reusable

Variables avoid hard-coding environment-specific values.

`variables.tf`:

```hcl
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Short project identifier"
  type        = string
}
```

Use variables in configuration:

```hcl
provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "demo" {
  bucket_prefix = "${var.project_name}-${var.environment}-"
}
```

`terraform.tfvars` example:

```hcl
aws_region   = "ap-south-1"
environment  = "dev"
project_name = "revision-tracker"
```

Run with a specific variable file if needed:

```bash
# Preview using values from dev.tfvars.
terraform plan -var-file=dev.tfvars
```

### Security rule

Do not commit sensitive `terraform.tfvars` values. Use a local ignored file or an approved secure CI/CD variable mechanism.

---

## 6. Outputs

Outputs expose values created or discovered by Terraform.

`outputs.tf`:

```hcl
output "bucket_name" {
  description = "Name of the created S3 bucket"
  value       = aws_s3_bucket.demo.bucket
}

output "bucket_arn" {
  description = "ARN of the created S3 bucket"
  value       = aws_s3_bucket.demo.arn
}
```

Read outputs:

```bash
# Show all declared outputs.
terraform output

# Show one output.
terraform output bucket_name

# Print one output without Terraform's display quotes; useful in scripts.
terraform output -raw bucket_name
```

Outputs are useful for users, modules, and automation. Example: pass an ALB DNS name or bucket name to a later step.

---

## 7. Main Terraform lifecycle commands

Use this safe order:

```text
fmt → init → validate → plan → apply → output/state inspection → destroy when finished
```

### `terraform fmt`

```bash
# Format Terraform files consistently in current folder and subfolders.
terraform fmt -recursive
```

It changes formatting only; it does not contact AWS or create infrastructure.

### `terraform init`

```bash
# Initialize working directory, backend, and provider plugins.
terraform init
```

Run after cloning a Terraform project, adding/changing a provider, or changing backend configuration. It is safe to run again.

### `terraform validate`

```bash
# Check configuration syntax and internal consistency.
terraform validate
```

Validation does not create infrastructure and does not replace a real plan.

### `terraform plan`

```bash
# Preview what Terraform would change; it does not create resources.
terraform plan
```

Plan symbols:

| Symbol | Meaning |
|---|---|
| `+` | Create |
| `~` | Update in place |
| `-` | Destroy |
| `-/+` | Replace: destroy and create a new resource |

### `terraform apply`

```bash
# Show plan, request confirmation, then create/update resources.
terraform apply
```

Terraform asks for `yes` before making real changes unless non-interactive options are intentionally used.

### Saved plan

```bash
# Save the reviewed plan to a file.
terraform plan -out=tfplan

# Apply exactly that saved plan.
terraform apply tfplan
```

This is useful in controlled CI/CD: review the exact plan before the apply stage.

---

## 8. State: Terraform's memory

Terraform state is usually stored locally as:

```text
terraform.tfstate
```

Terraform compares:

```text
Desired configuration + current state + real provider information → plan
```

State lets Terraform know that this configuration address:

```text
aws_s3_bucket.demo
```

maps to one real AWS bucket.

Inspect state safely:

```bash
# List addresses of resources Terraform manages.
terraform state list

# Show detailed state for one resource.
terraform state show aws_s3_bucket.demo

# Show the full managed infrastructure/state view.
terraform show

# Print raw state JSON. Treat it as sensitive.
terraform state pull
```

### State safety rules

```gitignore
.terraform/
terraform.tfstate
terraform.tfstate.*
*.tfplan
terraform.tfvars
```

- State can contain sensitive infrastructure values.
- Do not commit local state to Git.
- Do not manually edit a state file.
- Use Terraform commands for genuine state operations.

### Remote state and locking

For team work, use a remote backend so everyone reads the same state. Locking prevents two people/pipelines from updating the same state at the same time and causing conflict or corruption.

MCQ answer: a remote backend with locking lets teams **share state safely and reduce concurrent-update conflicts**.

---

## 9. Change, drift, and plan review

Suppose you change a tag in `main.tf`:

```hcl
tags = {
  Environment = "test"
}
```

Then run:

```bash
# See exactly whether Terraform will update, replace, or leave resources unchanged.
terraform plan
```

Never skip plan review for real infrastructure. A small configuration edit can sometimes force a replacement, which may mean downtime or data loss.

**Drift** means real infrastructure changed outside Terraform, such as someone changing a resource manually in the AWS console. Terraform detects/reconciles many differences during normal planning, but the correct response depends on whether the manual change should be kept or brought back to declared code.

---

## 10. Destroy: remove managed infrastructure safely

```bash
# Preview every Terraform-managed deletion first.
terraform plan -destroy

# After reviewing exact targets, request deletion of managed resources.
terraform destroy
```

`terraform destroy` deletes real infrastructure managed by the current configuration/state. It can incur data loss and must be used only when you intend the deletion.

After destroy:

```bash
# Confirm no resources remain in current Terraform state.
terraform state list
```

Expected output: no managed resource addresses.

---

## 11. Session 18 S3 demonstration workflow

From the Terraform project folder:

```bash
# Confirm which AWS account will be affected first.
aws sts get-caller-identity

# Standard safe Terraform workflow.
terraform init
terraform fmt
terraform validate
terraform plan -out=tfplan
terraform apply tfplan

# Inspect created resource mapping and useful values.
terraform show
terraform state list
terraform output

# Verify bucket with AWS CLI, using Terraform output instead of guessing name.
aws s3api head-bucket --bucket "$(terraform output -raw bucket_name)"
aws s3api get-bucket-location --bucket "$(terraform output -raw bucket_name)"
```

When finished and authorized to clean up:

```bash
# Preview deletions, then destroy only after reviewing the output.
terraform plan -destroy
terraform destroy
```

---

## 12. Terraform files commonly used

```text
provider.tf       = provider requirements and provider settings
main.tf           = resource declarations
variables.tf      = input variable declarations
terraform.tfvars  = variable values for one environment
outputs.tf        = useful values after apply
terraform.tfstate = local state; do not commit
```

Terraform reads all `.tf` files in the same folder as one configuration. The file names are for human organization, not an execution order.

---

## 13. Practice MCQs with answers

1. **Terraform is used for?** Provisioning and managing infrastructure as code.
2. **Which command initializes providers/backend?** `terraform init`.
3. **Which command previews changes?** `terraform plan`.
4. **Which command makes planned changes?** `terraform apply`.
5. **What does state track?** Mapping between configuration and managed resources.
6. **What is a provider?** Plugin for interacting with an API/platform.
7. **What is a module?** Reusable Terraform configuration group.
8. **Which command checks syntax/consistency?** `terraform validate`.
9. **What is a variable?** Input used to parameterize configuration.
10. **Why remote state + locking?** Share state safely and prevent concurrent update conflicts.

---

## 14. Last-minute exam sheet

```text
IaC         = infrastructure defined as code
Terraform   = declarative IaC tool
Provider    = API/platform plugin (AWS, Azure, Kubernetes)
Resource    = managed infrastructure object
Variable    = configurable input
Output      = useful displayed value
State       = mapping of Terraform addresses to real resources
Module      = reusable Terraform configuration

fmt         = format code
init        = initialize backend/providers
validate    = check config correctness
plan        = preview; no changes
apply       = create/update after approval
destroy     = delete managed infrastructure after approval
state list  = list managed resource addresses
```

### One-line memory rule

**Terraform reads desired HCL configuration, uses providers to compare state with real infrastructure, shows a plan, and applies only the reviewed changes.**
