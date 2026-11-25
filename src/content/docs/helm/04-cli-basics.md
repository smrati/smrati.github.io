---
title: CLI basics
description: Helm commands to keep top of mind — help, search, repo, install lifecycle, inspect, and debug.
---

Everyday Helm CLI on the kind lab. Use this as a cheat sheet; deeper release theory is in
[Releases](/helm/01-releases/), and install practice uses [`practice/helm/podinfo`](/helm/02-create-install/).

**Prerequisites:** lab **RUNNING**, context `kind-lab`, Helm installed ([lab setup](/kubernetes/01-kind-lab-setup/)).

## Cheat sheet

| Command | Remember for |
|---|---|
| `helm help` / `helm <cmd> --help` | Built-in docs |
| `helm version` | Client version check |
| `helm search hub` / `helm search repo` | Find charts (Hub vs local repos) |
| `helm repo add\|list\|update\|remove` | Chart repositories |
| `helm show chart\|values\|readme` | Peek before install |
| `helm install` / `upgrade` / `upgrade --install` | Create or change a release |
| `helm list` / `list -A` | What is installed |
| `helm status` / `history` | One release’s health and revisions |
| `helm get values` / `--all` / `get manifest` | Overrides vs full config vs applied YAML |
| `helm template` / `helm lint` | Render / sanity-check without (or before) install |
| `helm rollback` / `helm uninstall` | Undo revision / remove release |

## Safety

Uninstall **only** practice releases (e.g. `web` in namespace `practice`).

Do **not** `helm uninstall` lab platform releases: `argocd`, `cilium`, `ingress-nginx`, `kps`, `kyverno`, `loki`, `metallb`, `metrics-server`, `cert-manager`, …

## Help

```powershell
helm help
helm install --help
helm version
```

## Discover charts

### Artifact Hub

```powershell
helm search hub wordpress
helm search hub wordpress --max-col-width 0
```

`search hub` queries [Artifact Hub](https://artifacthub.io). It finds charts; you still
`helm repo add` (or use a chart URL) before a normal install from a repository.

### Repositories

```powershell
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo list
helm repo update
helm search repo wordpress
helm show chart bitnami/wordpress
helm show values bitnami/wordpress
# helm show readme bitnami/wordpress
```

`search repo` uses **your local repo cache** (after `add` / `update`), not the Hub website.

A local chart path needs **no** repo:

```powershell
helm install web ./practice/helm/podinfo -n practice --create-namespace
```

Optional cleanup of a practice repo alias (does not affect the cluster):

```powershell
helm repo remove bitnami
```

## Release lifecycle

Flags to keep in muscle memory: `-n`, `--create-namespace`, `-f values.yaml`, `--set key=value`,
`--dry-run`, `--debug`.

```powershell
# install
helm install web ./practice/helm/podinfo -n practice --create-namespace

# change config (new revision)
helm upgrade web ./practice/helm/podinfo -n practice --set message="hello from helm - v2"

# create or upgrade in one shot (common habit)
helm upgrade --install web ./practice/helm/podinfo -n practice --create-namespace

# preview without applying
helm upgrade --install web ./practice/helm/podinfo -n practice --dry-run --debug

# undo to an older revision
helm rollback web 1 -n practice

# remove the release (practice only!)
helm uninstall web -n practice
```

## List and inspect

```powershell
helm list -n practice
helm list -A

helm status web -n practice
helm history web -n practice

helm get values web -n practice              # overrides only
helm get values web -n practice --all        # defaults + overrides
helm get manifest web -n practice            # YAML Helm last applied
```

Platform example (read-only):

```powershell
helm list -A
helm status argocd -n argocd
helm history argocd -n argocd
```

More on values vs `--all`: [Releases](/helm/01-releases/).

## Debug and render

```powershell
# render templates to stdout (no cluster write)
helm template web ./practice/helm/podinfo -n practice

# check chart structure / common mistakes
helm lint ./practice/helm/podinfo
```

## Mental model

```text
search hub / repo / show     →  pick a chart
install / upgrade            →  release + revisions
list / status / history / get →  see what you have
template / lint / dry-run    →  debug before or without apply
rollback / uninstall         →  recover or remove
```

**Previous:** [Chart.yaml fields](/helm/03-chart-yaml/)
