# Session 19 — Cloud and Terraform: Practice Questions and Lab Tasks

## MCQs with answers

1. **IaaS provides?** Virtualized infrastructure such as compute and networks.
2. **PaaS provides?** Managed platform for deploying applications.
3. **SaaS provides?** Ready-to-use software over a network.
4. **Cloud Region?** Geographic area containing cloud infrastructure.
5. **Availability Zone?** Isolated location inside a Region.
6. **VPC?** Logically isolated virtual network.
7. **Subnet?** IP address range inside a network.
8. **Route table?** Defines where network traffic is forwarded.
9. **Security group?** Controls allowed inbound/outbound traffic.
10. **Terraform with cloud?** Reproducible, versioned infrastructure provisioning.

---

## Exam-style practical tasks

### Task 1 — Explain the public-web-server traffic path

**Exam story:** A web server is in a public AWS subnet. Explain how a browser reaches it and which components do different jobs.

**Write as your answer:**

```text
Internet → Internet Gateway → VPC route table → public subnet → EC2 security group → EC2 web server.

The route table decides WHERE traffic goes.
The security group decides WHETHER port 80/443 traffic is allowed.
The instance needs a public IP and a running service on the allowed port.
```

### Task 2 — Write Terraform for a VPC, public subnet, and internet route

```hcl
resource "aws_vpc" "main" {
  cidr_block = "10.20.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.20.1.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = true
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
```

**Answer:** `0.0.0.0/0 → IGW` gives the associated subnet a default route toward the internet.

### Task 3 — Allow only web traffic in a security group

**Exam story:** Create a web security group that allows public HTTP but does not expose SSH to all internet addresses.

```hcl
resource "aws_security_group" "web" {
  name   = "web-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    description = "Public HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

**Answer:** Port 80 can be public for a public website. Do not add port 22 from `0.0.0.0/0`; restrict SSH to a trusted source or use a safer access method.

### Task 4 — Provision and verify cloud resources safely

```bash
# Confirm account before creating potentially billable infrastructure.
aws sts get-caller-identity

# Standard Terraform safety workflow.
terraform fmt
terraform init
terraform validate
terraform plan -out=tfplan
terraform apply tfplan

# Inspect resources created by Terraform.
terraform output
terraform state list
```

**Answer:** `plan` is the approval/review point; it makes no cloud changes. `apply` creates the reviewed resources.

### Task 5 — Diagnose an unreachable EC2 web server

**Exam story:** EC2 is running but `curl http://PUBLIC_IP` fails. List the investigation order.

```text
1. Confirm the instance has a public IP and is running.
2. Confirm its subnet route table contains 0.0.0.0/0 → IGW.
3. Confirm the subnet is associated with that route table.
4. Confirm the security group allows inbound TCP 80.
5. Confirm the web service is installed and listening on port 80.
```

```bash
# Read-only checks using Terraform outputs and AWS CLI.
terraform output
aws ec2 describe-instances --instance-ids "$(terraform output -raw ec2_instance_id)"
aws ec2 describe-security-groups --group-ids "$(terraform output -raw security_group_id)"
```

### Task 6 — Clean up a cloud lab

```bash
# Review all deletions before cleanup.
terraform plan -destroy

# Delete lab resources only after reviewing and receiving approval.
terraform destroy

# Verify Terraform is no longer tracking resources.
terraform state list
```

**Answer:** Cleanup prevents unnecessary charges. Destroy is real deletion, so always review the destroy plan first.
