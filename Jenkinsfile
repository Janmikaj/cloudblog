pipeline {
    agent any

    environment {
        AWS_REGION = "ap-south-1" 
        // These will be populated dynamically from Terraform
        BLUE_TG_ARN = ""
        GREEN_TG_ARN = ""
        LISTENER_ARN = ""
        BLUE_IP = ""
        GREEN_IP = ""
    }

    stages {
        // 1. Checkout
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // 2. Build
        stage('Build') {
            steps {
                echo 'Building Frontend...'
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
                sh 'mkdir -p app && cp -r frontend/dist/* app/'
                
                echo 'Preparing Backend...'
                dir('backend-secure') {
                    sh 'npm install'
                }
            }
        }

        // 3. Test
        stage('Test') {
            steps {
                echo 'Running Application Tests...'
                sh 'ls -l app/index.html' 
            }
        }

        // 4. Security Testing Stage (Mandatory)
        stage('Security Testing') {
            steps {
                echo 'Starting Security Scans (ZAP, Trivy, Nmap)...'
                sh 'chmod +x security_scan.sh'
                sh './security_scan.sh'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'security_reports/*', fingerprint: true
                }
            }
        }

        // Helper Stage: Fetch Infrastructure Details
        stage('Fetch Infrastructure') {
            steps {
                dir('terraform') {
                    sh 'terraform init'
                    script {
                        env.BLUE_IP = sh(script: "terraform output -raw blue_public_ip", returnStdout: true).trim()
                        env.GREEN_IP = sh(script: "terraform output -raw green_public_ip", returnStdout: true).trim()
                        env.BLUE_TG_ARN = sh(script: "terraform output -raw blue_target_group_arn", returnStdout: true).trim()
                        env.GREEN_TG_ARN = sh(script: "terraform output -raw green_target_group_arn", returnStdout: true).trim()
                        env.LISTENER_ARN = sh(script: "terraform output -raw listener_arn", returnStdout: true).trim()
                    }
                }
            }
        }

        // 5. Deploy to Green
        stage('Deploy to Green') {
            steps {
                dir('ansible') {
                    // Update inventory with the latest Green IP
                    sh "sed -i 's/<GREEN_IP>/${env.GREEN_IP}/g' inventory.ini"
                    echo "Deploying to Green Instance: ${env.GREEN_IP}"
                    sh 'ansible-playbook -i inventory.ini install_apache.yml --limit green'
                    sh 'ansible-playbook -i inventory.ini deploy_app.yml --limit green'
                }
            }
        }

        // 6. Verify Green
        stage('Verify Green') {
            steps {
                echo 'Verifying Green deployment health...'
                sh "curl -f http://${env.GREEN_IP}"
                sh "curl -f http://${env.GREEN_IP}:5000/api/blogs" 
            }
        }

        // 7. Switch Traffic (ALB Blue -> Green)
        stage('Switch Traffic') {
            steps {
                echo 'Switching ALB traffic to Green Environment...'
                sh "aws elbv2 modify-listener --listener-arn ${env.LISTENER_ARN} --default-actions Type=forward,TargetGroupArn=${env.GREEN_TG_ARN} --region ${env.AWS_REGION}"
            }
        }
    }

    // 8. Rollback to Blue if verification fails
    post {
        failure {
            echo 'CRITICAL: Deployment or Verification failed! Rolling back to Blue...'
            script {
                if (env.LISTENER_ARN && env.BLUE_TG_ARN) {
                    sh "aws elbv2 modify-listener --listener-arn ${env.LISTENER_ARN} --default-actions Type=forward,TargetGroupArn=${env.BLUE_TG_ARN} --region ${env.AWS_REGION}"
                }
            }
        }
        success {
            echo 'Deployment successful! Traffic is now on Green.'
        }
    }
}
