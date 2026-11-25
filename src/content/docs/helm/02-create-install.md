---
title: Create and install a chart
description: Install your own Helm release from practice/helm/podinfo — upgrade, rollback, uninstall.
---

You already inspected lab platform releases. Next: install a chart **you** own so
upgrade / rollback / uninstall are safe.

The lab repo ships a tiny chart at `practice/helm/podinfo` (Deployment + Service for
podinfo, image `localhost:5001/podinfo:6.7.1`).

## Prerequisites

```powershell
.\scripts\lab.ps1 status                # RUNNING (or ./scripts/lab.sh)
kubectl config current-context          # kind-lab
```

Registry image (once):

```powershell
docker pull ghcr.io/stefanprodan/podinfo:6.7.1
docker tag  ghcr.io/stefanprodan/podinfo:6.7.1 localhost:5001/podinfo:6.7.1
docker push localhost:5001/podinfo:6.7.1
```

Work from the **kubernetes-labs** repo root.

## Chart vs release (reminder)

```powershell
helm install web ./practice/helm/podinfo -n practice --create-namespace
```

| Piece | Value | Meaning |
|---|---|---|
| Release name | `web` | This install (`helm upgrade` / `uninstall` use it) |
| Chart | `./practice/helm/podinfo` | Local chart directory |
| Namespace | `practice` | Where objects are created |

Same pattern as `helm install my-site bitnami/wordpress`.

## Install and inspect

```powershell
helm install web ./practice/helm/podinfo -n practice --create-namespace
helm list -n practice
helm status web -n practice
helm history web -n practice
kubectl -n practice get deploy,svc,pods -l app.kubernetes.io/instance=web
```

Expect **revision 1**, status **deployed**.

See YAML Helm would apply (no install):

```powershell
helm template web ./practice/helm/podinfo -n practice
```

Call the app (Service name is `web-podinfo`):

```powershell
kubectl -n practice run curl --rm -it --image=curlimages/curl --restart=Never -- curl -s http://web-podinfo
```

## Values and upgrade

Defaults live in `practice/helm/podinfo/values.yaml` (`replicaCount`, `message`, image, …).

```powershell
helm get values web -n practice
helm upgrade web ./practice/helm/podinfo -n practice --set message="hello from helm - v2"
helm history web -n practice
kubectl -n practice run curl --rm -it --image=curlimages/curl --restart=Never -- curl -s http://web-podinfo
```

History should show **revision 2**. The UI message in JSON should change.

```text
chart defaults + --set / -f  →  new revision on this release only
```

## Rollback

```powershell
helm rollback web 1 -n practice
helm history web -n practice
```

Release goes back to revision 1’s config (you’ll see a new revision entry that restores it).

## Uninstall

```powershell
helm uninstall web -n practice
```

Removes the release and its objects. Does **not** touch `argocd`, `cilium`, etc.

```powershell
# optional cleanup of the namespace
kubectl delete namespace practice
```

## Chart layout

```text
practice/helm/podinfo/
  Chart.yaml       # chart name + version
  values.yaml      # defaults
  templates/       # Deployment, Service, helpers, NOTES
```

**Next:** [Chart.yaml fields](/helm/03-chart-yaml/)

**Previous:** [Releases](/helm/01-releases/)
