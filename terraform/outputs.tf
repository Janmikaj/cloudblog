output "blue_public_ip" {
  value       = aws_instance.blue.public_ip
  description = "Public IP of the Blue instance"
}

output "green_public_ip" {
  value       = aws_instance.green.public_ip
  description = "Public IP of the Green instance"
}

output "alb_dns_name" {
  value       = aws_lb.app_alb.dns_name
  description = "DNS name of the Load Balancer"
}

output "listener_arn" {
  value       = aws_lb_listener.http.arn
  description = "ARN of the ALB listener"
}

output "blue_target_group_arn" {
  value       = aws_lb_target_group.blue_tg.arn
  description = "ARN of the Blue target group"
}

output "green_target_group_arn" {
  value       = aws_lb_target_group.green_tg.arn
  description = "ARN of the Green target group"
}
