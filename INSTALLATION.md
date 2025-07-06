# PingMeUp - Correções e Instruções de Uso

## Problemas Identificados e Correções Aplicadas

### 1. Referência CSS Incorreta
**Problema**: O arquivo HTML estava referenciando `../styles/notification.css` mas o arquivo não estava acessível.
**Solução**: 
- Copiamos o arquivo CSS para `/templates/notification.css`
- Atualizamos a referência no HTML para `notification.css`

### 2. Arquivo preload.js em Local Incorreto
**Problema**: O TypeScript estava procurando `preload.js` no diretório `dist/` mas o arquivo estava apenas em `src/`.
**Solução**: Copiamos o arquivo para `dist/preload.js`

### 3. Estrutura de Arquivos
**Problema**: A estrutura não estava otimizada para uso.
**Solução**: Reorganização dos arquivos essenciais.

## Como Usar o PingMeUp

### Instalação
```bash
cd /mnt/d/GitHub/PingMeUp
npm install
npm run build
```

### Exemplo de Uso Básico
```javascript
const { ElectronNotificationManager } = require('pingmeup');

// Criar o gerenciador de notificações
const notificationManager = new ElectronNotificationManager({
    width: 420,
    height: 120,
    spacing: 20,
    maxVisible: 6,
    defaultDuration: 5000,
    position: 'bottom-right',
    animation: 'slide'
});

// Notificação simples
const id = await notificationManager.info(
    'Título da Notificação',
    'Esta é uma mensagem informativa.'
);

// Notificação de sucesso
await notificationManager.success(
    'Operação Concluída',
    'Seus dados foram salvos com sucesso!'
);

// Notificação de erro
await notificationManager.error(
    'Erro',
    'Algo deu errado. Tente novamente.',
    { requireInteraction: true }
);

// Notificação de progresso
const progressId = await notificationManager.progress(
    'Download',
    'Baixando arquivo...',
    { showCancel: true, showPause: true }
);

// Atualizar progresso
notificationManager.updateProgress(progressId, 75);
```

### Exemplo Completo
Veja o diretório `/example/` para uma aplicação Electron completa demonstrando todas as funcionalidades.

### Para Executar o Exemplo
```bash
cd /mnt/d/GitHub/PingMeUp/example
npm install
npm start
```

## Tipos de Notificação Disponíveis

1. **info()** - Notificações informativas
2. **success()** - Notificações de sucesso  
3. **warning()** - Avisos importantes
4. **error()** - Notificações de erro
5. **progress()** - Barras de progresso
6. **achievement()** - Conquistas com confete
7. **confirmation()** - Diálogos de confirmação
8. **reply()** - Notificações com entrada de texto
9. **reminder()** - Lembretes com opções de soneca
10. **weather()** - Notificações meteorológicas

## Configurações Avançadas

### Temas
- `windows` - Estilo Windows 11
- `macos` - Estilo macOS  
- `linux` - Estilo Linux/GTK

### Posições
- `top-left`, `top-center`, `top-right`
- `center`
- `bottom-left`, `bottom-center`, `bottom-right`

### Animações
- `slide` - Deslizar da direita
- `bounce` - Efeito de salto
- `zoom` - Zoom com rotação
- `flip` - Efeito de flip 3D
- `fade` - Fade simples

## Arquivos Corrigidos

1. ✅ `/templates/notification.html` - Referência CSS corrigida
2. ✅ `/templates/notification.css` - Arquivo CSS copiado
3. ✅ `/dist/preload.js` - Arquivo preload copiado
4. ✅ `/example/` - Aplicação exemplo criada

## Status das Notificações

As notificações agora devem aparecer com todos os estilos aplicados corretamente, incluindo:
- Temas responsivos (Windows/macOS/Linux)
- Modo escuro automático
- Animações suaves
- Ícones adequados
- Posicionamento correto
- Interações funcionais

## Solução de Problemas

Se as notificações ainda aparecerem sem estilo:

1. Verifique se o arquivo `notification.css` está no diretório `templates/`
2. Verifique se o `preload.js` está no diretório `dist/`
3. Execute `npm run build` para recompilar
4. Teste com o exemplo fornecido

## Próximos Passos

Para integrar o PingMeUp no seu projeto:

1. Instale: `npm install file:/mnt/d/GitHub/PingMeUp`
2. Importe: `const { ElectronNotificationManager } = require('pingmeup')`
3. Configure conforme os exemplos acima
4. Use as funções de conveniência para diferentes tipos