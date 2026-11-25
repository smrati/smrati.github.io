---
title: Set up the kind lab
description: Install tools and create the kind Kubernetes lab on Windows, macOS, or Linux.
---

The lab is a local, production-shaped Kubernetes cluster on [kind](https://kind.sigs.k8s.io/)
(real kubeadm clusters inside Docker). Versions are pinned so everyone who clones the
repo gets the same environment.

| | Windows | macOS / Linux |
|---|---|---|
| Script | `.\scripts\lab.ps1` | `./scripts/lab.sh` |
| Options | `-Profile light`, `-All` | `--profile light`, `--all` |

Both scripts share config: `lab.env` and `platform/components.conf`.

## 1. Install the tools

Tested pins: **kind 0.33.0** (Kubernetes **1.37.0**), kubectl ~1.37, Helm 4.3 (Helm 3 works).
`lab doctor` warns on mismatches and prints the install command for anything missing.

### Windows 10/11

PowerShell; open a **new** terminal afterwards:

```powershell
winget install Docker.DockerDesktop      # choose the WSL2 backend, then start Docker Desktop
winget install Git.Git
winget install Kubernetes.kind --version 0.33.0
winget install Kubernetes.kubectl
winget install Helm.Helm
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned   # allow running the repo scripts
```

Docker memory comes from WSL2. Set `%USERPROFILE%\.wslconfig`, then `wsl --shutdown`
and restart Docker Desktop:

```ini
[wsl2]
memory=16GB   # light profile; use 20GB+ for full
```

### macOS (Intel or Apple Silicon)

```bash
brew install --cask docker     # or OrbStack / Colima; start it once
brew install kind kubectl helm git
```

Docker Desktop → Settings → Resources: at least 4 CPUs and **6 GB** (light) or **14 GB** (full) memory.

### Linux

amd64 shown; use `arm64` binaries on ARM.

```bash
# Docker Engine: https://docs.docker.com/engine/install/ then:
sudo usermod -aG docker $USER            # log out and back in
curl -Lo kind https://kind.sigs.k8s.io/dl/v0.33.0/kind-linux-amd64 && chmod +x kind && sudo mv kind /usr/local/bin/
curl -LO https://dl.k8s.io/release/v1.37.0/bin/linux/amd64/kubectl && chmod +x kubectl && sudo mv kubectl /usr/local/bin/
curl -fsSL https://get.helm.sh/helm-v4.3.2-linux-amd64.tar.gz | tar xz && sudo mv linux-amd64/helm /usr/local/bin/
# multi-node kind needs higher inotify limits (doctor checks this):
echo -e "fs.inotify.max_user_instances=512\nfs.inotify.max_user_watches=524288" | sudo tee /etc/sysctl.d/99-kind.conf && sudo sysctl --system
```

Use **rootful** Docker: rootless Docker and Podman cannot publish ports 80/443 without extra setup.

## 2. Clone and start

Cloning the **kubernetes-labs** repository is how you get `scripts/lab.sh`, `scripts/lab.ps1`, and the `practice/` manifests. Use your kubernetes-labs Git URL in place of `<repo-url>` once the remote exists.

```bash
git clone <repo-url> kubernetes-labs && cd kubernetes-labs
./scripts/lab.sh doctor --profile light    # fix any [FAIL] lines
./scripts/lab.sh up --profile light
```

Windows:

```powershell
git clone <repo-url> kubernetes-labs; cd kubernetes-labs
.\scripts\lab.ps1 doctor -Profile light
.\scripts\lab.ps1 up -Profile light
```

`up` creates the cluster and installs the profile’s platform tools (light ~4 min;
full ~15–20 min, mostly downloads).

## Daily commands

```bash
./scripts/lab.sh doctor
./scripts/lab.sh up --profile full     # or light
./scripts/lab.sh stop                  # pause: free RAM, keep state
./scripts/lab.sh start                 # resume
./scripts/lab.sh status
./scripts/lab.sh destroy [--all]       # wipe cluster (--all also removes local registry)
```

Windows: `.\scripts\lab.ps1` with `-Profile light` / `-All`.

## Requirements

| | light | full |
|---|---|---|
| Nodes | 1 control plane + 2 workers | 3 control planes + 3 workers (3 zones) |
| Docker memory | 6 GB+ | 14 GB+ (uses ~10 GB) |
| CPUs | 4+ | 4+ (8+ recommended) |
| Disk | ~15 GB | ~30 GB |

Host ports **80**, **443** (ingress) and **5001** (registry) must be free. They bind to `127.0.0.1` only.

| Profile | Tools |
|---|---|
| `light` | Cilium, metrics-server, ingress-nginx, cert-manager |
| `full` (default) | light + MetalLB, Prometheus/Grafana/Alertmanager, Loki, Argo CD, Kyverno |

`*.lab.localtest.me` resolves to `127.0.0.1` — no hosts-file edits.

## Gotchas

- Pause with **`lab stop`**, not by quitting Docker — otherwise control-plane IPs can shift and etcd TLS breaks. `stop`/`start` re-pin IPs from `.state/node-ips.env`.
- Bring a stopped node back with **`lab start`**, not raw `docker start`.
- Local registry stays up with Docker (`localhost:5001`) unless you `destroy --all` / `-All`.
- Only one cluster named `lab` per machine (`CLUSTER_NAME` in `lab.env`).

**Next:** [Where kubectl is pointing](/kubernetes/02-kubectl-context/)
