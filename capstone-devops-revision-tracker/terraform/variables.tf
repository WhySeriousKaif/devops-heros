variable "aws_region" {
  description = "AWS region used for the VPC and EKS cluster"
  type        = string
  default     = "ap-south-1"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "revision-tracker-eks"
}

variable "environment" {
  description = "Environment tag applied to AWS resources"
  type        = string
  default     = "dev"
}

