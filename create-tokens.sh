#!/bin/bash

echo "=== Configuração Automática de Tokens ==="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Passo 1: Login no GitHub CLI${NC}"
echo "Execute: gh auth login"
echo "Escolha: GitHub.com -> HTTPS -> Yes -> Login with web browser"
echo ""

read -p "Pressione Enter após fazer login no GitHub CLI..."

echo ""
echo -e "${YELLOW}Passo 2: Criando Personal Access Token${NC}"

# Criar PAT com GitHub CLI
PAT_TOKEN=$(gh auth token)

if [ -z "$PAT_TOKEN" ]; then
    echo -e "${RED}Erro: Não foi possível obter o token. Faça login primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ GitHub PAT criado com sucesso!${NC}"
echo "Token: $PAT_TOKEN"
echo ""

echo -e "${YELLOW}Passo 3: Configurando secrets no repositório${NC}"

# Adicionar secret PAT_TOKEN
gh secret set PAT_TOKEN --body "$PAT_TOKEN"
echo -e "${GREEN}✅ PAT_TOKEN adicionado aos secrets${NC}"

echo ""
echo -e "${YELLOW}Passo 4: NPM Token${NC}"
echo "Você precisa criar um NPM token manualmente:"
echo "1. Vá para: https://www.npmjs.com/settings/tokens"
echo "2. Clique em 'Generate New Token' → 'Classic Token'"
echo "3. Selecione: 'Automation'"
echo "4. Copie o token e execute:"
echo "   gh secret set NPM_TOKEN --body 'SEU_NPM_TOKEN_AQUI'"
echo ""

echo -e "${GREEN}=== Configuração Concluída! ===${NC}"
echo ""
echo "Próximos passos:"
echo "1. Adicione o NPM_TOKEN conforme instruções acima"
echo "2. Faça um commit para testar:"
echo "   git add ."
echo "   git commit -m 'feat: configure automatic releases'"
echo "   git push origin main"
echo ""
echo "3. Monitore em: https://github.com/AndyTargino/PingMeUp/actions"