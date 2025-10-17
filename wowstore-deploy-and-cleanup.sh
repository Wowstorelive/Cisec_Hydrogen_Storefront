#!/bin/bash

################################################################################
# WOWSTORE CISECO DEPLOYMENT & CLEANUP AUTOMATION SCRIPT
# 
# Purpose: Deploy Ciseco Hydrogen theme to new GKE cluster and cleanup old resources
# Author: Manus AI
# Date: October 17, 2025
################################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="wowstore-ai-media-agent"
CLUSTER_NAME="autopilot-cluster-wowstoreain8ndocker"
REGION="europe-west2"
REPO_URL="https://github.com/Wowstorelive/Cisec_Hydrogen_Storefront.git"
APP_NAME="ciseco-hydrogen"
NAMESPACE="default"

################################################################################
# HELPER FUNCTIONS
################################################################################

print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

confirm_action() {
    read -p "$(echo -e ${YELLOW}$1 [y/N]: ${NC})" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Action cancelled by user"
        return 1
    fi
    return 0
}

################################################################################
# PHASE 1: PRE-FLIGHT CHECKS
################################################################################

preflight_checks() {
    print_header "PHASE 1: PRE-FLIGHT CHECKS"
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI not found. Please install Google Cloud SDK."
        exit 1
    fi
    print_success "gcloud CLI found"
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl not found. Installing..."
        gcloud components install kubectl
    fi
    print_success "kubectl found"
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        print_warning "docker not found. Will use Cloud Build instead."
    else
        print_success "docker found"
    fi
    
    # Set project
    print_info "Setting project to $PROJECT_ID"
    gcloud config set project $PROJECT_ID
    
    # Get cluster credentials
    print_info "Getting cluster credentials"
    gcloud container clusters get-credentials $CLUSTER_NAME \
        --region $REGION \
        --project $PROJECT_ID
    
    print_success "Pre-flight checks complete"
}

################################################################################
# PHASE 2: CLEANUP OLD RESOURCES
################################################################################

cleanup_old_resources() {
    print_header "PHASE 2: CLEANUP OLD RESOURCES"
    
    if ! confirm_action "Do you want to clean up old resources?"; then
        print_warning "Skipping cleanup"
        return
    fi
    
    # List all deployments
    print_info "Listing all deployments..."
    kubectl get deployments --all-namespaces
    
    # Delete old hydrogen deployments (excluding the new one)
    print_info "Cleaning up old deployments..."
    OLD_DEPLOYMENTS=$(kubectl get deployments --all-namespaces -o json | \
        jq -r '.items[] | select(.metadata.name | contains("hydrogen") or contains("demo-store")) | "\(.metadata.namespace)/\(.metadata.name)"')
    
    if [ -n "$OLD_DEPLOYMENTS" ]; then
        echo "$OLD_DEPLOYMENTS" | while read deployment; do
            NAMESPACE=$(echo $deployment | cut -d'/' -f1)
            NAME=$(echo $deployment | cut -d'/' -f2)
            print_warning "Found old deployment: $NAME in namespace $NAMESPACE"
            if confirm_action "Delete $NAME?"; then
                kubectl delete deployment $NAME -n $NAMESPACE
                print_success "Deleted deployment $NAME"
            fi
        done
    else
        print_info "No old deployments found"
    fi
    
    # Clean up old services
    print_info "Cleaning up old services..."
    OLD_SERVICES=$(kubectl get services --all-namespaces -o json | \
        jq -r '.items[] | select(.metadata.name | contains("hydrogen") or contains("demo-store")) | "\(.metadata.namespace)/\(.metadata.name)"')
    
    if [ -n "$OLD_SERVICES" ]; then
        echo "$OLD_SERVICES" | while read service; do
            NAMESPACE=$(echo $service | cut -d'/' -f1)
            NAME=$(echo $service | cut -d'/' -f2)
            print_warning "Found old service: $NAME in namespace $NAMESPACE"
            if confirm_action "Delete $NAME?"; then
                kubectl delete service $NAME -n $NAMESPACE
                print_success "Deleted service $NAME"
            fi
        done
    else
        print_info "No old services found"
    fi
    
    # Clean up old PVCs
    print_info "Cleaning up old PVCs..."
    kubectl get pvc --all-namespaces
    
    # Clean up old Docker images
    print_info "Cleaning up old Docker images in GCR..."
    OLD_IMAGES=$(gcloud container images list --repository=gcr.io/$PROJECT_ID 2>/dev/null || echo "")
    
    if [ -n "$OLD_IMAGES" ]; then
        echo "$OLD_IMAGES" | grep -v "IMAGE" | while read image; do
            print_warning "Found old image: $image"
            if confirm_action "Delete $image and all its tags?"; then
                gcloud container images delete $image --quiet
                print_success "Deleted image $image"
            fi
        done
    else
        print_info "No old images found in GCR"
    fi
    
    print_success "Cleanup complete"
}

################################################################################
# PHASE 3: CLONE AND SETUP CISECO THEME
################################################################################

setup_ciseco_theme() {
    print_header "PHASE 3: SETUP CISECO THEME"
    
    # Create working directory
    WORK_DIR="$HOME/ciseco-deployment"
    print_info "Creating working directory: $WORK_DIR"
    mkdir -p $WORK_DIR
    cd $WORK_DIR
    
    # Clone repository
    if [ -d "Cisec_Hydrogen_Storefront" ]; then
        print_warning "Repository already exists. Pulling latest changes..."
        cd Cisec_Hydrogen_Storefront
        git pull origin main
    else
        print_info "Cloning repository from GitHub..."
        git clone $REPO_URL
        cd Cisec_Hydrogen_Storefront
    fi
    
    print_success "Repository ready"
    
    # Check for .env file
    if [ ! -f ".env" ]; then
        print_warning ".env file not found"
        print_info "You'll need to configure Shopify credentials"
        
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_info "Created .env from .env.example"
            print_warning "Please edit .env file with your Shopify credentials"
            print_info "Required variables:"
            echo "  - PUBLIC_STOREFRONT_ID"
            echo "  - PUBLIC_STOREFRONT_API_TOKEN"
            echo "  - PRIVATE_STOREFRONT_API_TOKEN"
            echo "  - PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID"
            echo "  - PUBLIC_CUSTOMER_ACCOUNT_API_URL"
            
            if confirm_action "Open .env file for editing?"; then
                ${EDITOR:-nano} .env
            fi
        fi
    else
        print_success ".env file found"
    fi
}

################################################################################
# PHASE 4: BUILD DOCKER IMAGE
################################################################################

build_docker_image() {
    print_header "PHASE 4: BUILD DOCKER IMAGE"
    
    cd $WORK_DIR/Cisec_Hydrogen_Storefront
    
    # Create Dockerfile if it doesn't exist
    if [ ! -f "Dockerfile" ]; then
        print_info "Creating Dockerfile..."
        cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
EOF
        print_success "Dockerfile created"
    fi
    
    # Build using Cloud Build
    IMAGE_NAME="gcr.io/$PROJECT_ID/$APP_NAME:latest"
    print_info "Building Docker image using Cloud Build..."
    print_info "Image: $IMAGE_NAME"
    
    gcloud builds submit --tag $IMAGE_NAME .
    
    print_success "Docker image built and pushed to GCR"
}

################################################################################
# PHASE 5: CREATE KUBERNETES MANIFESTS
################################################################################

create_k8s_manifests() {
    print_header "PHASE 5: CREATE KUBERNETES MANIFESTS"
    
    cd $WORK_DIR/Cisec_Hydrogen_Storefront
    mkdir -p kubernetes
    
    # Create deployment manifest
    print_info "Creating deployment manifest..."
    cat > kubernetes/deployment.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $APP_NAME
  namespace: $NAMESPACE
  labels:
    app: $APP_NAME
spec:
  replicas: 2
  selector:
    matchLabels:
      app: $APP_NAME
  template:
    metadata:
      labels:
        app: $APP_NAME
    spec:
      containers:
      - name: $APP_NAME
        image: gcr.io/$PROJECT_ID/$APP_NAME:latest
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: PUBLIC_STOREFRONT_ID
          valueFrom:
            secretKeyRef:
              name: shopify-secrets
              key: storefront-id
              optional: true
        - name: PUBLIC_STOREFRONT_API_TOKEN
          valueFrom:
            secretKeyRef:
              name: shopify-secrets
              key: storefront-api-token
              optional: true
        - name: PRIVATE_STOREFRONT_API_TOKEN
          valueFrom:
            secretKeyRef:
              name: shopify-secrets
              key: private-storefront-api-token
              optional: true
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
EOF
    
    # Create service manifest
    print_info "Creating service manifest..."
    cat > kubernetes/service.yaml << EOF
apiVersion: v1
kind: Service
metadata:
  name: $APP_NAME-service
  namespace: $NAMESPACE
  labels:
    app: $APP_NAME
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  selector:
    app: $APP_NAME
EOF
    
    # Create ingress manifest
    print_info "Creating ingress manifest..."
    cat > kubernetes/ingress.yaml << EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: $APP_NAME-ingress
  namespace: $NAMESPACE
  annotations:
    kubernetes.io/ingress.class: "gce"
    kubernetes.io/ingress.global-static-ip-name: "wowstore-ip"
    networking.gke.io/managed-certificates: "wowstore-ssl-cert"
spec:
  rules:
  - host: wowstore.live
    http:
      paths:
      - path: /*
        pathType: ImplementationSpecific
        backend:
          service:
            name: $APP_NAME-service
            port:
              number: 80
EOF
    
    # Create managed certificate
    print_info "Creating managed certificate manifest..."
    cat > kubernetes/certificate.yaml << EOF
apiVersion: networking.gke.io/v1
kind: ManagedCertificate
metadata:
  name: wowstore-ssl-cert
  namespace: $NAMESPACE
spec:
  domains:
    - wowstore.live
    - www.wowstore.live
EOF
    
    print_success "Kubernetes manifests created"
}

################################################################################
# PHASE 6: CREATE SECRETS
################################################################################

create_secrets() {
    print_header "PHASE 6: CREATE KUBERNETES SECRETS"
    
    # Check if .env file exists
    if [ ! -f "$WORK_DIR/Cisec_Hydrogen_Storefront/.env" ]; then
        print_warning ".env file not found. Skipping secret creation."
        print_info "You can create secrets manually later with:"
        echo "  kubectl create secret generic shopify-secrets \\"
        echo "    --from-literal=storefront-id=YOUR_ID \\"
        echo "    --from-literal=storefront-api-token=YOUR_TOKEN \\"
        echo "    --from-literal=private-storefront-api-token=YOUR_PRIVATE_TOKEN"
        return
    fi
    
    # Source .env file
    source $WORK_DIR/Cisec_Hydrogen_Storefront/.env
    
    # Check if secret already exists
    if kubectl get secret shopify-secrets -n $NAMESPACE &> /dev/null; then
        print_warning "Secret 'shopify-secrets' already exists"
        if confirm_action "Delete and recreate?"; then
            kubectl delete secret shopify-secrets -n $NAMESPACE
        else
            print_info "Skipping secret creation"
            return
        fi
    fi
    
    # Create secret
    print_info "Creating Kubernetes secret..."
    kubectl create secret generic shopify-secrets \
        --from-literal=storefront-id="${PUBLIC_STOREFRONT_ID:-}" \
        --from-literal=storefront-api-token="${PUBLIC_STOREFRONT_API_TOKEN:-}" \
        --from-literal=private-storefront-api-token="${PRIVATE_STOREFRONT_API_TOKEN:-}" \
        -n $NAMESPACE
    
    print_success "Kubernetes secret created"
}

################################################################################
# PHASE 7: DEPLOY TO KUBERNETES
################################################################################

deploy_to_kubernetes() {
    print_header "PHASE 7: DEPLOY TO KUBERNETES"
    
    cd $WORK_DIR/Cisec_Hydrogen_Storefront
    
    # Apply manifests
    print_info "Applying Kubernetes manifests..."
    
    kubectl apply -f kubernetes/deployment.yaml
    print_success "Deployment created"
    
    kubectl apply -f kubernetes/service.yaml
    print_success "Service created"
    
    kubectl apply -f kubernetes/certificate.yaml
    print_success "Managed certificate created"
    
    kubectl apply -f kubernetes/ingress.yaml
    print_success "Ingress created"
    
    # Wait for deployment
    print_info "Waiting for deployment to be ready..."
    kubectl rollout status deployment/$APP_NAME -n $NAMESPACE --timeout=5m
    
    print_success "Deployment complete!"
}

################################################################################
# PHASE 8: VERIFY DEPLOYMENT
################################################################################

verify_deployment() {
    print_header "PHASE 8: VERIFY DEPLOYMENT"
    
    # Check pods
    print_info "Checking pods..."
    kubectl get pods -n $NAMESPACE -l app=$APP_NAME
    
    # Check service
    print_info "Checking service..."
    kubectl get service $APP_NAME-service -n $NAMESPACE
    
    # Get external IP
    print_info "Getting external IP..."
    EXTERNAL_IP=$(kubectl get service $APP_NAME-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [ -n "$EXTERNAL_IP" ]; then
        print_success "External IP: $EXTERNAL_IP"
        print_info "Update your DNS to point wowstore.live to $EXTERNAL_IP"
    else
        print_warning "External IP not yet assigned. It may take a few minutes."
        print_info "Run this command to check: kubectl get service $APP_NAME-service -n $NAMESPACE"
    fi
    
    # Check ingress
    print_info "Checking ingress..."
    kubectl get ingress $APP_NAME-ingress -n $NAMESPACE
    
    # Check certificate
    print_info "Checking managed certificate..."
    kubectl describe managedcertificate wowstore-ssl-cert -n $NAMESPACE
    
    print_success "Verification complete!"
}

################################################################################
# PHASE 9: POST-DEPLOYMENT SUMMARY
################################################################################

post_deployment_summary() {
    print_header "PHASE 9: POST-DEPLOYMENT SUMMARY"
    
    echo -e "${GREEN}✓ Ciseco Hydrogen theme deployed successfully!${NC}\n"
    
    echo "Next steps:"
    echo "1. Update DNS records to point to the external IP"
    echo "2. Wait for SSL certificate to be provisioned (may take 15-30 minutes)"
    echo "3. Test the site at http://EXTERNAL_IP"
    echo "4. Once DNS propagates, test at https://wowstore.live"
    echo ""
    echo "Useful commands:"
    echo "  - View pods: kubectl get pods -n $NAMESPACE"
    echo "  - View logs: kubectl logs -f deployment/$APP_NAME -n $NAMESPACE"
    echo "  - View service: kubectl get service $APP_NAME-service -n $NAMESPACE"
    echo "  - View ingress: kubectl get ingress -n $NAMESPACE"
    echo "  - Check certificate: kubectl describe managedcertificate wowstore-ssl-cert -n $NAMESPACE"
    echo ""
    print_success "Deployment automation complete!"
}

################################################################################
# MAIN EXECUTION
################################################################################

main() {
    echo -e "${BLUE}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   WOWSTORE CISECO DEPLOYMENT & CLEANUP AUTOMATION           ║
║                                                              ║
║   This script will:                                         ║
║   1. Check prerequisites                                    ║
║   2. Clean up old resources                                 ║
║   3. Clone Ciseco theme                                     ║
║   4. Build Docker image                                     ║
║   5. Create Kubernetes manifests                            ║
║   6. Create secrets                                         ║
║   7. Deploy to GKE                                          ║
║   8. Verify deployment                                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"
    
    if ! confirm_action "Do you want to proceed?"; then
        print_error "Deployment cancelled"
        exit 0
    fi
    
    # Execute phases
    preflight_checks
    cleanup_old_resources
    setup_ciseco_theme
    build_docker_image
    create_k8s_manifests
    create_secrets
    deploy_to_kubernetes
    verify_deployment
    post_deployment_summary
    
    print_success "All done! 🎉"
}

# Run main function
main

