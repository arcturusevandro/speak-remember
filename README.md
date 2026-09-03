# Voztrace — Assistente Inteligente de Lembretes

O **Voztrace** é um projeto de assistente inteligente para criação e gerenciamento de lembretes por **voz ou texto**, usando linguagem natural para transformar uma solicitação do usuário em uma ação estruturada.

A proposta é simples: o usuário informa o que não quer esquecer, o sistema interpreta a tarefa, identifica data e horário quando informados e apresenta os dados para confirmação antes do registro.

> "Você fala. O Voztrace lembra."

## Objetivo do projeto

Este projeto foi desenvolvido como MVP para validar uma experiência mais simples de criação de lembretes, reduzindo formulários e aproximando a interação de uma conversa natural.

O foco está em:

- interpretação de solicitações em linguagem natural;
- criação e confirmação de lembretes;
- entrada por texto e experiência preparada para voz;
- tratamento de datas, horários e recorrências;
- autenticação e persistência de dados;
- experiência responsiva em desktop e mobile;
- testes, correções e evolução contínua do fluxo.

## Regra central

O sistema **não deve inventar datas ou horários**. Quando a informação fornecida pelo usuário for insuficiente ou ambígua, a aplicação deve solicitar confirmação.

A prioridade do produto é:

**confiabilidade > inteligência aparente**

## Fluxo principal

1. O usuário informa um lembrete por texto ou voz.
2. A solicitação é interpretada.
3. Tarefa, data, horário e recorrência são estruturados.
4. O sistema apresenta uma confirmação.
5. O usuário confirma ou ajusta os dados.
6. O lembrete é registrado e passa a integrar a lista de lembretes do usuário.

## Tecnologias

O projeto utiliza uma stack moderna em TypeScript, incluindo:

- React;
- TypeScript;
- Vite;
- TanStack Router / TanStack Start;
- TanStack Query;
- Supabase;
- Tailwind CSS;
- Zod;
- Git e GitHub.

## Conceitos trabalhados

Além do desenvolvimento da interface, o projeto envolve:

- análise de requisitos;
- definição de regras de negócio;
- modelagem do fluxo de usuário;
- integração entre aplicação e banco de dados;
- validação e tratamento de informações;
- testes funcionais;
- identificação e correção de falhas;
- preparação da arquitetura para evolução futura.

## Status

Projeto em desenvolvimento e evolução contínua.

O Voztrace funciona também como ambiente prático para explorar a aplicação de **Inteligência Artificial, automação e interfaces conversacionais** em problemas reais de produtividade.

---

Desenvolvido por **Evandro Bueno** como projeto autoral de tecnologia e automação.