---
title: Port-forward
description: Reach a ClusterIP Service from your laptop with kubectl port-forward.
---

**port-forward** opens a temporary tunnel: your machine → kubectl → Service or Pod.
Good for learning and debugging. It is **not** how production traffic enters the
cluster — that is [Ingress](/kubernetes/09-ingress/).

Assumes Service `web` and Deployment `web` in `practice`
([Services](/kubernetes/07-services/)).

## Start the tunnel

Leave this terminal open:

```powershell
kubectl -n practice get deploy,svc,pods -l app=web
kubectl -n practice port-forward svc/web 8080:80
```

| Piece | Meaning |
|---|---|
| `8080` | Port on **your laptop** |
| `80` | Port on **Service** `web` |

You should see: `Forwarding from 127.0.0.1:8080 -> 80`.

## Use it

Second terminal or browser:

```powershell
curl.exe http://127.0.0.1:8080
```

Or open http://127.0.0.1:8080 — same podinfo JSON as inside the cluster.

```text
Browser → 127.0.0.1:8080 → kubectl → Service web:80 → Pod :9898
```

## Optional: Pods change under the tunnel

Keep port-forward running:

```powershell
kubectl -n practice delete pod -l app=web
kubectl -n practice wait --for=condition=Available deploy/web --timeout=120s
curl.exe http://127.0.0.1:8080
```

Should still work after new Pods come up.

## Stop

Ctrl+C in the port-forward terminal. Then `http://127.0.0.1:8080` fails — the Service
still exists inside the cluster, but there is no path from your laptop.

### Variant (straight to a Pod)

```powershell
kubectl -n practice port-forward pod/POD_NAME 8080:9898
```

## Compared to Ingress

| | Port-forward | Ingress |
|---|---|---|
| Needs kubectl running | Yes | No |
| Good for | Quick debug | Real app access pattern |
| Hostname / TLS | No | Yes |

**Next:** [Ingress](/kubernetes/09-ingress/)
