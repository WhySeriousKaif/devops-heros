# 04. Amazon VPC — Networking

## What is a VPC?

Amazon Virtual Private Cloud (VPC) is a logically isolated network in an AWS Region. It provides control over IP address ranges, subnets, routing, gateways, and network security.

## Components

- **CIDR:** the IP address range assigned to a VPC or subnet, for example `10.20.0.0/16`.
- **Subnet:** a range inside the VPC that belongs to exactly one Availability Zone.
- **Route table:** rules that decide where subnet traffic is sent.
- **Internet Gateway (IGW):** a horizontally scaled gateway attached to a VPC for internet communication.
- **NAT Gateway:** lets supported resources in a private subnet initiate outbound connections without accepting unsolicited inbound internet connections.
- **Security group:** a stateful, resource-level allow-list firewall.
- **Network ACL:** a stateless subnet-level control with ordered allow and deny rules.

## Public and Private Subnets

A subnet is public when its route table has a route to an Internet Gateway. An instance also needs a public IP address and security rules that allow the traffic before it is reachable from the internet.

A private subnet has no direct route to an Internet Gateway. It can use a NAT gateway in a public subnet for outbound IPv4 internet access. VPC endpoints can provide private access to supported AWS services without traversing the public internet.

## Example Architecture

```text
Internet
   |
Internet Gateway
   |
Public route table
   |
Public subnet: load balancer / NAT gateway
   |
Private route table
   |
Private subnet: application / database
```

## Security Group vs Network ACL

| Property | Security group | Network ACL |
|---|---|---|
| Scope | Network interface/resource | Subnet |
| State | Stateful | Stateless |
| Rules | Allow only | Allow and deny |
| Evaluation | All applicable rules | Ordered rule numbers |
| Return traffic | Automatically allowed | Must be explicitly allowed |

## Good Practices

- Plan non-overlapping CIDR ranges before connecting networks.
- Use multiple Availability Zones for resilient production systems.
- Keep databases and internal services in private subnets.
- Restrict inbound rules to required ports and sources.
- Use flow logs and centralized monitoring for investigation.
- Prefer VPC endpoints for private AWS service access where appropriate.

## References

- [Subnets for your VPC](https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html)
- [Compare security groups and network ACLs](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html#VPC_Security_Comparison)
