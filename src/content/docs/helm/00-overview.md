---
title: Overview
description: Helm learning path on the kind lab — charts, releases, and revisions.
---

[Helm](https://helm.sh/) is the package manager for Kubernetes. A **chart** is a
packaged set of templated manifests; installing a chart creates a named **release**
in the cluster.

These notes assume the same [kind lab](/kubernetes/01-kind-lab-setup/) used in the
Kubernetes track: lab **RUNNING**, kubectl context `kind-lab`.

## What you will learn

| Step | Topic |
|---|---|
| 1 | [Releases](/helm/01-releases/) — chart vs release vs revision; inspect lab installs |
| 2 | [Create and install a chart](/helm/02-create-install/) — your own release, upgrade, rollback |
| 3 | [Chart.yaml fields](/helm/03-chart-yaml/) — chart identity, version vs appVersion, dependencies |
| 4 | [CLI basics](/helm/04-cli-basics/) — help, search, repo, lifecycle, inspect, debug |

Hands-on charts you create yourself will live in the lab repo under `practice/helm/`
(separate from plain YAML under `practice/kubernetes/`).

## Mental model

```text
Chart  →  helm install <release-name> <chart>  →  Release (revision 1, 2, 3…)
                                                      ↓
                                              Kubernetes objects
```

| Term | Meaning |
|---|---|
| Chart | The package/templates (can install many times) |
| Release | One named install of a chart |
| Revision | Version history for **that** release (`upgrade` / `rollback`) |

**Next:** [Releases](/helm/01-releases/) → then [Create and install a chart](/helm/02-create-install/)
