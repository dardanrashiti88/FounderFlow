variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "cluster_name" {
  description = "The name of the GKE cluster"
  type        = string
}

variable "location" {
  description = "The location (region or zone) of the GKE cluster"
  type        = string
}

variable "network" {
  description = "The VPC network to host the cluster in"
  type        = string
}

variable "subnetwork" {
  description = "The subnetwork to host the cluster in"
  type        = string
}

variable "pods_range_name" {
  description = "The name of the secondary subnet range to use for pods"
  type        = string
}

variable "services_range_name" {
  description = "The name of the secondary subnet range to use for services"
  type        = string
}

variable "master_ipv4_cidr_block" {
  description = "The IP range in CIDR notation to use for the hosted master network"
  type        = string
  default     = "172.16.0.0/28"
}

variable "authorized_networks" {
  description = "List of master authorized networks"
  type = list(object({
    cidr_block   = string
    display_name = string
  }))
  default = []
}

variable "node_count" {
  description = "The number of nodes to create in the node pool"
  type        = number
  default     = 1
}

variable "min_node_count" {
  description = "Minimum number of nodes in the node pool"
  type        = number
  default     = 1
}

variable "max_node_count" {
  description = "Maximum number of nodes in the node pool"
  type        = number
  default     = 10
}

variable "machine_type" {
  description = "The machine type for cluster nodes"
  type        = string
  default     = "e2-standard-4"
}

variable "disk_size_gb" {
  description = "Size of the disk attached to each node, specified in GB"
  type        = number
  default     = 100
}

variable "disk_type" {
  description = "Type of the disk attached to each node"
  type        = string
  default     = "pd-ssd"
}

variable "preemptible" {
  description = "Whether the nodes are created as preemptible VM instances"
  type        = bool
  default     = false
}

variable "enable_monitoring_node_pool" {
  description = "Whether to create a dedicated node pool for monitoring workloads"
  type        = bool
  default     = true
}

variable "deletion_protection" {
  description = "Whether to enable deletion protection on the cluster"
  type        = bool
  default     = true
}

variable "labels" {
  description = "A map of labels to assign to the cluster and nodes"
  type        = map(string)
  default     = {}
}