import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Avatar, Badge, Card, Chip, Divider, Eyebrow, Field, Screen, SectionTitle, StateMessage } from '../../components/ui/Primitives';
import { evaluateProfessional, rankProfessionals } from '../../domain/rules/matching.ts';
import { parseHourlyPriceLimit } from '../../domain/schemas/index.ts';
import type { CareRequest } from '../../domain/types/index.ts';
import { interpretDemoConcierge } from '../../services/demo/concierge.ts';
import { theme } from '../../theme/tokens';
import { useDemo } from '../demo/DemoContext';
import { money, regionLabel, regions, windowLabel } from '../demo/format';

export function MarketplaceScreen() {
  const { engine, user, activeUserId, search, setSearch } = useDemo();
  const [prompt, setPrompt] = useState('');
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState('');
  const [budget, setBudget] = useState(() => search.maxPriceCents === null ? '' : String(search.maxPriceCents / 100).replace('.', ','));
  const [budgetError, setBudgetError] = useState('');
  const lastLocalBudget = useRef(search.maxPriceCents);
  useEffect(() => {
    if (search.maxPriceCents === lastLocalBudget.current) return;
    lastLocalBudget.current = search.maxPriceCents;
    setBudget(search.maxPriceCents === null ? '' : String(search.maxPriceCents / 100).replace('.', ','));
    setBudgetError('');
  }, [search.maxPriceCents]);
  const { fixture } = engine;
  const service = fixture.services.find(item => item.id === search.serviceId) ?? fixture.services[0];
  if (!service) return <Screen title="Encontre cuidado"><StateMessage title="Catálogo indisponível" message="Tente abrir a demonstração novamente." /></Screen>;
  const request: CareRequest = { id: 'demo-preview', recipientId: fixture.recipient.id, requesterUserId: activeUserId ?? '', serviceId: service.id,
    regionCode: search.regionCode, startsAt: search.window.startsAt, endsAt: search.window.endsAt,
    requiredAccessibilityTags: search.accessibilityTags, maxPriceCents: search.maxPriceCents };
  const ranked = budgetError ? [] : rankProfessionals(request, service, fixture.professionals);
  const excluded = budgetError || ranked.length ? [] : fixture.professionals.map(professional => ({ professional, evaluation: evaluateProfessional(request, service, professional) }));
  const visible = ranked.filter(item => fixture.professionals.find(p => p.id === item.professionalId)?.displayName.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  const update = (patch: Partial<typeof search>) => { setSearch({ ...search, ...patch }); setFeedback(''); };
  const applyConcierge = () => {
    const result = interpretDemoConcierge(prompt, fixture);
    if (!result.ok) { setFeedback(result.error.message); return; }
    const filters = result.data;
    if (filters.clarificationNeeded || !filters.serviceId || !filters.regionCode || !filters.window) {
      setFeedback('Preciso de serviço, região e período. Confirme os filtros abaixo para continuar.');
      return;
    }
    setSearch({ ...search, serviceId: filters.serviceId, regionCode: filters.regionCode, window: filters.window, accessibilityTags: filters.accessibilityTags });
    setFeedback('Filtros sugeridos aplicados. Confira antes de escolher um profissional.');
  };
  const setBudgetFromText = (text: string) => {
    setBudget(text);
    const parsed = parseHourlyPriceLimit(text);
    if (!parsed.ok) { setBudgetError(parsed.error.message); return; }
    setBudgetError('');
    lastLocalBudget.current = parsed.data;
    update({ maxPriceCents: parsed.data });
  };
  return <Screen title={`Olá, ${user?.displayName ?? 'visitante'}.`} subtitle="Vamos encontrar o cuidado que se encaixa na sua rotina." right={<Pressable accessibilityRole="button" accessibilityLabel="Minha agenda" onPress={() => router.push('/(patient)/bookings')} style={styles.topAction}><Ionicons name="calendar-outline" size={20} color={theme.colors.primary} /></Pressable>}>
    <View style={styles.hero}><View style={styles.heroText}><Eyebrow>ENCONTRE O CUIDADO CERTO</Eyebrow><Text style={styles.heroTitle}>Cuidar começa com uma boa conexão.</Text><Text style={styles.heroBody}>Serviços, disponibilidade e valores claros. Você escolhe com autonomia.</Text></View><View style={styles.heroArt}><Ionicons name="heart" size={38} color={theme.colors.primary} /></View></View>
    <Card><View style={styles.cardHeading}><View style={styles.iconBox}><Ionicons name="sparkles-outline" size={22} color={theme.colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Conte o que procura</Text><Text style={styles.smallText}>Assistente de filtros em modo offline</Text></View></View>
      <Field label="Sua necessidade administrativa" value={prompt} onChangeText={setPrompt} placeholder="Ex.: apoio no Centro amanhã de manhã" multiline />
      <Button label="Sugerir filtros" onPress={applyConcierge} variant="secondary" />
      {!!feedback && <Text accessibilityRole="alert" style={styles.feedback}>{feedback}</Text>}
      <Text style={styles.disclaimer}>Sugestões exigem sua confirmação. Sem orientação clínica ou diagnóstico.</Text>
    </Card>
    <View style={styles.filters}><SectionTitle title="Ajuste sua busca" caption="Serviço, região e horário são essenciais para encontrar profissionais disponíveis." />
      <View style={styles.filterGroup}><Text style={styles.filterLabel}>TIPO DE SERVIÇO</Text><View style={styles.chips}>{fixture.services.map(item => <Chip key={item.id} label={item.name} selected={item.id === search.serviceId} onPress={() => update({ serviceId: item.id })} />)}</View></View>
      <View style={styles.filterGroup}><Text style={styles.filterLabel}>REGIÃO FICTÍCIA</Text><View style={styles.chips}>{regions.map(item => <Chip key={item.code} label={item.label} selected={item.code === search.regionCode} onPress={() => update({ regionCode: item.code })} />)}</View></View>
      <View style={styles.filterGroup}><Text style={styles.filterLabel}>HORÁRIO</Text><View style={styles.chips}><Chip label={`Manhã · ${windowLabel(fixture.suggestedWindow).split('·')[1]?.trim() ?? ''}`} selected={search.window.startsAt === fixture.suggestedWindow.startsAt} onPress={() => update({ window: fixture.suggestedWindow })} icon="sunny-outline" /><Chip label={`Tarde · ${windowLabel(fixture.alternateWindow).split('·')[1]?.trim() ?? ''}`} selected={search.window.startsAt === fixture.alternateWindow.startsAt} onPress={() => update({ window: fixture.alternateWindow })} icon="partly-sunny-outline" /></View></View>
      <View style={styles.filterGroup}><Text style={styles.filterLabel}>ACESSIBILIDADE</Text><View style={styles.chips}><Chip label="Apoio à mobilidade" selected={search.accessibilityTags.includes('mobilidade')} onPress={() => update({ accessibilityTags: search.accessibilityTags.includes('mobilidade') ? [] : ['mobilidade'] })} /></View></View>
      <Field label="Valor máximo por hora (R$, opcional)" value={budget} onChangeText={setBudgetFromText} placeholder="Ex.: 100" />
      {!!budgetError && <Text accessibilityRole="alert" style={styles.budgetError}>{budgetError}</Text>}
      <Field label="Buscar por nome (opcional)" value={query} onChangeText={setQuery} placeholder="Nome do profissional" />
    </View>
    <View style={styles.resultsHeading}><View style={{ flex: 1 }}><SectionTitle title="Profissionais para você" caption={budgetError ? 'Corrija o valor máximo para ver resultados.' : `${ranked.length} ${ranked.length === 1 ? 'compatível' : 'compatíveis'} · ${regionLabel(search.regionCode)} · ${windowLabel(search.window)}`} /></View><Badge label="MATCH EXPLICÁVEL" /></View>
    {budgetError ? <StateMessage icon="information-circle-outline" title="Confira o valor máximo" message="Use apenas números em reais. Você pode apagar o campo para remover esse filtro." /> : visible.length ? visible.map((match, index) => {
      const professional = fixture.professionals.find(item => item.id === match.professionalId);
      if (!professional) return null;
      return <Card key={match.professionalId}><View style={styles.profileHead}><Avatar name={professional.displayName} tone={index % 2 ? 'blue' : 'peach'} /><View style={{ flex: 1, gap: 5 }}><Text style={styles.profileName}>{professional.displayName}</Text><Text style={styles.smallText}>{service.name} · {regionLabel(search.regionCode)}</Text></View><Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} /></View>
        <Divider /><View style={styles.profileMeta}><View style={styles.meta}><Ionicons name="time-outline" size={16} color={theme.colors.primary} /><Text style={styles.metaText}>Horário compatível</Text></View><View style={styles.meta}><Ionicons name="location-outline" size={16} color={theme.colors.primary} /><Text style={styles.metaText}>Sua região</Text></View></View>
        <Text style={styles.explanation}>Compatível por serviço, região, horário{search.accessibilityTags.length ? ' e acessibilidade' : ''}. Ordenação por preço.</Text>
        <View style={styles.priceRow}><View><Text style={styles.price}>{money(professional.hourlyPriceCents)} <Text style={styles.perHour}>/ hora</Text></Text><Text style={styles.smallText}>Valor demonstrativo</Text></View><Button label="Ver perfil" compact onPress={() => router.push(`/(patient)/profile/${professional.id}`)} /></View>
      </Card>;
    }) : <StateMessage icon="search-outline" title={ranked.length ? 'Nome não encontrado' : 'Ainda sem cobertura aqui'} message={ranked.length ? 'Tente outro nome ou limpe o campo de busca.' : 'Ajuste os filtros ou registre voluntariamente a demanda, sem compartilhar dados pessoais.'} action={ranked.length ? 'Limpar nome' : 'Ver opção de demanda'} onAction={() => ranked.length ? setQuery('') : router.push('/(patient)/demand')} />}
    {excluded.length > 0 && <Card><SectionTitle title="Por que estes perfis não aparecem?" caption="Critérios administrativos desta busca" />{excluded.map(({ professional, evaluation }) => <View key={professional.id} style={styles.exclusion}><Text style={styles.exclusionName}>{professional.displayName}</Text><Text style={styles.smallText}>{evaluation.reasons.join(' · ')}</Text></View>)}</Card>}
    <Text style={styles.disclaimer}>O matching considera apenas critérios administrativos. Ele não avalia qualidade clínica.</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  topAction: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.line },
  hero: { borderRadius: 24, backgroundColor: theme.colors.mint, minHeight: 172, padding: 22, flexDirection: 'row', gap: 10, overflow: 'hidden' }, heroText: { flex: 1, gap: 9 }, heroTitle: { color: theme.colors.deep, fontSize: 24, lineHeight: 28, fontWeight: '800', letterSpacing: -0.8 }, heroBody: { color: theme.colors.muted, fontSize: 13, lineHeight: 19 }, heroArt: { width: 74, height: 74, borderRadius: 26, backgroundColor: theme.colors.white, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-13deg' }] },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 }, iconBox: { width: 44, height: 44, borderRadius: 13, backgroundColor: theme.colors.mint, alignItems: 'center', justifyContent: 'center' }, cardTitle: { color: theme.colors.ink, fontWeight: '800', fontSize: 16 }, smallText: { color: theme.colors.muted, fontSize: 12, lineHeight: 17 }, disclaimer: { color: theme.colors.muted, fontSize: 11, lineHeight: 17 }, feedback: { color: theme.colors.primary, fontSize: 12, lineHeight: 17, fontWeight: '700' },
  filters: { gap: 18 }, filterGroup: { gap: 9 }, filterLabel: { color: theme.colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, budgetError: { color: theme.colors.error, fontSize: 12, fontWeight: '700', lineHeight: 18 }, resultsHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  profileHead: { flexDirection: 'row', alignItems: 'center', gap: 12 }, profileName: { color: theme.colors.ink, fontWeight: '800', fontSize: 17 }, profileMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }, meta: { flexDirection: 'row', alignItems: 'center', gap: 5 }, metaText: { color: theme.colors.muted, fontSize: 12 }, explanation: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 }, priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, price: { color: theme.colors.deep, fontSize: 19, fontWeight: '800' }, perHour: { fontWeight: '500', fontSize: 12, color: theme.colors.muted }, exclusion: { gap: 3, paddingVertical: 5 }, exclusionName: { color: theme.colors.ink, fontSize: 13, fontWeight: '700' }
});
