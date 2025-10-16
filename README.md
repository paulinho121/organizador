# 📅 Organizador Diário

Um aplicativo web completo para organização do dia a dia, desenvolvido com **React** e **Supabase**.

## 🚀 Funcionalidades

- **Autenticação de Usuários**: Sistema de login e registro seguro
- **Dashboard**: Visão geral com estatísticas do dia
- **Gerenciamento de Reuniões**: Cadastre e acompanhe suas reuniões
- **Cadastro de Clientes**: Mantenha um registro completo de seus clientes
- **Controle de Vendas**: Registre vendas e calcule comissões automaticamente
- **Lembretes**: Crie notas e lembretes com status de conclusão

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React.js
- **Backend/Database**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Roteamento**: React Router DOM
- **Estilização**: CSS puro

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Conta no Supabase (gratuita)

## ⚙️ Configuração do Supabase

### 1. Criar um Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Preencha os dados do projeto (nome, senha do banco, região)
4. Aguarde a criação do projeto

### 2. Configurar o Banco de Dados

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em "New Query"
3. Copie todo o conteúdo do arquivo `supabase-setup.sql` deste projeto
4. Cole no editor SQL e clique em "Run"
5. Aguarde a execução completa do script

### 3. Obter as Credenciais

1. No painel do Supabase, vá para **Settings** > **API**
2. Copie os seguintes valores:
   - **Project URL** (URL do projeto)
   - **anon public** (chave pública anônima)

## 🔧 Instalação Local

### 1. Clone ou baixe o projeto

```bash
cd daily-organizer-app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

1. Crie um arquivo `.env` na raiz do projeto (copie do `.env.example`):

```bash
cp .env.example .env
```

2. Edite o arquivo `.env` e adicione suas credenciais do Supabase:

```env
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm start
```

O aplicativo será aberto automaticamente em [http://localhost:3000](http://localhost:3000)

## 📱 Como Usar

### Primeiro Acesso

1. Na tela inicial, clique em "Não tem uma conta? Registre-se"
2. Insira seu e-mail e senha
3. Clique em "Registrar"
4. Você será redirecionado automaticamente para o Dashboard

### Navegação

- **Dashboard**: Visualize um resumo de suas atividades
- **Reuniões**: Cadastre reuniões com data, hora e cliente associado
- **Clientes**: Gerencie sua base de clientes
- **Vendas**: Registre vendas e acompanhe suas comissões
- **Lembretes**: Crie lembretes e marque como concluídos

## 🏗️ Estrutura do Projeto

```
daily-organizer-app/
├── public/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   └── Navbar.jsx
│   ├── lib/                 # Configurações e utilitários
│   │   ├── supabaseClient.js
│   │   └── AuthContext.js
│   ├── pages/               # Páginas da aplicação
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── Meetings/
│   │   ├── Clients/
│   │   ├── Sales/
│   │   └── Reminders/
│   ├── App.js
│   └── index.js
├── .env.example
├── supabase-setup.sql
└── README.md
```

## 🔒 Segurança

- Todas as tabelas possuem **Row Level Security (RLS)** habilitado
- Cada usuário só pode acessar seus próprios dados
- As senhas são criptografadas pelo Supabase Auth
- As chaves de API devem ser mantidas em variáveis de ambiente

## 📦 Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `build/`.

## 🐛 Solução de Problemas

### Erro de conexão com o Supabase

- Verifique se as variáveis de ambiente estão corretas no arquivo `.env`
- Certifique-se de que o projeto Supabase está ativo
- Verifique se o script SQL foi executado corretamente

### Erro ao fazer login

- Confirme que o e-mail foi verificado (verifique sua caixa de entrada)
- Tente redefinir a senha se necessário

### Dados não aparecem

- Verifique se as políticas RLS foram criadas corretamente
- Confirme que você está logado com o usuário correto

## 📄 Licença

Este projeto é de código aberto e está disponível para uso pessoal e comercial.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

---

Desenvolvido com ❤️ usando React e Supabase

