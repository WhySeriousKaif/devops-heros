# Session 19: Cloud and Terraform in Action — Homework

> **Status:** Work in progress — provision the resources, capture evidence, and destroy the lab infrastructure before submission.

## Student Information

- **Name:** MD Kaif Molla
- **Enrollment Number:** 24BCS10221
- **Repository:** [WhySeriousKaif/devops-heros](https://github.com/WhySeriousKaif/devops-heros)

## Project Overview

This project uses Terraform to provision an end-to-end AWS environment containing a VPC, public subnet, routing, security group, EC2 instance, and S3 bucket. It demonstrates providers, variables, resources, outputs, implicit dependencies, state, and the complete Terraform lifecycle.

The starter implementation is in [`08-mini-project`](../../08-mini-project/). Complete its optional EC2 extension and add an S3 resource before capturing the final evidence.

## Architecture

```text
                              AWS Region
                                  |
              +-------------------+-------------------+
              |                                       |
              v                                       v
       VPC 10.20.0.0/16                         S3 Bucket
              |
       Internet Gateway
              |
       Public Route Table
              |
       Public Subnet
        10.20.1.0/24
              |
       Security Group
        HTTP + limited SSH
              |
         EC2 Instance
```

## Terraform Dependency Flow

```text
aws_vpc.main
  ├── aws_internet_gateway.main
  ├── aws_subnet.public
  │     ├── aws_route_table_association.public
  │     └── aws_instance.web
  ├── aws_route_table.public
  │     └── aws_route_table_association.public
  └── aws_security_group.web
        └── aws_instance.web

aws_s3_bucket.project
```

References such as `subnet_id = aws_subnet.public.id` create implicit dependencies. Use `depends_on` only when Terraform cannot infer a required ordering from resource references.

## Submission Structure

```text
cloud-terraform-project/
├── README.md
└── screenshots/
    ├── png1.png   # fmt and validate
    ├── png2.png   # plan summary
    ├── png3.png   # apply and outputs
    ├── png4.png   # AWS VPC, subnet, SG, and EC2 evidence
    ├── png5.png   # S3 evidence and application response
    ├── png6.png   # terraform state/show
    └── png7.png   # destroy completion
```

## Suggested Terraform Files

```text
terraform/
├── versions.tf
├── provider.tf
├── variables.tf
├── terraform.tfvars.example
├── main.tf
├── outputs.tf
└── .gitignore
```

Recommended inputs:

- AWS Region and Availability Zone.
- VPC and subnet CIDRs.
- Project name and common tags.
- EC2 instance type.
- AMI selection strategy.
- Allowed administration CIDR.
- Globally unique S3 bucket name.

Recommended outputs:

- VPC ID.
- Public subnet ID.
- Security group ID.
- EC2 instance ID and public address.
- S3 bucket name and ARN.

## Prerequisites and Cost Safety

```bash
terraform version
aws --version
aws sts get-caller-identity
```

Review current AWS pricing before applying. Restrict SSH to your own address or use Systems Manager. Never commit private keys, AWS credentials, state files, or real secrets.

## Terraform Workflow

```bash
cd session19-cloud-terraform/08-mini-project
cp terraform.tfvars.example terraform.tfvars

terraform init
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
terraform output
terraform state list
terraform show
```

The expected plan must be reviewed before approval. Resource counts can vary after the EC2 and S3 extensions, so capture the real plan rather than writing a fixed count in advance.

## AWS Verification

```bash
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=session19-*"
aws ec2 describe-subnets --filters "Name=vpc-id,Values=<vpc-id>"
aws ec2 describe-security-groups --filters "Name=vpc-id,Values=<vpc-id>"
aws ec2 describe-instances --instance-ids <instance-id>
aws s3api head-bucket --bucket <bucket-name>
```

If the EC2 instance serves a web page:

```bash
curl http://<ec2-public-ip>
```

## Terraform State

Local `terraform.tfstate` is suitable only for this individual lab and must not be committed. A team environment should use a protected remote backend with encryption, versioning, locking, and least-privilege access.

Inspect the dependency graph if Graphviz is installed:

```bash
terraform graph > graph.dot
dot -Tpng graph.dot -o terraform-graph.png
```

## Cleanup

```bash
terraform plan -destroy
terraform destroy
terraform state list
```

The final state list should be empty. Also verify in AWS that the EC2 instance is terminated and the S3 bucket and networking resources are gone.

## Screenshots

```markdown
![Format and validation](screenshots/png1.png)
![Terraform plan](screenshots/png2.png)
![Apply and outputs](screenshots/png3.png)
![AWS infrastructure](screenshots/png4.png)
![S3 and application](screenshots/png5.png)
![Terraform state](screenshots/png6.png)
![Destroy](screenshots/png7.png)
```

## Deliverables Checklist

- [ ] VPC, subnet, route, gateway, and security group are provisioned.
- [ ] EC2 instance launches in the intended subnet.
- [ ] S3 bucket is created with a unique name.
- [ ] Outputs expose useful identifiers.
- [ ] State and dependencies are demonstrated.
- [ ] Plan and apply evidence is captured.
- [ ] All lab resources are destroyed.
- [ ] Screenshots are added and embedded.

---

*Maintained by MD Kaif Molla (24BCS10221) — DevOps Homework Submission*
