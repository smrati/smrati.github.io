---
title: Services
description: Give Pods a stable ClusterIP and DNS name with a Service.
---

A **Service** gives a stable virtual IP and DNS name in front of Pods selected by
labels, and load-balances to them. Pod IPs change when Pods restart; the Service
name does not.

Type **ClusterIP** (default) is reachable **only inside** the cluster.

Assumes Deployment `web` is Available in `practice` ([Deployments](/kubernetes/06-deployments/)).

## Create

Imperative:

```powershell
kubectl -n practice expose deploy/web --name=web --port=80 --target-port=9898
```

| Piece | Meaning |
|---|---|
| `deploy/web` | Expose this Deployment |
| `--name=web` | New Service name |
| `--port=80` | Port clients use on the Service |
| `--target-port=9898` | Container port |

YAML (`practice/kubernetes/20-service.yaml`):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: practice
  labels:
    app: web
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
    - name: http
      port: 80
      targetPort: http
```

```powershell
kubectl apply -f practice/kubernetes/20-service.yaml
kubectl -n practice get svc,endpoints,pods -l app=web -o wide
kubectl -n practice describe svc web
```

Notice: ClusterIP, selector `app=web`, Endpoints listing Pod IPs on `:9898`.

## Call from inside the cluster

```powershell
kubectl -n practice run curl --rm -it --image=curlimages/curl --restart=Never -- curl -s http://web.practice.svc
```

DNS: `<service>.<namespace>.svc` → `web.practice.svc`. JSON `"hostname"` is the Pod that answered.

## Prove stability

```powershell
kubectl -n practice delete pod -l app=web
kubectl -n practice wait --for=condition=Available deploy/web --timeout=120s
kubectl -n practice get endpoints web
kubectl -n practice run curl --rm -it --image=curlimages/curl --restart=Never -- curl -s http://web.practice.svc
```

Endpoint IPs change; `http://web.practice.svc` still works.

**Achievement:** fixed name/IP for clients. **Limit:** ClusterIP is not reachable from your laptop by itself — use [port-forward](/kubernetes/08-port-forward/) or [Ingress](/kubernetes/09-ingress/).

## Cleanup (optional)

```powershell
kubectl -n practice delete svc web
# keep deploy/web for the next pages
```

**Next:** [Port-forward](/kubernetes/08-port-forward/)
