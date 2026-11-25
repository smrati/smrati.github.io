---
title: Pods
description: Create, inspect, and delete a bare Pod — and see why controllers matter.
---

A **Pod** is the smallest deployable unit in Kubernetes: one or more containers that
share network and storage. A bare Pod has **no controller** — if you delete it, it
stays gone.

Assumes lab **RUNNING**, context `kind-lab`, and namespace `practice`
([Namespaces](/kubernetes/03-namespaces/)).

## Registry prep (once)

Nodes pull from the lab registry at `localhost:5001`, not from your laptop’s Docker
cache alone:

```powershell
docker pull ghcr.io/stefanprodan/podinfo:6.7.1
docker tag  ghcr.io/stefanprodan/podinfo:6.7.1 localhost:5001/podinfo:6.7.1
docker push localhost:5001/podinfo:6.7.1
```

## Create and wait

```powershell
kubectl -n practice run web --image=localhost:5001/podinfo:6.7.1 --port=9898

kubectl -n practice wait --for=condition=Ready pod/web --timeout=120s
kubectl -n practice get pods -o wide
```

Wait until `Running` / `1/1` before `logs` or `exec`. First pull can take a few seconds.

## Inspect

```powershell
kubectl -n practice describe pod web
kubectl -n practice logs web
kubectl -n practice exec -it web -- wget -qO- http://127.0.0.1:9898
```

`describe` Events show the normal path: Scheduled → Pulled → Created → Started.
`exec` hits the app **inside** that Pod’s network namespace (port 9898).

## Delete — nothing comes back

```powershell
kubectl -n practice delete pod web
kubectl -n practice get pods
```

Empty list. That is the lesson: production workloads use a **controller**
(ReplicaSet / Deployment), not a lone Pod.

**Next:** [ReplicaSets](/kubernetes/05-replicasets/)
