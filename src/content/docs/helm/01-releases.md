---
title: Releases
description: Chart vs release vs revision — inspect Helm releases already installed on the kind lab.
---

A **release** is a named, installed instance of a chart. The chart is the package;
the release is “this install of that package.”

```text
helm install <release-name> <chart>
```

Example from Helm’s own docs style:

```bash
helm install my-site bitnami/wordpress
helm install my-SECOND-site bitnami/wordpress
```

Same chart twice → two releases → two sets of Kubernetes objects, each with its
**own** revision history. Upgrading `my-site` does not change `my-SECOND-site`.

## Prerequisites

```powershell
.\scripts\lab.ps1 status                # RUNNING (or ./scripts/lab.sh status)
kubectl config current-context          # kind-lab
helm version
```

Your full lab profile already installed several charts as releases via `lab up`.
You will **inspect** those — do not uninstall them.

## List releases

```powershell
helm list -A
```

Example shape (your names may match the lab):

| NAME | NAMESPACE | REVISION | STATUS | CHART |
|---|---|---|---|---|
| argocd | argocd | 1 | deployed | argo-cd-… |
| cilium | kube-system | 1 | deployed | cilium-… |
| kps | monitoring | 1 | deployed | kube-prometheus-stack-… |
| ingress-nginx | ingress-nginx | 1 | deployed | ingress-nginx-… |

Each **row** is one release — the same idea as `my-site` vs `my-SECOND-site`, but
here each row is usually a **different** chart installed once.

| Column | Meaning |
|---|---|
| NAME | Release name (`helm upgrade` / `helm uninstall` use this) |
| NAMESPACE | Where that release’s resources live |
| REVISION | Install/upgrade counter (1 = first install) |
| STATUS | `deployed` means the install succeeded |
| CHART | Chart name + chart version |

## Inspect one release

Pick a lab release, e.g. Argo CD:

```powershell
helm status argocd -n argocd
helm history argocd -n argocd
helm get values argocd -n argocd
helm get values argocd -n argocd --all
```

- `status` — summary and notes  
- `history` — revisions for **this** release only  

### Values: overrides vs everything

```powershell
helm get values argocd -n argocd
helm get values argocd -n argocd --all
```

| Command | What you see |
|---|---|
| `helm get values …` | Only values **you** (or the lab install) set — the overrides |
| `helm get values … --all` | Overrides **merged with** the chart’s defaults — the full effective config |

Without `--all`, a mostly-default install can look almost empty. With `--all`, you get a
long dump (images, replicas, ingress flags, and so on).

```text
chart defaults  +  your values file / --set  =  what --all shows
                      ↑
              what plain get values shows
```

On this lab, `lab up` installed Argo CD with something like
`helm upgrade --install … -f platform/values/argocd.yaml`. Those `-f` keys are what the
short `get values` shows; everything else comes from the chart’s built-in `values.yaml`
and appears only with `--all`.

Another useful release from the monitoring stack:

```powershell
helm status kps -n monitoring
helm history kps -n monitoring
```

(`kps` is the release name for the kube-prometheus-stack chart in this lab.)

## What not to do (yet)

Do **not** run `helm uninstall` on lab platform releases (`cilium`, `ingress-nginx`,
`argocd`, `kps`, …). That removes cluster tooling.

When you create your own chart, install it under a **new** release name in a
practice namespace (files will live in the lab repo’s `practice/helm/`).

## Tie-back

| Course slide | On your lab |
|---|---|
| `helm install my-site bitnami/wordpress` | e.g. release `argocd` from chart `argo-cd` |
| Second install, different name | Second row in `helm list -A` (different chart/name) |
| Revision 1 / 2 / 3 | `helm history <release> -n <ns>` |

**Next:** [Create and install a chart](/helm/02-create-install/)
