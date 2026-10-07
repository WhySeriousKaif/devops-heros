# Session 19 Terraform Infrastructure

This directory contains the deployable Terraform configuration for the Session 19 AWS infrastructure project. The parent [homework README](../README.md) contains the architecture, complete execution workflow, screenshot points, verification commands, and cleanup instructions.

## Resources

- One VPC and public subnet.
- One Internet Gateway, public route table, and association.
- One security group allowing HTTP on port 80.
- One Amazon Linux EC2 instance running Apache.
- One Amazon S3 bucket.

## Basic Workflow

```bash
terraform init
terraform fmt
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
terraform output
terraform state list
terraform destroy -auto-approve
```

Always destroy the resources during the same lab session to control costs.
