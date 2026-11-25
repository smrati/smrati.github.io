---
title: Ingress
description: Expose a Service on a hostname with Ingress — HTTP and TLS on the kind lab.
---

## What is Ingress?

Ingress is a Kubernetes object that defines **HTTP/HTTPS routing rules** into the
cluster — typically by **hostname** and **path** — to one or more **Services**.

It is not a Pod and not a replacement for a Service. An **Ingress controller**
(in this lab: **ingress-nginx**) reads those rules and accepts traffic on ports 80/443.

**One line:** declarative HTTP(S) routing from outside the cluster to Services,
enforced by an Ingress controller.

## Why do we need it?

Pods and ClusterIP Services are for **in-cluster** traffic. Ingress gives a standard
way to expose many HTTP apps through one entry point (host/path routing, TLS) without
port-forward or a NodePort per app.

| Reason | Meaning |
|---|---|
| Outside access for HTTP | Browsers and APIs speak HTTP(S) |
| One entry, many apps | Many hostnames on ports 80/443 |
| Host and path routing | Different apps / paths → different Services |
| TLS at the edge | Certificates (often via cert-manager) |

Traffic path: **Ingress → Service → Pods**.

## Where the controller lives

Not in your app YAML. The lab installs it with `lab up` (Helm chart `ingress-nginx`,
values in `platform/values/ingress-nginx.yaml`). Check:

```powershell
kubectl -n ingress-nginx get pods
kubectl get ingressclass
```

`ingressClassName: nginx` on an Ingress means “this controller should handle these rules.”

Assumes lab **RUNNING**, Deployment + Service `web` in `practice`. Stop any leftover
port-forward first.

## HTTP

Lab file: `practice/30-ingress.yaml`.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web
  namespace: practice
spec:
  ingressClassName: nginx
  rules:
    - host: web.lab.localtest.me
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port:
                  number: 80
```

`host: web.lab.localtest.me` matches the HTTP `Host` header. `*.lab.localtest.me`
already resolves to `127.0.0.1`.

```powershell
kubectl apply -f practice\30-ingress.yaml
kubectl -n practice get ingress
kubectl -n practice describe ingress web
curl.exe http://web.lab.localtest.me
```

Or open http://web.lab.localtest.me in a browser — **no** port-forward.

```text
Browser → 127.0.0.1:80 → kind → ingress-nginx → Service web:80 → Pod :9898
         (Host: web.lab.localtest.me)
```

```powershell
curl.exe http://127.0.0.1 -H "Host: web.lab.localtest.me"
```

## Optional: TLS (Ingress TLS)

**Ingress TLS** means HTTPS at the Ingress: the controller terminates TLS with a
certificate, then forwards HTTP to the Service.

Lab file: `practice/31-ingress-tls.yaml` — same rules plus:

- `spec.tls` → host + Secret name (`web-tls`)
- annotation `cert-manager.io/cluster-issuer: lab-ca` so cert-manager fills that Secret

```powershell
kubectl apply -f practice\31-ingress-tls.yaml
kubectl -n practice wait certificate/web-tls --for=condition=Ready --timeout=120s
curl.exe -sk https://web.lab.localtest.me
```

`-k` skips trusting the lab’s self-signed CA. HTTP may redirect to HTTPS (`curl.exe -skL`).

## Cleanup

```powershell
kubectl -n practice delete ingress web --ignore-not-found
kubectl -n practice delete svc web deploy web --ignore-not-found
# or wipe learning work: kubectl delete namespace practice
```

When you are done for the day: `.\scripts\lab.ps1 stop` (or `./scripts/lab.sh stop`).

## Path complete

You have walked: setup → kubectl context → namespaces → Pod → ReplicaSet → Deployment →
Service → port-forward → Ingress. Deeper topics (HPA, NetworkPolicy, GitOps, policy)
are in the lab’s `workloads/demo/README.md`.
