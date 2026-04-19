#!/bin/bash

# DevSecOps Security Scan Script
# This script runs various security tools and stores reports in security_reports/

REPORT_DIR="security_reports"
mkdir -p $REPORT_DIR

TARGET_URL=${1:-"http://localhost:5000"}
TARGET_IP=${2:-"localhost"}

echo "Starting Security Scans on $TARGET_URL ($TARGET_IP)..."

# 1. Gitleaks - Check for secrets in the codebase
echo "Running Gitleaks..."
docker run --rm -v $(pwd):/path zricethezav/gitleaks:latest detect --source="/path" --report-path="/path/$REPORT_DIR/gitleaks_report.json" || echo "Gitleaks found issues or failed"

# 2. Trivy - Scan for vulnerabilities in dependencies/files
echo "Running Trivy..."
docker run --rm -v $(pwd):/path aquasec/trivy:latest fs /path > $REPORT_DIR/trivy_report.txt

# 3. Nmap - Network exploration and security auditing
echo "Running Nmap scan on $TARGET_IP..."
nmap -F $TARGET_IP > $REPORT_DIR/nmap_report.txt

# 4. Nikto - Web server scanner
echo "Running Nikto on $TARGET_URL..."
# nikto -h $TARGET_URL > $REPORT_DIR/nikto_report.txt

# 5. OWASP ZAP - Baseline scan
echo "Running OWASP ZAP Baseline Scan on $TARGET_URL..."
docker run --rm -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable zap-baseline.py \
    -t $TARGET_URL -g gen.conf -r zap_report.html
mv zap_report.html $REPORT_DIR/

# 6. Lynis - System audit (if running on a Linux system)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Running Lynis audit..."
    lynis audit system > $REPORT_DIR/lynis_report.txt
fi

echo "Security Scans Completed. Reports are in $REPORT_DIR/"
