# Инструкция для Tenant Controller 🎯

## ЧТО ИЗМЕНИЛОСЬ

Проект теперь использует **runtime environment variables**. Это означает что переменные окружения НЕ встраиваются в код при сборке, а читаются при запуске контейнера.

## ЧТО НУЖНО ДЕЛАТЬ В TENANT CONTROLLER

При создании/запуске контейнера для tenant'а, **обязательно передайте** эти три переменные:

```bash
NEXT_PUBLIC_API_URL=<url_вашего_backend>
NEXT_PUBLIC_SHOP_ID=<id_магазина_tenant>
NEXT_PUBLIC_BASE_URL=<домен_tenant>
```

## ПРИМЕРЫ КОДА

### Node.js (Docker SDK)

```javascript
const Docker = require('dockerode');
const docker = new Docker();

async function createTenantContainer(tenant) {
  const container = await docker.createContainer({
    Image: 'webshop:latest',
    name: `webshop-${tenant.id}`,
    Env: [
      `NEXT_PUBLIC_API_URL=${process.env.BACKEND_API_URL}`,
      `NEXT_PUBLIC_SHOP_ID=${tenant.shopId}`,
      `NEXT_PUBLIC_BASE_URL=https://${tenant.subdomain}.yourdomain.com`
    ],
    ExposedPorts: { '3000/tcp': {} },
    HostConfig: {
      PortBindings: {
        '3000/tcp': [{ HostPort: tenant.port.toString() }]
      }
    }
  });
  
  await container.start();
  return container;
}
```

### Python (docker-py)

```python
import docker

def create_tenant_container(tenant):
    client = docker.from_env()
    
    container = client.containers.run(
        'webshop:latest',
        name=f'webshop-{tenant.id}',
        environment={
            'NEXT_PUBLIC_API_URL': os.getenv('BACKEND_API_URL'),
            'NEXT_PUBLIC_SHOP_ID': tenant.shop_id,
            'NEXT_PUBLIC_BASE_URL': f'https://{tenant.subdomain}.yourdomain.com'
        },
        ports={'3000/tcp': tenant.port},
        detach=True
    )
    
    return container
```

### Kubernetes (если используете)

```yaml
# Tenant Controller генерирует этот манифест для каждого tenant
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webshop-{{ tenant_id }}
  namespace: tenants
spec:
  replicas: 1
  selector:
    matchLabels:
      app: webshop
      tenant: "{{ tenant_id }}"
  template:
    metadata:
      labels:
        app: webshop
        tenant: "{{ tenant_id }}"
    spec:
      containers:
      - name: webshop
        image: webshop:latest
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "{{ backend_api_url }}"
        - name: NEXT_PUBLIC_SHOP_ID
          value: "{{ tenant.shop_id }}"
        - name: NEXT_PUBLIC_BASE_URL
          value: "https://{{ tenant.subdomain }}.yourdomain.com"
        ports:
        - containerPort: 3000
```

## ПРОВЕРКА ЧТО ВСЕ РАБОТАЕТ

После запуска контейнера:

1. Откройте сайт tenant'а в браузере
2. Нажмите F12 → Console
3. Введите: `window.__ENV`
4. Должны увидеть:

```javascript
{
  NEXT_PUBLIC_API_URL: "https://api.yourbackend.com",
  NEXT_PUBLIC_SHOP_ID: "507f1f77bcf86cd799439011",
  NEXT_PUBLIC_BASE_URL: "https://tenant.yourdomain.com"
}
```

Если видите `undefined` или пустой объект - переменные не переданы!

## ВАЖНО! ⚠️

1. **НЕ передавайте** эти переменные в `docker build` - они НЕ нужны при сборке
2. **ВСЕГДА передавайте** их в `docker run` или в deployment манифесте
3. **Все три переменные обязательны** - без них приложение не будет работать корректно
4. Проверьте что tenant получает **свой уникальный** `NEXT_PUBLIC_SHOP_ID`

## Troubleshooting

### "API calls returning 404/401"
→ Проверьте что `NEXT_PUBLIC_API_URL` правильный и backend доступен

### "Wrong shop data showing"
→ Проверьте что каждый tenant получает свой уникальный `NEXT_PUBLIC_SHOP_ID`

### "Sitemap/SEO broken"
→ Проверьте что `NEXT_PUBLIC_BASE_URL` соответствует реальному домену tenant'а

## Тестирование локально

Используйте предоставленный скрипт:

```bash
./test-runtime-env.sh
```

Или вручную:

```bash
# Build
docker build -t webshop-test .

# Run with env vars
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8080 \
  -e NEXT_PUBLIC_SHOP_ID=test123 \
  -e NEXT_PUBLIC_BASE_URL=http://localhost:3000 \
  webshop-test
```

