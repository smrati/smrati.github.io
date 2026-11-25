---
title: Where kubectl is pointing
description: How kubectl chooses a cluster — kubeconfig, contexts, and kind-lab.
---

If you work with more than one cluster, you need to know which API server `kubectl`
talks to. That choice lives in your **kubeconfig** (default: `~/.kube/config` or
`%USERPROFILE%\.kube\config`).

Assumes the [kind lab](/kubernetes/01-kind-lab-setup/) exists. After `lab up`, kind
writes a context named **`kind-lab`**.

## Commands

```powershell
kubectl config view
kubectl config view --minify          # only the current context
kubectl config get-contexts
kubectl config current-context
kubectl cluster-info
```

Prefer `kubectl config view` over opening the file when you only need structure —
it often redacts cert data unless you pass `--raw`.

### Example (kind lab)

```text
kubectl config current-context
# kind-lab

kubectl config get-contexts
# CURRENT   NAME       CLUSTER    AUTHINFO   NAMESPACE
# *         kind-lab   kind-lab   kind-lab
```

`kubectl config view --minify` shows one cluster with a server like
`https://127.0.0.1:<port>` — kind maps a host port to the control plane.

## How to read kubeconfig

| Section | Meaning |
|---|---|
| `clusters` | API server URL + CA to trust |
| `users` | Your credentials (kind uses a client cert + key) |
| `contexts` | Named pairing of cluster + user (+ optional namespace) |
| `current-context` | What kubectl uses right now |

Switch if needed:

```powershell
kubectl config use-context kind-lab
```

Confirm nodes:

```powershell
kubectl get nodes
```

You should see `lab-control-plane` / `lab-worker…`.

## Security

`client-key-data` in the kubeconfig is a **private key**. Treat the file like a
password — do not commit or paste it into chats.

**Next:** [Namespaces](/kubernetes/03-namespaces/)
