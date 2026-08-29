# Speak & Remember

Voztrace — MVP de Assistente Inteligente de Lembretes

Crie um aplicativo web SaaS chamado Voztrace.

Conceito

O Voztrace é um assistente pessoal inteligente que permite ao usuário criar lembretes usando linguagem natural, principalmente por voz.

A proposta central é:

"Fale o que você não quer esquecer. O Voztrace lembra você."

O usuário não deve precisar preencher formulários complexos para criar um lembrete.

Exemplo:

"Me lembra amanhã às 10 horas de ligar para o Carlos sobre o orçamento."

O sistema deve interpretar a frase e transformar automaticamente em:

Ligar para o Carlos sobre o orçamento
Data: amanhã
Horário: 10:00

Antes de salvar definitivamente, mostrar uma confirmação clara ao usuário.

Objetivo deste MVP

Este é um primeiro protótipo funcional para validar a experiência do produto.

Não implementar pagamentos, WhatsApp, integrações externas ou funcionalidades avançadas neste momento.

Priorizar:

experiência de uso;

interface;

criação de lembretes;

interpretação de linguagem natural;

organização dos lembretes;

responsividade;

arquitetura preparada para evolução.

1. Landing Page

Criar uma landing page moderna, profissional e minimalista.

Hero:

"Você fala. O Voztrace lembra."

Subtítulo:

Transforme qualquer pensamento em um lembrete. Fale ou digite e deixe o Voztrace cuidar do resto.

CTA principal:

Experimentar gratuitamente

CTA secundário:

Como funciona

Mostrar visualmente o fluxo:

Fale → Voztrace entende → Você é lembrado

Criar seções:

Como funciona

Fale ou digite o que precisa lembrar.

O Voztrace interpreta sua mensagem.

Confirme o lembrete.

O Voztrace lembra você no momento certo.

Exemplos

Mostrar exemplos reais:

"Me lembra amanhã às 9h de ligar para o João."

"Toda segunda-feira às 8h me lembra de revisar minhas tarefas."

"Dia 15 me lembra de pagar a internet."

"Daqui a 30 dias me lembra de verificar o seguro do carro."

Benefícios

Sem formulários complicados.

Linguagem natural.

Criação rápida.

Lembretes recorrentes.

Interface simples.

Pensado para funcionar como um assistente pessoal.

2. Autenticação

Criar:

cadastro;

login;

logout;

recuperação de senha.

Após o login, direcionar o usuário para o painel principal.

3. Dashboard

Criar uma interface extremamente simples.

No topo:

Voztrace

Menu:

Início

Meus lembretes

Configurações

Sair

Área principal:

"O que você não quer esquecer?"

Criar um campo grande de texto.

Placeholder:

"Ex.: Me lembra amanhã às 10h de ligar para o Carlos."

Ao lado ou abaixo, criar um botão de microfone:

🎙 Falar

E um botão:

Criar lembrete

4. Entrada por texto

Quando o usuário digitar:

"Me lembra amanhã às 10h de ligar para o Carlos sobre o orçamento."

O sistema deve interpretar:

Título:
Ligar para o Carlos sobre o orçamento

Data:
Amanhã

Horário:
10:00

Recorrência:
Nenhuma

Exibir uma tela/cartão de confirmação:

"Entendi seu lembrete"

📅 Amanhã
⏰ 10:00
📝 Ligar para o Carlos sobre o orçamento

Botões:

Confirmar lembrete

Editar

5. Entrada por voz

Criar uma experiência visual para gravação de voz.

Ao clicar em Falar:

solicitar permissão de microfone;

mostrar indicador de gravação;

permitir iniciar/parar gravação;

converter o áudio em texto;

mostrar a transcrição antes da criação do lembrete.

Exemplo:

🎙️ Gravando...

Após finalizar:

Você disse:

"Toda sexta-feira às 15h me lembra de cobrar os clientes."

Depois interpretar:

Título:
Cobrar os clientes

Dia:
Toda sexta-feira

Horário:
15:00

Recorrência:
Semanal

Mostrar confirmação antes de salvar.

Se a plataforma não possuir transcrição de voz funcional neste ambiente, criar a arquitetura e a interface preparadas para integração futura com um serviço de speech-to-text, sem fingir que a funcionalidade está funcionando.

6. Meus lembretes

Criar uma página com todos os lembretes.

Cada lembrete deve mostrar:

título;

data;

horário;

recorrência;

status;

opções editar e excluir.

Separar visualmente:

Próximos

Lembretes futuros.

Concluídos

Lembretes já executados.

Criar filtros:

Todos

Hoje

Próximos

Recorrentes

Concluídos

7. Recorrência

Permitir frases como:

"Toda segunda às 8h."

"Todo mês no dia 10."

"Todos os dias às 18h."

O sistema deve representar corretamente a recorrência.

8. Banco de dados

Criar uma estrutura persistente para usuários e lembretes.

Cada lembrete deve possuir, no mínimo:

id;

user_id;

título;

descrição;

data;

horário;

timezone;

recorrência;

status;

texto original informado pelo usuário;

created_at;

updated_at.

Nunca permitir que um usuário visualize ou altere lembretes pertencentes a outro usuário.

9. Interface

A interface deve transmitir:

simplicidade + inteligência + confiança.

Evitar aparência de sistema corporativo complexo.

Usar:

bastante espaço em branco;

tipografia moderna;

cards limpos;

bordas suaves;

microinterações discretas;

excelente experiência mobile;

excelente experiência desktop.

O botão de voz deve ser visualmente importante, pois a voz será uma das principais formas de interação do produto.

Criar estados de:

carregando;

processando;

sucesso;

erro;

nenhum lembrete;

microfone negado;

interpretação incompleta.

10. Tratamento de datas

O sistema deve considerar o timezone do usuário.

Frases relativas como:

hoje;

amanhã;

depois de amanhã;

próxima segunda;

daqui a 3 dias;

daqui a 2 semanas;

devem ser convertidas em datas concretas antes da confirmação.

Se a frase não possuir informação suficiente para determinar o momento do lembrete, NÃO inventar.

Exemplo:

"Me lembra de falar com João."

Perguntar:

"Quando você quer ser lembrado?"

11. Princípio fundamental

O Voztrace nunca deve inventar uma data ou horário que o usuário não informou.

Quando houver ambiguidade, perguntar.

A prioridade é:

confiabilidade > inteligência aparente.

12. Arquitetura

Organizar o projeto de maneira modular e preparada para evolução.

Separar claramente:

autenticação;

usuários;

lembretes;

interpretação de linguagem natural;

voz/transcrição;

notificações.

Não criar código desnecessariamente complexo.

13. Preparação para futuras versões

Não implementar agora, mas estruturar o projeto para futuramente suportar:

notificações push;

WhatsApp;

Telegram;

calendário;

IA contextual;

lembretes proativos;

planos pagos;

assinatura;

contas profissionais;

CRM simples;

follow-ups automáticos.

14. Critério de sucesso do teste

O resultado deve parecer um produto SaaS real, não apenas uma demonstração técnica.

O usuário deve conseguir:

entrar no sistema;

criar um lembrete digitando linguagem natural;

revisar a interpretação;

confirmar;

visualizar o lembrete;

editar;

excluir;

criar lembretes recorrentes;

utilizar a interface em desktop e celular.

Antes de finalizar, testar todos esses fluxos e corrigir erros encontrados.

Não adicionar funcionalidades que não foram solicitadas apenas para aumentar a complexidade.

O objetivo deste primeiro teste é descobrir quão bem a plataforma consegue transformar uma especificação de produto em um MVP funcional e utilizável.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f552a295-c689-4478-b603-3ff5e99d4b1d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
