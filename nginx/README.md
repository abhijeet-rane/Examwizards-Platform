# Nginx — production-style edge examples

| File | Purpose |
|------|---------|
| [`../nginx.conf`](../nginx.conf) | Monolith-style: SPA static + `/api/` proxy to Spring (local/Docker). |
| [`snippets/proxy-api.conf.example`](snippets/proxy-api.conf.example) | Reusable `location /api/` proxy block for VM or container Nginx in front of the JAR. |

On **AWS**, public HTTP(S) is usually terminated at **CloudFront** and **ALB**; Nginx inside the task is optional. Keep these snippets for **preview** hosts or **lift-and-shift** patterns.
