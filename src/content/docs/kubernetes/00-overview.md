---
title: Overview
description: Kubernetes learning path on the kind lab — from setup through Ingress.
---

These notes walk through core Kubernetes objects on a local **kind lab**: a real
kubeadm-shaped cluster running in Docker that you can start and stop on demand.

The lab scripts and practice YAMLs are **not** on this docs site. You get them by
cloning the **kubernetes-labs** Git repository (see setup).

Complete [Set up the kind lab](/kubernetes/01-kind-lab-setup/) first. Every hands-on
page after that assumes the lab is **RUNNING** and your kubectl context is `kind-lab`.

## What you will learn

```text
Pod → ReplicaSet → Deployment → Service → port-forward / Ingress
```

| Step | Topic |
|---|---|
| 1 | [Set up the kind lab](/kubernetes/01-kind-lab-setup/) (Windows, macOS, Linux) |
| 2 | [Where kubectl is pointing](/kubernetes/02-kubectl-context/) |
| 3 | [Namespaces](/kubernetes/03-namespaces/) |
| 4 | [Pods](/kubernetes/04-pods/) |
| 5 | [ReplicaSets](/kubernetes/05-replicasets/) |
| 6 | [Deployments](/kubernetes/06-deployments/) |
| 7 | [Services](/kubernetes/07-services/) |
| 8 | [Port-forward](/kubernetes/08-port-forward/) |
| 9 | [Ingress](/kubernetes/09-ingress/) |

Manifests used in the later exercises live in the lab repo under `practice/kubernetes/`
(`00-namespace.yaml`, `05-replicaset.yaml`, `10-deployment.yaml`, `20-service.yaml`,
`30-ingress.yaml`, `31-ingress-tls.yaml`).

## Mental model

| Object | Job |
|---|---|
| Pod | Runs the container |
| ReplicaSet | Keeps N identical Pods alive |
| Deployment | Manages ReplicaSets (scale, rollouts, rollbacks) |
| Service | Stable in-cluster name/IP + load balancing |
| port-forward | Temporary access from your laptop (debug) |
| Ingress | HTTP(S) routing by host/path from outside → Service |

## After setup (quick check)

Only after you have cloned **kubernetes-labs** and run `up`. From that repo root:

```powershell
# from the kubernetes-labs repo root
.\scripts\lab.ps1 status          # Windows
# ./scripts/lab.sh status         # macOS / Linux
kubectl config current-context    # expect kind-lab
```

Expect status `RUNNING` and context `kind-lab`.

**Next:** [Set up the kind lab](/kubernetes/01-kind-lab-setup/)
