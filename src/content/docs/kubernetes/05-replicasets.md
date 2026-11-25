---
title: ReplicaSets
description: Keep N Pods alive with a ReplicaSet — self-healing and scaling.
---

A **ReplicaSet** is a controller that makes the number of matching Pods equal
`spec.replicas`. You declare a template + desired count; it creates, replaces, and
scales Pods.

In real apps you rarely create ReplicaSets yourself — a **Deployment** manages them.
This exercise exists so you can see self-healing clearly.

Assumes lab **RUNNING**, `practice` namespace, and image `localhost:5001/podinfo:6.7.1`
(see [Pods](/kubernetes/04-pods/)).

## YAML

Lab file: `practice/05-replicaset.yaml`. It uses labels `app=web-rs` so it does not
clash with Deployment `web` (`app=web`) later.

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: web-rs
  namespace: practice
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web-rs
  template:
    metadata:
      labels:
        app: web-rs
    spec:
      containers:
        - name: podinfo
          image: localhost:5001/podinfo:6.7.1
          ports:
            - containerPort: 9898
```

```powershell
kubectl apply -f practice\05-replicaset.yaml
kubectl -n practice get rs,pods -l app=web-rs -o wide
```

Expect DESIRED/CURRENT/READY = 2.

## Self-healing and scale

```powershell
kubectl -n practice delete pod -l app=web-rs
kubectl -n practice get pods -l app=web-rs -w
# Ctrl+C once 2 are Running again (new names)

kubectl -n practice scale rs web-rs --replicas=3
kubectl -n practice get rs,pods -l app=web-rs

kubectl -n practice get pods -l app=web-rs -o custom-columns=NAME:.metadata.name,OWNER:.metadata.ownerReferences[0].kind
```

Owner column should show `ReplicaSet` (a bare Pod has no owner).

| Alone Pod | ReplicaSet |
|---|---|
| Delete → gone | Delete a Pod → RS creates a replacement |
| Scale by hand | `kubectl scale rs … --replicas=N` |

## Cleanup

```powershell
kubectl -n practice delete rs web-rs
# or: kubectl delete -f practice\05-replicaset.yaml
```

Deleting the ReplicaSet deletes its Pods too.

**Next:** [Deployments](/kubernetes/06-deployments/)
