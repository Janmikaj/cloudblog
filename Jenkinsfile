pipeline {
    agent any

    environment {
        AWS_REGION = "ap-south-1"
        BLUE_TG_ARN = ""
        GREEN_TG_ARN = ""
        LISTENER_ARN = ""
        BLUE_IP = ""
        GREEN_IP = ""
        LOG_GROUP = "/blog-app/logs"
    }

    stages {

        stage('Checkout') {
            steps { checkout scm }
        }

        // Terraform Provisioning
        stage('Provision Infrastructure') {
            steps {
                dir('terraform') {
                    sh 'terraform init'
                    sh 'terraform apply -auto-approve'

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

        stage('Build') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
                sh 'mkdir -p app && cp -r frontend/dist/* app/'
                dir('backend-secure') {
                    sh 'npm install'
                }
            }
        }

        stage('Test') {
            steps {
                sh 'ls -l app/index.html'
            }
        }

        // Security Scan
        stage('Security Testing') {
            steps {
                sh 'chmod +x security_scan.sh'
                sh './security_scan.sh'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'security_reports/*', fingerprint: true
                }
            }
        }

        // Deploy
        stage('Deploy to Green') {
            steps {
                dir('ansible') {
                    sh """
                    echo '[green]' > inventory.ini
                    echo 'green_server ansible_host=${env.GREEN_IP} ansible_user=ec2-user ansible_ssh_private_key_file=./key.pem' >> inventory.ini
                    """

                    sh 'ansible-playbook -i inventory.ini install_apache.yml'
                    sh 'ansible-playbook -i inventory.ini install_cloudwatch.yml'
                    sh 'ansible-playbook -i inventory.ini deploy_app.yml'
                }
            }
        }

        // Verify
        stage('Verify Green') {
            steps {
                sleep 20
                sh "curl -f http://${env.GREEN_IP}"
            }
        }

        // CloudWatch Log Check (NEW)
        stage('Verify CloudWatch Logs') {
            steps {
                script {
                    withCredentials([[
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-creds'
                    ]]) {
                        sh """
                        aws logs describe-log-groups \
                        --log-group-name-prefix ${env.LOG_GROUP} \
                        --region ${env.AWS_REGION}
                        """
                    }
                }
            }
        }

        // Switch Traffic
        stage('Switch Traffic') {
            steps {
                script {
                    withCredentials([[
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-creds'
                    ]]) {
                        sh """
                        aws elbv2 modify-listener \
                        --listener-arn ${env.LISTENER_ARN} \
                        --default-actions Type=forward,TargetGroupArn=${env.GREEN_TG_ARN} \
                        --region ${env.AWS_REGION}
                        """
                    }
                }
            }
        }
    }

    post {
        failure {
            script {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-creds'
                ]]) {
                    sh """
                    aws elbv2 modify-listener \
                    --listener-arn ${env.LISTENER_ARN} \
                    --default-actions Type=forward,TargetGroupArn=${env.BLUE_TG_ARN} \
                    --region ${env.AWS_REGION}
                    """
                }
            }
        }
    }
}