variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-south-1"
}

variable "vpc_id" {
  description = "VPC ID where resources will be deployed"
  type        = string
  default     = "vpc-04515fb27257f6b5a"
}

variable "subnet_ids" {
  description = "List of subnet IDs for the ALB"
  type        = list(string)
  default     = ["subnet-055de66a9e97becf8", "subnet-00152360940907a7f"]
}

variable "ami_id" {
  description = "AMI ID for EC2 instances (Amazon Linux 2 preferred)"
  type        = string
  default     = "ami-007e51e00fe1e2173"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Name of the SSH key pair"
  type        = string
  default     = "devsecops_key_v2"
}
