# Dashboard do Organizador — Guia de Integração

Base URL produção: `https://api-3sxev7xp7q-uc.a.run.app`

---

## Autenticação

Todas as rotas exigem o header:
```
Authorization: Bearer {token}
```

Login para obter o token:

```http
POST /api/auth/login
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
      "id": "PZAznWeQMM7ZRdhLCl8Q",
      "name": "admin",
      "email": "email@parque.com",
      "role": "admin"
    }
  }
}
```

> O `token` deve ser enviado em todas as chamadas como `Authorization: Bearer {token}`.

---

## ⚠️ Pré-requisito: evento precisa ter `organizerId`

Eventos criados **antes** de 02/04/2026 não têm `organizerId`. Eles **não aparecem** em `meus-eventos` e retornam erro 403 em `vendas/:eventId`.

**Para vincular um evento antigo ao parque, use (somente admin):**

```http
PATCH /api/wallet/admin/evento/{eventId}/organizador
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "organizerId": "PZAznWeQMM7ZRdhLCl8Q"
}
```

Resposta:
```json
{
  "success": true,
  "message": "Evento 8PSxxFQJZboSjV7FlZRJ vinculado ao organizador PZAznWeQMM7ZRdhLCl8Q"
}
```

Eventos **novos** já recebem o `organizerId` automaticamente na criação.

---

## 1. Meus Eventos

Lista todos os eventos onde `organizerId` é igual ao `userId` do token.

```http
GET /api/wallet/meus-eventos
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "total": 1,
  "data": [
    {
      "id": "8PSxxFQJZboSjV7FlZRJ",
      "nome": "5ª Vaquejada Genesio Araujo",
      "status": "active",
      "local": "5ª Vaquejada Genesio Araujo",
      "startDate": { "_seconds": 1754352000, "_nanoseconds": 0 },
      "endDate":   { "_seconds": 1754697600, "_nanoseconds": 0 },
      "valorSenha": 900
    }
  ]
}
```

> `startDate` e `endDate` vêm como objeto Firestore Timestamp. Converter no front:
> ```js
> new Date(startDate._seconds * 1000).toLocaleDateString('pt-BR')
> ```

---

## 2. Relatório de Vendas de um Evento

Retorna todas as senhas do evento com resumo financeiro por dia e por método.
**Retorna 403 se o evento não pertencer ao organizador do token.**

```http
GET /api/wallet/vendas/{eventId}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "evento": {
    "id": "8PSxxFQJZboSjV7FlZRJ",
    "nome": "5ª Vaquejada Genesio Araujo",
    "status": "active",
    "local": "5ª Vaquejada Genesio Araujo",
    "startDate": { "_seconds": 1754352000, "_nanoseconds": 0 },
    "endDate":   { "_seconds": 1754697600, "_nanoseconds": 0 },
    "valorSenha": 900
  },
  "resumo": {
    "totalVendas": 6,
    "totalPagas": 6,
    "totalAguardando": 0,
    "totalArrecadadoBruto": 5400.00,
    "taxaPlataforma": 162.00,
    "totalLiquido": 5238.00,
    "resumoPorDia": {
      "quarta-feira": { "pagas": 2, "aguardando": 0, "arrecadado": 1800.00 },
      "quinta-feira": { "pagas": 2, "aguardando": 0, "arrecadado": 1800.00 },
      "sexta-feira":  { "pagas": 1, "aguardando": 0, "arrecadado": 900.00 },
      "sabado":       { "pagas": 1, "aguardando": 0, "arrecadado": 900.00 }
    },
    "resumoPorMetodo": {
      "PIX_EFI": 3600.00,
      "Direto":  1800.00
    }
  },
  "vendas": [
    {
      "dia": "quarta-feira",
      "senha": 25,
      "vaqueiro": "João Silva",
      "categoria": "Profissional",
      "cavaloPuxa": "Relâmpago RMV",
      "cavaloEsteira": "Trovão do Vale",
      "nomeEsteira": "Haras Estrela",
      "userId": "lDBqQYavevsxwFOCmR6M",
      "paymentId": "VAQ1775089018420XPYBQX813G",
      "metodoPagamento": "PIX_EFI",
      "statusPagamento": "PAGO",
      "valor": 900,
      "horario": "2026-04-02T18:19:32.000Z",
      "pagamentoConfirmadoEm": "2026-04-02T18:19:55.000Z"
    },
    {
      "dia": "quinta-feira",
      "senha": 170,
      "vaqueiro": "Pedro Santos",
      "categoria": "Amador",
      "cavaloPuxa": "Cavalo A",
      "cavaloEsteira": "Cavalo B",
      "nomeEsteira": "Haras XYZ",
      "userId": "lDBqQYavevsxwFOCmR6M",
      "paymentId": null,
      "metodoPagamento": "Direto",
      "statusPagamento": "PAGO",
      "valor": 0,
      "horario": "2026-04-02T18:19:33.000Z",
      "pagamentoConfirmadoEm": null
    }
  ]
}
```

**Sobre `metodoPagamento`:**

| Valor | Origem |
|---|---|
| `PIX_EFI` | Pago via PIX pelo app |
| `BOLETO_EFI` | Boleto bancário |
| `Direto` | Reserva feita manualmente pelo admin/secretaria |

**Sobre `statusPagamento`:**

| Valor | Significado |
|---|---|
| `PAGO` | Confirmado via EFI/ASAAS |
| `CONFIRMADA` | Confirmado via webhook EFI |
| `AGUARDANDO` | PIX/Boleto gerado, aguardando pagamento |
| `EXPIRADO` | Não pagou no prazo — senha foi liberada |

> Reservas diretas (`Direto`) têm `valor: 0` e `pagamentoConfirmadoEm: null` por definição.

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
    "eventOwnerId": "PZAznWeQMM7ZRdhLCl8Q",
    "saldoDisponivel": 5238.00,
    "saldoPendente": 0,
    "totalRecebido": 5238.00,
    "totalSacado": 0
  }
}
```

> Saldo é creditado automaticamente a cada pagamento PIX/boleto confirmado. Reservas diretas (`valor: 0`) não geram crédito.

---

## 4. Histórico de Transações

```http
GET /api/wallet/transacoes
GET /api/wallet/transacoes?limit=100
Authorization: Bearer {token}
```

```http
GET /api/wallet/transacoes/{eventId}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "total": 4,
  "data": [
    {
      "id": "txId123",
      "eventId": "8PSxxFQJZboSjV7FlZRJ",
      "paymentId": "VAQ17750...",
      "senhas": [25, 10],
      "dia": "quarta-feira",
      "valorBruto": 1800.00,
      "taxaPlataforma": 54.00,
      "valorLiquido": 1746.00,
      "tipo": "CREDITO",
      "status": "DISPONIVEL",
      "descricao": "2 senha(s) vendida(s) — quarta-feira",
      "createdAt": "2026-04-02T18:19:55.000Z"
    }
  ]
}
```

---

## 5. Solicitar Saque

```http
POST /api/wallet/saque
Authorization: Bearer {token}
Content-Type: application/json

{
  "valor": 5238.00,
  "chavePix": "email@parque.com",
  "tipoChave": "EMAIL",
  "nomeTitular": "João Parque LTDA"
}
```

> `tipoChave`: `CPF`, `CNPJ`, `EMAIL`, `TELEFONE`, `ALEATORIA`

**Sucesso (200):**
```json
{ "success": true, "saqueId": "saqueXyz123", "message": "Saque solicitado com sucesso" }
```

**Saldo insuficiente (400):**
```json
{ "success": false, "error": "Saldo insuficiente. Disponível: R$ 500.00" }
```

---

## 6. Histórico de Saques

```http
GET /api/wallet/saques
Authorization: Bearer {token}
```

```json
{
  "success": true,
  "total": 1,
  "data": [
    {
      "id": "saqueXyz123",
      "valor": 5238.00,
      "chavePix": "email@parque.com",
      "tipoChave": "EMAIL",
      "nomeTitular": "João Parque LTDA",
      "status": "SOLICITADO",
      "createdAt": "2026-04-02T10:00:00.000Z"
    }
  ]
}
```

> Ciclo de status: `SOLICITADO` → `PROCESSANDO` → `PAGO` | `FALHOU` | `CANCELADO`

---

## Rotas Admin (role: `admin`)

Todas exigem token de usuário com `role: "admin"`.

---

### A1. Dashboard Geral

Agrega todas as vendas de todos os eventos e parques.

```http
GET /api/wallet/admin/dashboard
Authorization: Bearer {token_admin}
```

**Resposta:**
```json
{
  "success": true,
  "resumo": {
    "totalEventosComVendas": 3,
    "totalTransacoes": 12,
    "totalArrecadadoBruto": 10800.00,
    "totalTaxaPlataforma": 324.00,
    "totalLiquidoParques": 10476.00,
    "totalSaldoEmWallets": 9876.00,
    "totalSaquesPendentes": 1,
    "totalValorSaquesPendentes": 500.00
  },
  "porEvento": [
    {
      "eventId": "8PSxxFQJZboSjV7FlZRJ",
      "nome": "5ª Vaquejada Genesio Araujo",
      "organizerId": "PZAznWeQMM7ZRdhLCl8Q",
      "totalTransacoes": 6,
      "totalBruto": 5400.00,
      "taxa": 162.00,
      "totalLiquido": 5238.00,
      "resumoPorDia": {
        "quarta-feira": 1746.00,
        "quinta-feira": 1746.00,
        "sexta-feira": 873.00,
        "sabado": 873.00
      }
    }
  ],
  "porParque": [
    {
      "organizerId": "PZAznWeQMM7ZRdhLCl8Q",
      "totalTransacoes": 6,
      "totalBruto": 5400.00,
      "taxa": 162.00,
      "totalLiquido": 5238.00,
      "saldoDisponivel": 4738.00,
      "totalSacado": 500.00,
      "saquesPendentes": 1,
      "valorSaquePendente": 500.00
    }
  ]
}
```

---

### A2. Vendas de um evento específico (admin)

Igual ao endpoint do parque mas sem verificação de dono. Inclui `boiNaTV`, `abvaq` por senha e o saldo atual da wallet do parque.

```http
GET /api/wallet/admin/vendas/{eventId}
Authorization: Bearer {token_admin}
```

**Resposta:**
```json
{
  "success": true,
  "evento": {
    "id": "8PSxxFQJZboSjV7FlZRJ",
    "nome": "5ª Vaquejada Genesio Araujo",
    "status": "active",
    "local": "Parque do João",
    "startDate": { "_seconds": 1754352000, "_nanoseconds": 0 },
    "endDate":   { "_seconds": 1754697600, "_nanoseconds": 0 },
    "valorSenha": 900,
    "organizerId": "PZAznWeQMM7ZRdhLCl8Q"
  },
  "resumo": {
    "totalVendas": 8,
    "totalPagas": 6,
    "totalAguardando": 2,
    "totalArrecadadoBruto": 5400.00,
    "taxaPlataforma": 162.00,
    "totalLiquidoParques": 5238.00,
    "resumoPorDia": {
      "quarta-feira": { "pagas": 2, "aguardando": 1, "arrecadado": 1800.00 }
    },
    "resumoPorMetodo": {
      "PIX_EFI": 3600.00,
      "Direto": 0
    },
    "walletParque": {
      "saldoDisponivel": 4738.00,
      "totalRecebido": 5238.00,
      "totalSacado": 500.00
    }
  },
  "vendas": [
    {
      "dia": "quarta-feira",
      "senha": 25,
      "vaqueiro": "João Silva",
      "categoria": "Profissional",
      "userId": "lDBqQYavevsxwFOCmR6M",
      "paymentId": "VAQ17750...",
      "metodoPagamento": "PIX_EFI",
      "statusPagamento": "PAGO",
      "valor": 900,
      "boiNaTV": false,
      "abvaq": true,
      "horario": "2026-04-02T18:19:32.000Z",
      "pagamentoConfirmadoEm": "2026-04-02T18:19:55.000Z"
    }
  ]
}
```

---

### A3. Todas as wallets dos parques

```http
GET /api/wallet/admin/wallets
Authorization: Bearer {token_admin}
```

```json
{
  "success": true,
  "data": [
    {
      "id": "PZAznWeQMM7ZRdhLCl8Q",
      "eventOwnerId": "PZAznWeQMM7ZRdhLCl8Q",
      "saldoDisponivel": 4738.00,
      "saldoPendente": 0,
      "totalRecebido": 5238.00,
      "totalSacado": 500.00
    }
  ]
}
```

---

### A4. Saques pendentes

```http
GET /api/wallet/admin/saques-pendentes
Authorization: Bearer {token_admin}
```

```json
{
  "success": true,
  "data": [
    {
      "id": "saqueXyz123",
      "eventOwnerId": "PZAznWeQMM7ZRdhLCl8Q",
      "valor": 500.00,
      "chavePix": "email@parque.com",
      "tipoChave": "EMAIL",
      "nomeTitular": "João Parque LTDA",
      "status": "SOLICITADO",
      "createdAt": "2026-04-02T10:00:00.000Z"
    }
  ]
}
```

---

### A5. Atualizar status de saque

```http
PATCH /api/wallet/admin/saque/{saqueId}
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "status": "PAGO",
  "observacao": "PIX enviado às 14h"
}
```

> Status possíveis: `PROCESSANDO` → `PAGO` | `FALHOU` | `CANCELADO`
> Se `FALHOU` ou `CANCELADO`, o saldo é automaticamente devolvido ao parque.

---

### A6. Vincular evento antigo ao parque

Para eventos criados antes do campo `organizerId` existir.

```http
PATCH /api/wallet/admin/evento/{eventId}/organizador
Authorization: Bearer {token_admin}
Content-Type: application/json

{ "organizerId": "PZAznWeQMM7ZRdhLCl8Q" }
```

---

### A7. Recalcular transações (corrige valores errados)

Recalcula `valorBruto` e `valorLiquido` de todas as `walletTransactions` de um parque usando `valorSenha × numSenhas` (fonte verdadeira) e já atualiza o saldo.

```http
POST /api/wallet/admin/recalcular-transacoes/{eventOwnerId}
Authorization: Bearer {token_admin}
```

```json
{ "success": true, "transacoesCorrigidas": 3, "saldoRecalculado": 5238.00 }
```

---

### A8. Deletar transações de um evento

Remove `walletTransactions` de um evento específico e recalcula o saldo do parque.

```http
DELETE /api/wallet/admin/transacoes/{eventId}
Authorization: Bearer {token_admin}
```

> Query opcional: `?apenasZero=true` — deleta só transações com `valorBruto=0`

```json
{ "success": true, "deletadas": 1, "saldoAtualizado": 0 }
```

---

## Fluxo do Front — Parque (passo a passo)

```
1. POST /api/auth/login → guarda token + user.id

2. GET /api/wallet/meus-eventos
   → lista eventos onde organizerId == userId
   → se vazio: evento antigo, admin precisa vincular via PATCH admin/evento/:id/organizador

3. Usuário clica em um evento
   → GET /api/wallet/vendas/{eventId}
   → exibe tabela de senhas com filtros por dia/categoria/método
   → exibe resumo: totalVendas, totalPagas, totalLiquido

4. GET /api/wallet/saldo
   → exibe saldo disponível para saque

5. Usuário clica em "Solicitar Saque"
   → POST /api/wallet/saque
   → exibe confirmação ou erro de saldo insuficiente

6. GET /api/wallet/saques
   → exibe histórico de saques com status atual
```

---

## Fluxo do Front — Admin (passo a passo)

```
1. POST /api/auth/login (usuário com role: "admin")

2. GET /api/wallet/admin/dashboard
   → exibe cards: totalArrecadadoBruto, totalTaxaPlataforma,
     totalLiquidoParques, totalSaldoEmWallets, saquesPendentes
   → tabela porEvento: vendas por evento
   → tabela porParque: saldo atual de cada parque

3. Admin clica em um evento
   → GET /api/wallet/admin/vendas/{eventId}
   → mesma tabela do parque + campos boiNaTV, abvaq
   → card "walletParque": saldo disponível, total recebido, total sacado

4. GET /api/wallet/admin/saques-pendentes
   → lista saques aguardando processamento

5. Admin aprova/rejeita saque
   → PATCH /api/wallet/admin/saque/{saqueId}
   → Body: { "status": "PAGO" | "FALHOU" | "CANCELADO" }
   → FALHOU/CANCELADO devolve saldo automaticamente ao parque

6. (Manutenção) Vincular evento antigo a parque
   → PATCH /api/wallet/admin/evento/{eventId}/organizador
   → Body: { "organizerId": "userId_do_parque" }
```

---

## Tratamento de erros

| HTTP | Motivo |
|---|---|
| `401` | Token ausente ou expirado |
| `403` | Evento não pertence ao organizador do token |
| `400` | Saldo insuficiente no saque / dados inválidos |
| `500` | Erro interno (ver campo `error` na resposta) |

```json
{ "success": false, "error": "Acesso negado: este evento não pertence ao seu usuário" }
```


Base URL produção: `https://api-3sxev7xp7q-uc.a.run.app`

---
