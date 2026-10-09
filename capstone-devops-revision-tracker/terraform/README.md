# AWS infrastructure with Terraform

**Author:** MD Kaif Molla

This configuration creates the infrastructure required for the capstone:

- One VPC
- Two public subnets
- Two private subnets
- One NAT gateway
- One EKS cluster
- One managed worker node group with two Free Tier-eligible `t3.small` nodes

## Commands

```bash
terraform init
terraform fmt -recursive
terraform validate
terraform plan
terraform apply
```

Connect `kubectl` after the cluster is created:

```bash
aws eks update-kubeconfig --region ap-south-1 --name revision-tracker-eks
kubectl get nodes
```

Destroy the infrastructure after collecting the required evidence:

```bash
terraform destroy
```

## Cost warning

EKS worker nodes and the NAT gateway can create AWS charges. Never run `terraform apply` merely to test the syntax, and always run `terraform destroy` after evaluation.

Real AWS credentials, `terraform.tfvars`, state files, and `.terraform/` must never be committed.
