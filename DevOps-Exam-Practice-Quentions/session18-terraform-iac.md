# Session 18 — Terraform IaC: Practice Questions and Lab Tasks

## MCQs with answers

1. **Terraform is used for?** Provisioning/managing infrastructure as code.
2. **Initialize providers/backend?** `terraform init`.
3. **Preview changes?** `terraform plan`.
4. **Apply changes?** `terraform apply`.
5. **What does state track?** Mapping between configuration and managed resources.
6. **What is a provider?** Plugin for an API/platform.
7. **What is a module?** Reusable Terraform configuration group.
8. **Check configuration correctness?** `terraform validate`.
9. **What is a variable?** Configurable input.
10. **Why remote state and locking?** Safe shared state and fewer concurrent-update conflicts.

---

## Exam-style practical tasks

### Task 1 — Create a minimal AWS resource configuration

**Exam story:** Write Terraform that uses AWS in `ap-south-1` and creates an S3 bucket with a unique prefix.

`provider.tf`:

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

`main.tf`:

```hcl
resource "aws_s3_bucket" "demo" {
  bucket_prefix = "session18-demo-"
}
```

```bash
# Confirm which AWS identity/account would be used.
aws sts get-caller-identity

# Format, initialize, validate, and preview; none of first three creates a bucket.
terraform fmt
terraform init
terraform validate
terraform plan
```

**Answer:** A provider connects Terraform to AWS; `aws_s3_bucket.demo` is the Terraform resource address. `plan` previews without creating anything.

### Task 2 — Use variables and outputs

**Exam story:** Make the S3 prefix depend on project and environment, then display the created bucket name after apply.

`variables.tf`:

```hcl
variable "project_name" { type = string }
variable "environment"  { type = string }
```

`main.tf`:

```hcl
resource "aws_s3_bucket" "demo" {
  bucket_prefix = "${var.project_name}-${var.environment}-"
}
```

`terraform.tfvars`:

```hcl
project_name = "revision-tracker"
environment  = "dev"
```

`outputs.tf`:

```hcl
output "bucket_name" {
  value = aws_s3_bucket.demo.bucket
}
```

```bash
# Preview/apply using the variable file, then display one useful output.
terraform plan -out=tfplan
terraform apply tfplan
terraform output -raw bucket_name
```

### Task 3 — Inspect a change before applying it

**Exam story:** The environment tag changes from `dev` to `test`. Show how you inspect exactly what Terraform will do before changing AWS.

```bash
# Format configuration after editing it.
terraform fmt

# Preview the exact create/update/replace/destroy actions.
terraform plan

# Apply only after reviewing the plan and receiving permission.
terraform apply
```

**Answer:** Terraform compares desired configuration, state, and provider information. `~` means update; `-/+` means replacement.

### Task 4 — Inspect Terraform state

**Exam story:** Show that Terraform knows which AWS resource is managed by the `aws_s3_bucket.demo` block.

```bash
# List all managed Terraform addresses.
terraform state list

# Show one resource's state mapping/details.
terraform state show aws_s3_bucket.demo

# Show the overall state/infrastructure view.
terraform show
```

**Answer:** State maps the configuration address to the real cloud resource. Do not manually edit or commit `terraform.tfstate`.

### Task 5 — Safely remove lab infrastructure

**Exam story:** The temporary S3 lab is complete. Show the safe deletion workflow.

```bash
# Preview exactly which managed resources would be deleted.
terraform plan -destroy

# Delete only after reviewing targets and obtaining authorization.
terraform destroy

# Verify the current state no longer contains managed resources.
terraform state list
```

**Answer:** `terraform destroy` removes real managed resources. `terraform plan -destroy` must be reviewed first because deletion can cause data loss/cost changes.

### Task 6 — Protect Terraform project files

**Exam story:** Prevent local provider files, state, saved plans, and sensitive variable values from being committed.

Create/update `.gitignore`:

```gitignore
.terraform/
terraform.tfstate
terraform.tfstate.*
*.tfplan
terraform.tfvars
```

**Answer:** State and tfvars can contain sensitive infrastructure data. In a team, use a remote backend with locking rather than committing local state.
