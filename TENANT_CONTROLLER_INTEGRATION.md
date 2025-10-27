# Интеграция с Tenant Controller

## Как работает runtime env в этом проекте

Проект настроен для получения переменных окружения в **runtime** (при запуске контейнера), а не в build time. Это означает:

✅ Один Docker образ для всех tenants  
✅ Каждый tenant получает свои настройки через env переменные  
✅ Не нужно пересобирать образ для каждого tenant  

## Что нужно передавать из Tenant Controller

При создании/запуске контейнера для каждого tenant, ваш Tenant Controller должен передать следующие переменные окружения:

```bash
# Обязательные переменные
NEXT_PUBLIC_API_URL=https://api.yourbackend.com
NEXT_PUBLIC_SHOP_ID=<tenant_shop_id>
NEXT_PUBLIC_BASE_URL=https://tenant.yourdomain.com
```

## Пример интеграции с Tenant Controller

### Если используете Docker API напрямую

```javascript
// В вашем tenant controller
const containerConfig = {
  Image: 'webshop:latest',
  Env: [
    `NEXT_PUBLIC_API_URL=${tenantConfig.apiUrl}`,
    `NEXT_PUBLIC_SHOP_ID=${tenant.shopId}`,
    `NEXT_PUBLIC_BASE_URL=https://${tenant.subdomain}.yourdomain.com`
  ],
  ExposedPorts: {
    '3000/tcp': {}
  },
  HostConfig: {
    PortBindings: {
      '3000/tcp': [{ HostPort: tenant.assignedPort.toString() }]
    }
  }
};

const container = await docker.createContainer(containerConfig);
await container.start();
```

### Если используете Kubernetes

```yaml
# Tenant Controller создает Deployment для каждого tenant
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webshop-{{ tenant_id }}
spec:
  template:
    spec:
      containers:
      - name: webshop
        image: webshop:latest
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "{{ tenant.api_url }}"
        - name: NEXT_PUBLIC_SHOP_ID
          value: "{{ tenant.shop_id }}"
        - name: NEXT_PUBLIC_BASE_URL
          value: "https://{{ tenant.subdomain }}.yourdomain.com"
        ports:
        - containerPort: 3000
```

### Если используете docker-compose динамически

```javascript
// Tenant Controller генерирует docker-compose.yml для каждого tenant
const composeYaml = `
version: '3.8'
services:
  webshop-${tenant.id}:
    image: webshop:latest
    container_name: webshop-${tenant.id}
    ports:
      - "${tenant.port}:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${tenant.apiUrl}
      - NEXT_PUBLIC_SHOP_ID=${tenant.shopId}
      - NEXT_PUBLIC_BASE_URL=https://${tenant.subdomain}.yourdomain.com
    restart: unless-stopped
`;

fs.writeFileSync(`/path/to/tenant-${tenant.id}/docker-compose.yml`, composeYaml);
```

## Проверка работы

После запуска контейнера, проверьте что переменные доступны:

1. Откройте браузер и зайдите на сайт tenant'а
2. Откройте Developer Tools (F12) → Console
3. Введите: `window.__ENV`
4. Вы должны увидеть объект с вашими переменными:

```javascript
{
  NEXT_PUBLIC_API_URL: "https://api.yourbackend.com",
  NEXT_PUBLIC_SHOP_ID: "507f1f77bcf86cd799439011",
  NEXT_PUBLIC_BASE_URL: "https://tenant.yourdomain.com"
}
```

## Что изменилось в проекте

1. Добавлен `next-runtime-env` пакет
2. Создан `src/lib/env.ts` с helper функциями
3. Добавлен `<PublicEnvScript />` в `src/app/layout.tsx`
4. Обновлены все места использования env переменных:
   - `src/api/axios.ts` - использует `getApiUrl()`
   - `src/api/webshop-api.ts` - использует `getShopId()`
   - `src/app/sitemap.ts` - использует `getBaseUrl()`
   - `src/app/robots.ts` - использует `getBaseUrl()`
   - `src/lib/cookie-utils.ts` - использует `getApiUrl()`

## Важные моменты

⚠️ **Не удаляйте `<PublicEnvScript />`** из layout.tsx - без него переменные не будут доступны на клиенте  
⚠️ **Всегда передавайте все три переменные** - они критичны для работы приложения  
⚠️ **Используйте HTTPS** в production для NEXT_PUBLIC_BASE_URL  

## Troubleshooting

### Проблема: "Cannot read properties of undefined"
**Решение**: Убедитесь что Tenant Controller передает все три переменные окружения

### Проблема: "API calls fail with CORS error"
**Решение**: Проверьте что NEXT_PUBLIC_API_URL указывает на правильный backend с настроенным CORS

### Проблема: "window.__ENV is undefined"
**Решение**: Проверьте что `<PublicEnvScript />` присутствует в layout.tsx

