#!/bin/bash

# CRM Application Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="development"
NAMESPACE="crm-system"
IMAGE_TAG="latest"
DRY_RUN=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show help
show_help() {
    cat << EOF
CRM Application Kubernetes Deployment Script

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENVIRONMENT    Deployment environment (development|production)
    -n, --namespace NAMESPACE        Kubernetes namespace (default: crm-system)
    -t, --tag IMAGE_TAG              Docker image tag (default: latest)
    -d, --dry-run                    Perform dry run without applying changes
    -h, --help                       Show this help message

EXAMPLES:
    $0 -e development -t v1.0.0
    $0 --environment production --tag v1.2.3 --dry-run
    $0 -e production -n crm-prod

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|production)$ ]]; then
    print_error "Invalid environment. Must be 'development' or 'production'"
    exit 1
fi

print_status "Starting CRM deployment..."
print_status "Environment: $ENVIRONMENT"
print_status "Namespace: $NAMESPACE"
print_status "Image Tag: $IMAGE_TAG"
print_status "Dry Run: $DRY_RUN"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if kustomize is available
if ! command -v kustomize &> /dev/null; then
    print_error "kustomize is not installed or not in PATH"
    exit 1
fi

# Check cluster connection
print_status "Checking Kubernetes cluster connection..."
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster"
    exit 1
fi
print_success "Connected to Kubernetes cluster"

# Create namespace if it doesn't exist
print_status "Ensuring namespace '$NAMESPACE' exists..."
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Build kustomization
OVERLAY_PATH="overlays/$ENVIRONMENT"
if [[ ! -d "$OVERLAY_PATH" ]]; then
    print_error "Environment overlay not found: $OVERLAY_PATH"
    exit 1
fi

# Update image tag in kustomization
print_status "Updating image tag to $IMAGE_TAG..."
cd "$OVERLAY_PATH"
kustomize edit set image crm-app=crm-app:$IMAGE_TAG
cd - > /dev/null

# Apply or dry-run
if [[ "$DRY_RUN" == "true" ]]; then
    print_warning "DRY RUN MODE - No changes will be applied"
    kustomize build "$OVERLAY_PATH" | kubectl apply --dry-run=client -f -
else
    print_status "Applying Kubernetes manifests..."
    kustomize build "$OVERLAY_PATH" | kubectl apply -f -
    
    print_status "Waiting for deployment to be ready..."
    kubectl rollout status deployment/crm-app-deployment -n "$NAMESPACE" --timeout=300s
    
    print_success "Deployment completed successfully!"
    
    # Show deployment status
    print_status "Current deployment status:"
    kubectl get pods,svc,hpa -n "$NAMESPACE" -l app=crm-app
fi

print_success "CRM deployment script completed!"