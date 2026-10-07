variable "aws_region" {
  type        = string
  description = "AWS Region used by the project."
  default     = "ap-south-1"
}

variable "project_name" {
  type        = string
  description = "Prefix used for resource names and tags."
  default     = "session19"
}

variable "vpc_cidr" {
  type        = string
  description = "IPv4 CIDR block for the VPC."
  default     = "10.20.0.0/16"
}

variable "public_subnet_cidr" {
  type        = string
  description = "IPv4 CIDR block for the public subnet."
  default     = "10.20.1.0/24"
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type for the demonstration web server."
  default     = "t3.micro"
}

variable "bucket_name" {
  type        = string
  description = "Globally unique S3 bucket name."

  validation {
    condition     = length(var.bucket_name) >= 3 && length(var.bucket_name) <= 63
    error_message = "The S3 bucket name must contain between 3 and 63 characters."
  }
}
