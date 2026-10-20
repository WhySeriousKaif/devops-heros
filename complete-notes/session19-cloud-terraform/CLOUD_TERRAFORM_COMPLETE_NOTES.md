# Session 19 — Cloud and Terraform Complete Notes

Session 19 combines cloud fundamentals, networking, security, and Terraform. The main goal is to understand how Terraform can create a small AWS environment safely and repeatably.

```text
Terraform → AWS provider → VPC + subnet + route + security group + EC2/S3
```

---

## 1. Cloud computing and service models

Cloud computing means renting computing resources from a provider instead of purchasing and operating all hardware yourself.

Common providers: AWS, Microsoft Azure, Google Cloud.

### IaaS, PaaS, SaaS

| Model | You mainly manage | Provider mainly manages | Examples |
|---|---|---|---|
| IaaS | Application, runtime, OS, configuration | Virtual compute, storage, networking | EC2, EBS, VPC |
| PaaS | Application/code | Runtime, OS, servers, infrastructure | Elastic Beanstalk, Azure App Service |
| SaaS | Usage and data | Almost everything else | Gmail, Google Docs, Slack |

Memory rule:

```text
IaaS = most control, most responsibility
PaaS = focus mainly on application
SaaS = use finished software
```

---

## 2. AWS Region and Availability Zone

| Term | Meaning |
|---|---|
| Region | Geographic AWS area, such as `ap-south-1` (Mumbai). |
| Availability Zone (AZ) | Isolated infrastructure location inside a Region. |

```text
AWS Region: ap-south-1
   ├── AZ: ap-south-1a
   ├── AZ: ap-south-1b
   └── AZ: ap-south-1c
```

Key facts:

- One Region contains multiple AZs.
- A VPC is a **regional** resource.
- A subnet belongs to **one AZ**.
- Placing application capacity in more than one AZ improves fault isolation/high availability.

```bash
# Show the default AWS CLI region.
aws configure get region

# Confirm the active AWS account before creating resources.
aws sts get-caller-identity
```

---

## 3. VPC and CIDR

**VPC** means Virtual Private Cloud: your logically isolated network inside AWS.

Example network design:

```text
VPC: 10.20.0.0/16
  ├── Public subnet:  10.20.1.0/24
  └── Private subnet: 10.20.2.0/24
```

`/16` is a larger range; `/24` is a smaller range inside it.

```text
VPC = the whole private cloud network
Subnet = a smaller IP range within that VPC
```

Terraform VPC example:

```hcl
resource "aws_vpc" "main" {
  cidr_block = "10.20.0.0/16"

  tags = {
    Name = "session19-vpc"
  }
}
```

---

## 4. Public and private subnets

A subnet is generally called **public** when its associated route table sends internet-bound traffic to an Internet Gateway (IGW). A workload also usually needs an appropriate public IP and security-group rule to be reachable from the internet.

```text
Internet
   ↓
Internet Gateway
   ↓
Route table: 0.0.0.0/0 → IGW
   ↓
Public subnet
   ↓
Web server with public IP + allowed security-group rule
```

A private subnet has no direct route to an IGW. Databases commonly belong there.

Terraform subnet example:

```hcl
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.20.1.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = true
}
```

`map_public_ip_on_launch = true` assigns public IPv4 addresses automatically to supported instances launched into this subnet. It does not by itself create the internet route or open the firewall.

---

## 5. Internet Gateway and route table

### Internet Gateway (IGW)

An IGW connects a VPC to the public internet.

```hcl
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}
```

### Route table

A route table decides **where traffic goes**.

```hcl
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}
```

`0.0.0.0/0` means any IPv4 destination. The route says, “traffic headed anywhere outside known local routes should go through the IGW.”

Associate route table with a subnet:

```hcl
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
```

### Essential exam distinction

```text
Route table = WHERE traffic should go
Security group = WHETHER traffic is allowed
```

Creating only an IGW does **not** make a subnet public. The subnet needs a route-table association with `0.0.0.0/0 → IGW`.

---

## 6. Security groups

A security group is a virtual firewall for AWS resources such as EC2.

| Rule direction | Meaning |
|---|---|
| Ingress | Incoming traffic allowed to the resource. |
| Egress | Outgoing traffic allowed from the resource. |

Web security group example:

```hcl
resource "aws_security_group" "web" {
  name   = "session19-web"
  vpc_id = aws_vpc.main.id

  ingress {
    description = "HTTP from internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow outbound IPv4"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

Important:

- `0.0.0.0/0` on HTTP/HTTPS may be appropriate for a public website.
- `0.0.0.0/0` on SSH port `22` exposes administration access to the entire internet and is risky.
- Restrict SSH to a trusted IP/range or use a safer access method.
- Security groups are **stateful**: allowed response traffic returns automatically as part of an allowed connection.

---

## 7. EC2 and a public web application

**EC2** is AWS virtual-machine compute, an IaaS service.

For a basic public web server, all of these must be correct:

```text
1. EC2 instance in the intended subnet
2. Public subnet has route 0.0.0.0/0 → IGW
3. Instance has public IP/EIP
4. Security group allows required web port, such as TCP 80
5. Web server/application is installed and listening on that port
```

If a browser cannot reach the server, troubleshoot in this order: instance state → public IP → route table/IGW → security group → application/service logs.

Terraform dependency example:

```hcl
resource "aws_instance" "web" {
  ami                    = var.ami_id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]

  # Use only when a dependency is not already inferred from references.
  depends_on = [aws_route_table_association.public]
}
```

Terraform automatically infers many dependencies from references such as `aws_subnet.public.id`. `depends_on` is used only when a necessary dependency is not visible through normal argument references.

---

## 8. S3

**Amazon S3** is object storage. It stores objects such as files, backups, logs, static assets, and artifacts in buckets.

Terraform example:

```hcl
resource "aws_s3_bucket" "project" {
  bucket_prefix = "session19-project-"
}
```

Why `bucket_prefix` is useful in labs: S3 bucket names must be globally unique, so AWS/Terraform can create a unique suffix.

---

## 9. Terraform cloud-network workflow

Before any operation that can create cloud resources, confirm the AWS account and understand potential cost.

```bash
# Confirm active AWS identity/account.
aws sts get-caller-identity

# Format and initialize the project.
terraform fmt
terraform init

# Check configuration correctness.
terraform validate

# Review every intended cloud change without making changes.
terraform plan -out=tfplan

# Apply the reviewed, saved plan.
terraform apply tfplan

# Inspect created resource IDs and other outputs.
terraform output
terraform state list
```

Terraform plan summary example:

```text
Plan: 8 to add, 0 to change, 0 to destroy.
```

The number depends on the configuration. Treat `plan` as a required review point, not merely a command to skip.

---

## 10. Verify AWS infrastructure

Use Terraform outputs instead of copying IDs manually.

```bash
# Store output values in shell variables for read-only verification.
VPC_ID="$(terraform output -raw vpc_id)"
SUBNET_ID="$(terraform output -raw public_subnet_id)"
SG_ID="$(terraform output -raw security_group_id)"
INSTANCE_ID="$(terraform output -raw ec2_instance_id)"

# Verify real AWS resources through AWS CLI.
aws ec2 describe-vpcs --vpc-ids "$VPC_ID"
aws ec2 describe-subnets --subnet-ids "$SUBNET_ID"
aws ec2 describe-security-groups --group-ids "$SG_ID"
aws ec2 describe-instances --instance-ids "$INSTANCE_ID"
```

If an app URL is an output:

```bash
# Retrieve the URL Terraform calculated, then test it.
APP_URL="$(terraform output -raw application_url)"
curl --fail "$APP_URL"
```

---

## 11. State, remote state, and security

Terraform state maps resource addresses to real IDs and attributes.

```bash
# List the managed Terraform resources.
terraform state list

# Show details for a specific resource.
terraform state show aws_instance.web

# Show the full managed-state view.
terraform show
```

Do not commit:

```gitignore
.terraform/
terraform.tfstate
terraform.tfstate.*
terraform.tfvars
*.tfplan
```

For a team, use an encrypted remote state backend, locking, and least-privilege access. State and saved plans can contain sensitive resource details.

---

## 12. Cleanup and cost control

This session can create billable resources. Clean them up after the lab when you no longer need them.

```bash
# Review exactly what Terraform would delete.
terraform plan -destroy

# Destroy only after you verify the targets.
terraform destroy

# Check that no resources remain in Terraform state.
terraform state list
```

Never use `destroy` casually in a shared or production environment. In an exam/lab sandbox, it demonstrates complete resource lifecycle management.

---

## 13. Practice MCQs with answers

1. **What does IaaS provide?** Virtualized infrastructure, such as compute and networks.
2. **What does PaaS provide?** Managed platform for deploying applications.
3. **What does SaaS provide?** Ready-to-use software over a network.
4. **What is a Region?** Geographic cloud area containing infrastructure.
5. **What is an AZ?** Isolated infrastructure location within a Region.
6. **What is a VPC?** Logically isolated virtual network.
7. **What is a subnet?** IP address range within a network.
8. **What does a route table define?** Where traffic should be forwarded.
9. **What does a security group control?** Allowed inbound/outbound network traffic.
10. **Why Terraform + cloud?** Reproducible, versioned infrastructure provisioning.

---

## 14. Last-minute exam sheet

```text
IaaS = virtual infrastructure (EC2, VPC)
PaaS = managed application platform
SaaS = ready-to-use software

Region = geographic area
AZ     = isolated location within a Region
VPC    = private cloud network
Subnet = smaller CIDR range in a VPC; belongs to one AZ
IGW    = VPC connection to internet
Route table = WHERE traffic goes
Security group = WHICH traffic is allowed
Public subnet = route to IGW (plus public IP and SG needed for public app)

0.0.0.0/0 = any IPv4 destination
TCP 80    = HTTP
TCP 443   = HTTPS
TCP 22    = SSH; do not expose it to 0.0.0.0/0

Terraform workflow = fmt → init → validate → plan → apply → verify → destroy
```

### One-line memory rule

**A public AWS web server needs the right network path (VPC, subnet, IGW, route), the right permission (security group), and a running application; Terraform creates this architecture reproducibly from code.**
