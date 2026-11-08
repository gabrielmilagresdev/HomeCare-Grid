export const educationTopics = {
  tatinhia: {
    number: '01', label: 'TATINHIA', icon: 'sparkles', title: 'Uma conversa abre caminhos.',
    description: 'Conte o cuidado que procura por texto ou voz. A TatinhIA responde e organiza uma busca que você pode ajustar.',
    steps: [
      { icon: 'chatbubble-ellipses-outline', title: 'Conte do seu jeito', body: 'Informe o serviço, a região e quando prefere receber o atendimento.' },
      { icon: 'options-outline', title: 'Revise as sugestões', body: 'Confira os filtros sugeridos e altere os detalhes antes de seguir.' },
      { icon: 'people-outline', title: 'Escolha com calma', body: 'Compare profissionais, horários e valores disponíveis no catálogo.' }
    ],
    note: 'A TatinhIA ajuda a organizar a busca. Dúvidas clínicas devem ser tratadas com um profissional de saúde.',
    action: 'Conversar com a TatinhIA', next: 'profissionais'
  },
  profissionais: {
    number: '02', label: 'PROFISSIONAIS', icon: 'people-outline', title: 'O cuidado tem rosto e história.',
    description: 'Conheça quem pode atender você. Para profissionais, o Tato reúne solicitações e agenda em um só espaço.',
    steps: [
      { icon: 'person-outline', title: 'Perfis com clareza', body: 'Veja fotos, serviços, regiões atendidas, valores e horários disponíveis.' },
      { icon: 'search-outline', title: 'Escolha informada', body: 'Filtre e compare opções compatíveis antes de enviar a solicitação.' },
      { icon: 'calendar-outline', title: 'Agenda com autonomia', body: 'O profissional acompanha solicitações e decide quando aceitar ou recusar.' }
    ],
    note: 'A disponibilidade e os valores aparecem na busca. A visita só entra como confirmada após o aceite do profissional.',
    action: 'Explorar profissionais', next: 'familia'
  },
  familia: {
    number: '03', label: 'FAMILY HUB', icon: 'people-circle-outline', title: 'Cuidar junto faz diferença.',
    description: 'Uma visão compartilhada da agenda ajuda cada pessoa autorizada a acompanhar o cuidado.',
    steps: [
      { icon: 'calendar-outline', title: 'Agenda em um lugar', body: 'Acompanhe solicitações e visitas da pessoa atendida no horário local.' },
      { icon: 'key-outline', title: 'Acesso sob controle', body: 'O responsável decide quem pode consultar a agenda ou solicitar cuidado.' },
      { icon: 'heart-outline', title: 'Continue o cuidado', body: 'Quando necessário, volte à busca e faça uma nova solicitação.' }
    ],
    note: 'Cada familiar vê apenas o que sua permissão permite. O responsável pode alterar ou revogar o vínculo.',
    action: 'Abrir Family Hub', next: null
  }
} as const;

export type EducationTopic = keyof typeof educationTopics;
