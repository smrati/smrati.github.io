---
title: Namespaces
description: What Kubernetes namespaces are, why they matter, and how to use practice.
---

A **Namespace** is a scope for names (and, with RBAC/quotas, for access and limits).
Resources created with `-n practice` live in that namespace. Without `-n`, kubectl
uses `default` (unless your context sets another).

Assumes lab **RUNNING** and context `kind-lab`.

## Create one

Imperative:

```powershell
kubectl create namespace practice
```

YAML (`practice/kubernetes/00-namespace.yaml` in the lab repo):

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: practice
```

```powershell
kubectl apply -f practice/kubernetes/00-namespace.yaml
```

## Why namespaces exist

| Reason | Meaning |
|---|---|
| Name isolation | `deploy/web` in `practice` and another in `demo` do not clash |
| Organization | Group apps: `demo`, `monitoring`, `argocd` |
| Access control | Later: grant a team rights only in their namespace |
| Resource limits | Later: ResourceQuota / LimitRange per namespace |
| Cleanup | `kubectl delete namespace practice` removes almost everything in it |

They are **not** strong network isolation by themselves — Pods in different
namespaces can often still talk unless NetworkPolicies say otherwise. Think
“folder + permissions boundary,” not “separate cluster.”

## Practice usage

```powershell
kubectl create namespace practice
kubectl -n practice run web --image=localhost:5001/podinfo:6.7.1 --port=9898
kubectl -n practice get pods
kubectl delete namespace practice
```

(The image must already be in the lab registry — see [Pods](/kubernetes/04-pods/).)

Your lab already uses namespaces for platform tools: `kube-system`, `monitoring`,
`argocd`, `ingress-nginx`, `cert-manager`. Put learning experiments in `practice`
so cleanup is one command.

**Next:** [Pods](/kubernetes/04-pods/)
