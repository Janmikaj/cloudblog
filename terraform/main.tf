provider "aws" {
  region = var.aws_region
}

# -----------------------
# Security Group
# -----------------------
resource "aws_security_group" "app_sg" {
  name_prefix = "devsecops-app-sg-"
  description = "Allow SSH, HTTP, Backend"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # demo only
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5000
    to_port     = 5000
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

# -----------------------
# IAM Role for CloudWatch
# -----------------------
resource "aws_iam_role" "cloudwatch_role" {
  name = "EC2CloudWatchRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cloudwatch_attach" {
  role       = aws_iam_role.cloudwatch_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_instance_profile" "cloudwatch_profile" {
  name = "EC2CloudWatchProfile"
  role = aws_iam_role.cloudwatch_role.name
}

# -----------------------
# EC2 Instances (Blue & Green)
# -----------------------
resource "aws_instance" "blue" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = var.subnet_ids[0]
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.cloudwatch_profile.name

  tags = { Name = "App-Blue" }
}

resource "aws_instance" "green" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = var.subnet_ids[1]
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.cloudwatch_profile.name

  tags = { Name = "App-Green" }
}

# -----------------------
# ALB
# -----------------------
resource "aws_lb" "app_alb" {
  name               = "app-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.app_sg.id]
  subnets            = var.subnet_ids
}

# -----------------------
# Target Groups
# -----------------------
resource "aws_lb_target_group" "blue_tg" {
  name     = "blue-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path = "/"
  }
}

resource "aws_lb_target_group" "green_tg" {
  name     = "green-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path = "/"
  }
}

resource "aws_lb_target_group" "backend_tg" {
  name     = "backend-tg"
  port     = 5000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path = "/api/blogs"
    port = "5000"
  }
}

# -----------------------
# Listener (HTTP only)
# -----------------------
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.blue_tg.arn
  }
}

# API routing
resource "aws_lb_listener_rule" "api_routing" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_tg.arn
  }

  condition {
    path_pattern {
      values = ["/api*"]
    }
  }
}

# -----------------------
# Attachments
# -----------------------
resource "aws_lb_target_group_attachment" "blue_attach" {
  target_group_arn = aws_lb_target_group.blue_tg.arn
  target_id        = aws_instance.blue.id
  port             = 80
}

resource "aws_lb_target_group_attachment" "green_attach" {
  target_group_arn = aws_lb_target_group.green_tg.arn
  target_id        = aws_instance.green.id
  port             = 80
}

# backend on BOTH
resource "aws_lb_target_group_attachment" "backend_blue" {
  target_group_arn = aws_lb_target_group.backend_tg.arn
  target_id        = aws_instance.blue.id
  port             = 5000
}

resource "aws_lb_target_group_attachment" "backend_green" {
  target_group_arn = aws_lb_target_group.backend_tg.arn
  target_id        = aws_instance.green.id
  port             = 5000
}

# -----------------------
# CloudWatch
# -----------------------
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/ec2/devsecops-blog"
  retention_in_days = 7
}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "DevSecOps-Dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "InstanceId", aws_instance.blue.id],
            ["AWS/EC2", "CPUUtilization", "InstanceId", aws_instance.green.id]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "CPU Usage"
        }
      }
    ]
  })
}

# -----------------------
# Outputs (MANDATORY)
# -----------------------
output "blue_public_ip" {
  value = aws_instance.blue.public_ip
}

output "green_public_ip" {
  value = aws_instance.green.public_ip
}

output "blue_target_group_arn" {
  value = aws_lb_target_group.blue_tg.arn
}

output "green_target_group_arn" {
  value = aws_lb_target_group.green_tg.arn
}

output "listener_arn" {
  value = aws_lb_listener.http.arn
}