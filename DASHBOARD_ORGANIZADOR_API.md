# Dashboard do Organizador — Guia de Integração

Base URL produção: `https://api-3sxev7xp7q-uc.a.run.app`

---

## Autenticação

Todas as rotas exigem o header:
```
Authorization: Bearer {token}
```

O token é obtido no login:

```http
POST /api/modules/auth/login
Content-Type: application/json

{
  "identifier": "email@parque.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "userId": "abc123",
      "email": "email@parque.com",
      "name": "João Parque",
      "role": "user"
    }
  }
}
```

---

## 1. Meus Eventos

Lista todos os eventos vinculados ao organizador autenticado.

```http
GET /api/wallet/meus-eventos
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "total": 2,
  "data": [
    {
      "id": "XtjYZugzj9vWU3T5O2xu",
      "nome": "Vaquejada Parque Otaviano 2026",
      "status": "active",
      "local": "Parque Otaviano Pessoa - Fortaleza/CE",
      "startDate": "2026-05-10T00:00:00.000Z",
      "endDate": "2026-05-12T00:00:00.000Z",
      "valorSenha": 900
    }
  ]
}
```

---

## 2. Relatório de Vendas de um Evento

Retorna todas as senhas vendidas, resumo financeiro e detalhamento por dia/método.
Só retorna dados se o evento pertencer ao organizador autenticado (403 caso contrário).

```http
GET /api/wallet/vendas/{eventId}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "evento": {
    "id": "XtjYZugzj9vWU3T5O2xu",
    "nome": "Vaquejada Parque Otaviano 2026",
    "status": "active",
    "local": "Parque Otaviano Pessoa - Fortaleza/CE",
    "valorSenha": 900
  },
  "resumo": {
    "totalVendas": 42,
    "totalPagas": 40,
    "totalAguardando": 2,
    "totalArrecadadoBruto": 37800.00,
    "taxaPlataforma": 1134.00,
    "totalLiquido": 36666.00,
    "resumoPorDia": {
      "quarta-feira": { "pagas": 15, "aguardando": 1, "arrecadado": 13500.00 },
      "quinta-feira": { "pagas": 14, "aguardando": 1, "arrecadado": 12600.00 },
      "sexta-feira":  { "pagas": 11, "aguardando": 0, "arrecadado": 9900.00 }
    },
    "resumoPorMetodo": {
      "PIX_EFI":    25200.00,
      "BOLETO_EFI": 9000.00,
      "CREDIT_CARD": 3600.00
    }
  },
  "vendas": [
    {
      "dia": "quarta-feira",
      "senha": 42,
      "vaqueiro": "Marcos Silva",
      "categoria": "Amador",
      "cavaloPuxa": "Relâmpago RMV",
      "cavaloEsteira": "Trovão do Vale",
      "nomeEsteira": "Haras Estrela",
      "userId": "lDBqQYavevsxwFOCmR6M",
      "paymentId": "VAQ1775089018420XPYBQX813G",
      "metodoPagamento": "PIX_EFI",
      "statusPagamento": "PAGO",
      "valor": 900,
      "horario": "2026-04-01T21:16:58.000Z",
      "pagamentoConfirmadoEm": "2026-04-01T21:17:19.000Z"
    }
  ]
}
```

> **statusPagamento possíveis:** `PAGO`, `CONFIRMADA`, `AGUARDANDO`, `EXPIRADO`

---

## 3. Saldo da Wallet

```http
GET /api/wallet/saldo
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "eventOwnerId": "abc123",
    "saldoDisponivel": 36666.00,
    "saldoPendente": 0,
    "totalRecebido": 36666.00,
    "totalSacado": 0
  }
}
```

---

## 4. Histórico de Créditos (todas as vendas creditadas)

```http
GET /api/wallet/transacoes
GET /api/wallet/transacoes?limit=100
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "total": 40,
  "data": [
    {
      "id": "txId123",
      "eventId": "XtjYZugzj9vWU3T5O2xu",
      "paymentId": "VAQ17750...",
      "senhas": [1, 2],
      "dia": "quarta-feira",
      "valorBruto": 1800.00,
      "taxaPlataforma": 54.00,
      "valorLiquido": 1746.00,
      "tipo": "CREDITO",
      "status": "DISPONIVEL",
      "descricao": "2 senha(s) vendida(s) — quarta-feira",
      "createdAt": "2026-04-01T21:17:20.000Z"
    }
  ]
}
```

---

## 5. Créditos de um Evento Específico

```http
GET /api/wallet/transacoes/{eventId}
Authorization: Bearer {token}
```

Mesma estrutura da rota acima, filtrada por evento.

---

## 6. Solicitar Saque

```http
POST /api/wallet/saque
Authorization: Bearer {token}
Content-Type: application/json

{
  "valor": 36666.00,
  "chavePix": "email@parque.com",
  "tipoChave": "EMAIL",
  "nomeTitular": "João Parque LTDA"
}
```

> `tipoChave` aceita: `CPF`, `CNPJ`, `EMAIL`, `TELEFONE`, `ALEATORIA`

**Resposta sucesso:**
```json
{
  "success": true,
  "saqueId": "saqueXyz123",
  "message": "Saque solicitado com sucesso"
}
```

**Resposta saldo insuficiente (400):**
```json
{
  "success": false,
  "error": "Saldo insuficiente. Disponível: R$ 500.00"
}
```

---

## 7. Histórico de Saques

```http
GET /api/wallet/saques
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "total": 1,
  "data": [
    {
      "id": "saqueXyz123",
      "valor": 36666.00,
      "chavePix": "email@parque.com",
      "tipoChave": "EMAIL",
      "nomeTitular": "João Parque LTDA",
      "status": "SOLICITADO",
      "createdAt": "2026-04-02T10:00:00.000Z"
    }
  ]
}
```

> **Status do saque:** `SOLICITADO` → `PROCESSANDO` → `PAGO` | `FALHOU` | `CANCELADO`

---

## Rotas Admin (somente role: `admin`)

### Listar saques pendentes
```http
GET /api/wallet/admin/saques-pendentes
Authorization: Bearer {token_admin}
```

### Atualizar status de um saque
```http
PATCH /api/wallet/admin/saque/{saqueId}
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "status": "PAGO",
  "observacao": "PIX enviado às 14h"
}
```

> `status` aceita: `PROCESSANDO`, `PAGO`, `FALHOU`, `CANCELADO`
> Se `FALHOU` ou `CANCELADO`, o saldo é devolvido automaticamente ao organizador.

### Ver todas as wallets
```http
GET /api/wallet/admin/wallets
Authorization: Bearer {token_admin}
```

---

## Fluxo sugerido para o Dashboard

```
1. Login → guarda token
2. GET /api/wallet/meus-eventos → lista os eventos do organizador
3. Usuário seleciona um evento
4. GET /api/wallet/vendas/{eventId} → mostra tabela de vendas + resumo financeiro
5. GET /api/wallet/saldo → mostra saldo disponível para saque
6. Usuário clica em "Solicitar Saque"
7. POST /api/wallet/saque → exibe confirmação
8. GET /api/wallet/saques → mostra histórico de saques e status atual
```

---

## Campos de statusPagamento para filtros na tabela

| Valor | Significado |
|---|---|
| `PAGO` | Confirmado via ASAAS/EFI |
| `CONFIRMADA` | Confirmado via webhook EFI |
| `AGUARDANDO` | PIX/Boleto gerado, aguardando pagamento |
| `EXPIRADO` | Não pagou no prazo — senha foi liberada |

---

## Observações

- O `taxaPlataforma` (3%) já é descontado automaticamente no momento da confirmação do pagamento
- O `totalLiquido` no resumo é o que o organizador tem direito a receber
- O saldo na wallet é creditado imediatamente após confirmação do pagamento
- Não há delay entre pagamento confirmado e saldo disponível para saque
