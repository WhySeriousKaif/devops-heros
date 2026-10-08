output "cluster_name" {
  description = "EKS cluster name used by kubectl configuration"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS Kubernetes API endpoint"
  value       = module.eks.cluster_endpoint
}

output "vpc_id" {
  description = "ID of the VPC created for the project"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs used by external load balancers"
  value       = module.vpc.public_subnets
}

