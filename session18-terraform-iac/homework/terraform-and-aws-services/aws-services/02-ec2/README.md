# 02. Amazon EC2 — Compute

## What is EC2?

Amazon Elastic Compute Cloud (EC2) provides resizable virtual machines called instances. Users choose an operating-system image, hardware profile, network placement, storage, and security controls.

## Core Concepts

- **AMI:** a versioned template containing an operating system and optional software used to launch instances.
- **Instance type:** a CPU, memory, network, accelerator, and storage capacity combination. Families are optimized for general, compute, memory, storage, or accelerated workloads.
- **Key pair:** public-key credentials used for SSH or supported Windows access. Systems Manager Session Manager can reduce direct SSH exposure.
- **Security group:** a stateful virtual firewall attached to network interfaces. It contains allow rules, not explicit deny rules.
- **EBS:** persistent block storage attached to an instance. Volumes can be encrypted, snapshotted, resized, and retained independently of an instance.

## Public and Private IP Addresses

A private IPv4 address is used inside the VPC. A public IPv4 address enables internet communication when routing, gateway, and security rules also allow it. Public addresses can change after stop/start unless an Elastic IP is used. Private instances commonly reach the internet through a NAT gateway without accepting unsolicited inbound internet traffic.

## Instance Lifecycle

```text
pending -> running -> stopping -> stopped -> pending
                    \
                     -> shutting-down -> terminated
```

- **Reboot:** restarts the operating system while retaining placement and addresses.
- **Stop/start:** releases the host; EBS volumes persist, but an auto-assigned public IPv4 address may change.
- **Terminate:** deletes the instance; EBS deletion depends on each volume's delete-on-termination setting.
- **Hibernate:** saves memory to the root EBS volume for supported configurations.

## Security Practices

- Use an IAM role instead of placing credentials on the instance.
- Permit only required ports and source ranges in security groups.
- Use private subnets and Session Manager where possible.
- Patch AMIs and instances, encrypt EBS volumes, and take tested backups.
- Use Auto Scaling and load balancing rather than treating one instance as permanent.

## Common Use Cases

- Web and application servers.
- CI runners and build workers.
- Batch processing and scheduled jobs.
- Development or test environments.
- Legacy software requiring operating-system control.
- Compute-intensive, memory-intensive, or GPU workloads.

## References

- [What is Amazon EC2?](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/)
- [Amazon EC2 instance lifecycle](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html)
