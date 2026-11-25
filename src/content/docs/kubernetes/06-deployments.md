---
title: Deployments
description: Manage ReplicaSets with a Deployment — scale, rollout, and rollback.
---

A **Deployment** is what you use day to day. It owns ReplicaSets so you get scaling,
rolling updates, and rollbacks. You declare desired state; Kubernetes creates the
ReplicaSets.

Assumes lab **RUNNING**, `practice` namespace, registry image ready.

## Create

Imperative:

```powershell
kubectl -n practice create deployment web --image=localhost:5001/podinfo:6.7.1 --replicas=3
kubectl -n practice wait --for=condition=Available deploy/web --timeout=120s
kubectl -n practice get deploy,rs,pods -l app=web
```

YAML (`practice/10-deployment.yaml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: practice
  labels:
    app: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: podinfo
          image: localhost:5001/podinfo:6.7.1
          ports:
            - name: http
              containerPort: 9898
```

```powershell
kubectl apply -f practice\10-deployment.yaml
kubectl -n practice wait --for=condition=Available deploy/web --timeout=120s
kubectl -n practice get deploy,rs,pods -l app=web
```

You should see: 1 Deployment, 1 ReplicaSet (name like `web-<hash>`), 3 Pods.

`deploy/web` means resource type **Deployment**, name **web**.

Dry-run tip:

```powershell
kubectl -n practice create deployment web --image=localhost:5001/podinfo:6.7.1 --replicas=3 --dry-run=client -o yaml
```

## Scale

```powershell
kubectl -n practice scale deploy web --replicas=5
kubectl -n practice get deploy,rs,pods -l app=web
```

## Rollout and rollback

```powershell
kubectl -n practice set env deploy/web PODINFO_UI_MESSAGE="hello - v2"
kubectl -n practice rollout status deploy/web
kubectl -n practice get rs -l app=web
kubectl -n practice exec -it deploy/web -- wget -qO- http://127.0.0.1:9898
```

A **new** ReplicaSet appears (new revision). Old RS scales down; new one scales up.

```powershell
kubectl -n practice rollout history deploy/web
kubectl -n practice rollout undo deploy/web
kubectl -n practice rollout status deploy/web
```

## Self-healing still works

```powershell
kubectl -n practice delete pod -l app=web
kubectl -n practice get pods -l app=web -w
```

Pods come back via the ReplicaSet the Deployment manages.

## Cleanup

```powershell
kubectl -n practice delete deploy web
# or: kubectl delete -f practice\10-deployment.yaml
```

Leave the Deployment running if you continue to [Services](/kubernetes/07-services/).

**Next:** [Services](/kubernetes/07-services/)
