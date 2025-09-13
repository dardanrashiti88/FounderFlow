# CRM Application Kubernetes Deployment

This directory contains advanced Kubernetes manifests for deploying the CRM application with production-ready features.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ingress       │    │   Application   │    │   PostgreSQL    │
│   (nginx)       │───▶│   (Node.js)     │───▶│   Database      │
│   LoadBalancer  │    │   3-50 replicas │    │   with backups  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Monitoring    │    │   Auto Scaling  │    │   Persistence   │
│   (Prometheus)  │    │   (HPA + VPA)   │    │   (PVC + Backup)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Features

### 🔐 Security
- **Network Policies** - Restrict pod-to-pod communication
- **RBAC** - Role-based access control
- **Pod Security Context** - Non-root containers with read-only filesystems
- **Secret Management** - External Secrets Operator integration

### 📊 Monitoring & Observability
- **Prometheus Metrics** - Application and database monitoring
- **Grafana Dashboards** - Pre-configured visualization
- **Alerting Rules** - Automated incident detection
- **Health Checks** - Liveness, readiness, and startup probes

### 🚀 High Availability
- **Pod Anti-Affinity** - Distribute replicas across nodes
- **Pod Disruption Budget** - Maintain availability during updates
- **Topology Spread Constraints** - Even distribution across zones
- **Rolling Updates** - Zero-downtime deployments

### 📈 Scalability
- **Horizontal Pod Autoscaler** - CPU, memory, and custom metrics scaling
- **Vertical Pod Autoscaler** - Automatic resource optimization
- **Resource Limits** - Prevent resource exhaustion
- **Multiple scaling policies** - Flexible scaling behavior

### 💾 Data Management
- **Persistent Volumes** - Durable database storage
- **Automated Backups** - Daily PostgreSQL backups to cloud storage
- **Storage Classes** - SSD and standard storage options

## Quick Start

### Prerequisites

```bash
# Install required tools
kubectl version --client
kustomize version
helm version
```

### Development Deployment

```bash
# Deploy to development environment
cd k8s
kubectl apply -k overlays/development/

# Check deployment status
kubectl get pods -n crm-system -l environment=development
```

### Production Deployment

```bash
# Deploy to production environment
cd k8s
kubectl apply -k overlays/production/

# Verify deployment
kubectl rollout status deployment/prod-crm-app-deployment-stable -n crm-system
```

### Using the Deployment Script

```bash
# Development deployment
./k8s/scripts/deploy.sh -e development -t v1.0.0

# Production deployment with dry-run
./k8s/scripts/deploy.sh -e production -t v1.2.3 --dry-run

# Full production deployment
./k8s/scripts/deploy.sh -e production -t v1.2.3
```

## Configuration Management

### Environment-Specific Settings

| Environment | Replicas | Resources | Storage |
|------------|----------|-----------|---------|
| Development | 1-3 | 128Mi-512Mi | 5Gi |
| Production | 3-50 | 512Mi-2Gi | 100Gi |

### Image Management

Update image tags using Kustomize:

```bash
cd overlays/production
kustomize edit set image crm-app=crm-app:v1.2.3
```

## Monitoring Setup

### Prometheus Metrics

The application exposes metrics at `/metrics` endpoint:
- HTTP request duration and count
- Database connection pool stats
- Memory and CPU usage
- Custom business metrics

### Grafana Dashboards

Pre-configured dashboards include:
- Application Performance Monitoring
- Database Performance
- Infrastructure Metrics
- Business KPIs

### Alerting

Critical alerts configured:
- Application Down
- High Memory/CPU Usage
- Database Connection Issues
- High Error Rate

## Security Features

### Network Security
```yaml
# Network policy restricts ingress/egress
- Ingress: Only from nginx-ingress
- Egress: Only to PostgreSQL and DNS
```

### Pod Security
```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
```

### Secret Management

Production secrets are managed via External Secrets Operator:

```bash
# Configure Vault backend
kubectl apply -f overlays/production/production-secrets.yaml
```

## Backup and Recovery

### Automated Backups

Daily PostgreSQL backups via CronJob:
- Runs at 2 AM UTC
- Uploads to cloud storage (S3/GCS)
- Retains 7 days locally, 30 days in cloud

### Manual Backup

```bash
# Create manual backup
kubectl create job --from=cronjob/postgres-backup manual-backup-$(date +%s) -n crm-system
```

### Restore from Backup

```bash
# Download backup from cloud storage
aws s3 cp s3://your-backup-bucket/postgres-backups/crm-backup-20240101-020000.sql ./

# Restore to database
kubectl exec -it deployment/postgres-deployment -n crm-system -- psql $DATABASE_URL < crm-backup-20240101-020000.sql
```

## Scaling

### Manual Scaling

```bash
# Scale application
kubectl scale deployment crm-app-deployment --replicas=10 -n crm-system

# Scale HPA limits
kubectl patch hpa crm-app-hpa -n crm-system --patch '{"spec":{"maxReplicas":20}}'
```

### Auto Scaling Triggers

- **CPU**: Scale up at 70% utilization
- **Memory**: Scale up at 80% utilization
- **Custom Metrics**: Scale based on request rate

## Troubleshooting

### Common Issues

1. **Pods not starting**
   ```bash
   kubectl describe pod <pod-name> -n crm-system
   kubectl logs <pod-name> -n crm-system
   ```

2. **Database connection issues**
   ```bash
   kubectl exec -it deployment/postgres-deployment -n crm-system -- pg_isready
   ```

3. **Ingress not working**
   ```bash
   kubectl describe ingress crm-app-ingress -n crm-system
   kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
   ```

### Health Checks

```bash
# Check application health
kubectl get pods -n crm-system
kubectl top pods -n crm-system

# Check services
kubectl get svc -n crm-system

# Check ingress
kubectl get ingress -n crm-system
```

## Maintenance

### Rolling Updates

```bash
# Update image with zero downtime
kubectl set image deployment/crm-app-deployment crm-app=crm-app:v1.3.0 -n crm-system

# Check rollout status
kubectl rollout status deployment/crm-app-deployment -n crm-system

# Rollback if needed
kubectl rollout undo deployment/crm-app-deployment -n crm-system
```

### Resource Cleanup

```bash
# Remove development environment
kubectl delete -k overlays/development/

# Remove entire namespace (careful!)
kubectl delete namespace crm-system
```