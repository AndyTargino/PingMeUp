# Configuração de Secrets para GitHub Actions

## 1. Criar Personal Access Token (PAT)

### Passo a Passo:
1. Vá para: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Dê um nome: `PingMeUp Auto Release`
4. Selecione os seguintes escopos:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `write:packages` (Upload packages to GitHub Package Registry)

5. Clique em "Generate token"
6. **COPIE O TOKEN** (ele só aparece uma vez!)

## 2. Criar NPM Token

### Passo a Passo:
1. Vá para: https://www.npmjs.com/settings/tokens
2. Clique em "Generate New Token" → "Classic Token"
3. Selecione: `Automation` (para CI/CD)
4. **COPIE O TOKEN**

## 3. Adicionar Secrets no GitHub

### Passo a Passo:
1. Vá para: https://github.com/AndyTargino/PingMeUp/settings/secrets/actions
2. Clique em "New repository secret"
3. Adicione os seguintes secrets:

**Secret 1:**
- Name: `PAT_TOKEN`
- Value: [Cole o Personal Access Token do GitHub aqui]

**Secret 2:**
- Name: `NPM_TOKEN`
- Value: [Cole o NPM Token aqui]

## 4. Verificar Configuração

Após adicionar os secrets, faça um commit e push para testar:

```bash
git add .
git commit -m "feat: configure automatic releases"
git push origin main
```

## 5. Monitorar o Workflow

Vá para: https://github.com/AndyTargino/PingMeUp/actions

O workflow deve executar automaticamente e:
- Analisar os commits
- Determinar a versão automaticamente
- Criar release no GitHub
- Publicar no NPM

## Troubleshooting

Se ainda der erro de permissão:
1. Verifique se o PAT_TOKEN tem os escopos corretos
2. Certifique-se de que copiou o token completo
3. Verifique se o repositório tem as configurações corretas em Settings → Actions → General → Workflow permissions

## Comandos Úteis

```bash
# Forçar uma nova versão
git commit -m "feat: new feature" --allow-empty
git push origin main

# Verificar tokens
# (Execute apenas localmente, nunca no CI)
echo $PAT_TOKEN | cut -c1-10  # Mostra apenas os primeiros 10 caracteres
```