output "cluster_name" {
  description = "The name of the GKE cluster"
  value       = google_container_cluster.main.name
}

output "cluster_endpoint" {
  description = "The IP address of the cluster master"
  value       = google_container_cluster.main.endpoint
  sensitive   = true
}

output "cluster_ca_certificate" {
  description = "The cluster CA certificate"
  value       = google_container_cluster.main.master_auth[0].cluster_ca_certificate
  sensitive   = true
}

output "cluster_location" {
  description = "The location of the GKE cluster"
  value       = google_container_cluster.main.location
}

output "node_service_account" {
  description = "The service account used by the node pool"
  value       = google_service_account.gke_nodes.email
}

output "cluster_id" {
  description = "The unique identifier of the GKE cluster"
  value       = google_container_cluster.main.id
}