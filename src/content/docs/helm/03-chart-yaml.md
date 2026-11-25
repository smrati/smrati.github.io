---
title: Chart.yaml fields
description: What each field in Chart.yaml means — WordPress-style charts vs the lab podinfo chart.
---

`Chart.yaml` is the chart’s **identity card**: name, versions, optional metadata, and
dependencies. It is not where you set replicas or images — those belong in
`values.yaml`. Templates under `templates/` are the Kubernetes manifests.

```text
Chart.yaml   →  who/what version is this package?
values.yaml  →  knobs (replicas, image, flags)
templates/   →  rendered Kubernetes YAML
```

You already installed the lab chart at `practice/helm/podinfo`. Open
`practice/helm/podinfo/Chart.yaml` while reading this page.

## Core fields

| Field | Meaning |
|---|---|
| `apiVersion` | Chart format. `v2` means a Helm 3 chart |
| `name` | Chart name (package id), e.g. `wordpress` or `podinfo` |
| `description` | Short human summary |
| `type` | `application` = installable app; `library` = helpers only (not installed alone) |
| `version` | **Chart** version (SemVer). Bump when templates/values packaging change |
| `appVersion` | Version of the **application** the chart deploys (informational) |

**Chart `version` ≠ `appVersion`.** Example from a typical Bitnami WordPress chart:
chart `version: 12.1.27` can ship WordPress `appVersion: 5.8.1`. Bump `version` when
the chart changes; update `appVersion` when the app/image it targets changes.

### Lab podinfo (minimal)

```yaml
apiVersion: v2
name: podinfo
description: Tiny practice chart for the kind lab (podinfo web app)
type: application
version: 0.1.0
appVersion: "6.7.1"
```

Enough to `helm install`. No marketplace metadata, no dependencies.

## Optional metadata (public charts)

Common on charts you find on [Artifact Hub](https://artifacthub.io):

| Field | Meaning |
|---|---|
| `keywords` | Search tags (`blog`, `wordpress`, …) |
| `maintainers` | Who supports the chart (name / email) |
| `home` | Project or chart homepage URL |
| `icon` | Logo URL for UIs |

Helpful for discovery; not required for a local practice chart.

## Dependencies

A chart can pull in **other charts** as subcharts:

```yaml
dependencies:
  - name: mariadb
    version: 9.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: mariadb.enabled
```

| Piece | Meaning |
|---|---|
| `name` | Subchart to include |
| `version` | Allowed chart version (or range) |
| `repository` | Where Helm downloads that chart |
| `condition` | Install only if that values path is true (e.g. `mariadb.enabled`) |

So `helm install my-site bitnami/wordpress` can also install MariaDB unless you set
`mariadb.enabled: false` in values.

After editing `dependencies`, chart authors run:

```powershell
helm dependency update ./path/to/chart
```

Downloaded subcharts land under `charts/`. The lab `podinfo` chart has **no**
`dependencies` block — single app only.

## Side by side

| | Bitnami-style WordPress | Lab `podinfo` |
|---|---|---|
| Core identity | Yes | Yes |
| `keywords` / `maintainers` / `home` / `icon` | Yes | No |
| `dependencies` (e.g. MariaDB) | Yes | No |
| Purpose | Production-shaped public chart | Learning chart |

## Where this sits in the path

1. [Releases](/helm/01-releases/) — inspect installs  
2. [Create and install a chart](/helm/02-create-install/) — install `podinfo`  
3. **This page** — read `Chart.yaml` with understanding  

**Previous:** [Create and install a chart](/helm/02-create-install/)

**Next:** [CLI basics](/helm/04-cli-basics/)
