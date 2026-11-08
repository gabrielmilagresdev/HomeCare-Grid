import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { BottomNavigation } from '../../components/ui/BottomNavigation';
import { Avatar, Badge, Chip, Field, Screen, StateMessage } from '../../components/ui/Primitives';
import { evaluateProfessional, rankProfessionals } from '../../domain/rules/matching.ts';
import { parseHourlyPriceLimit } from '../../domain/schemas/index.ts';
import type { CareRequest, TimeWindow } from '../../domain/types/index.ts';
import { theme } from '../../theme/tokens';
import { useDemo } from '../demo/DemoContext';
import { portraitFor } from '../demo/portraits';
import { money, regionLabel, regions, windowLabel } from '../demo/format';

type FilterPanel = 'date' | 'price' | 'more' | null;

export function MarketplaceScreen() {
  const { engine, activeUserId, search, setSearch, intent, setIntent, conciergeNotice, serviceChoiceRequired, chooseService, suggestIntent } = useDemo();
  const largeText = useWindowDimensions().fontScale >= 1.4;
  const [panel, setPanel] = useState<FilterPanel>(null);
  const [editingIntent, setEditingIntent] = useState(false);
  const [applyingIntent, setApplyingIntent] = useState(false);
  const [intentError, setIntentError] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'low' | 'high'>('low');
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
  const service = fixture.services.find(item => item.id === search.serviceId);
  if (!service) return <Screen title="Encontre cuidado"><StateMessage title="Catálogo indisponível" message="Volte ao início e tente novamente." /></Screen>;
  const requestFor = (window: TimeWindow): CareRequest => ({ id: 'demo-preview', recipientId: fixture.recipient.id,
    requesterUserId: activeUserId ?? '', serviceId: service.id, regionCode: search.regionCode,
    startsAt: window.startsAt, endsAt: window.endsAt, requiredAccessibilityTags: search.accessibilityTags,
    maxPriceCents: search.maxPriceCents });
  const ranked = serviceChoiceRequired || budgetError ? [] : rankProfessionals(requestFor(search.window), service, fixture.professionals);
  const filtered = ranked.filter(item => fixture.professionals.find(pro => pro.id === item.professionalId)?.displayName.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  const visible = sort === 'high' ? [...filtered].reverse() : filtered;
  const update = (patch: Partial<typeof search>) => setSearch({ ...search, ...patch });
  const setBudgetFromText = (value: string) => {
    setBudget(value);
    const result = parseHourlyPriceLimit(value);
    if (!result.ok) { setBudgetError(result.error.message); return; }
    setBudgetError('');
    lastLocalBudget.current = result.data;
    update({ maxPriceCents: result.data });
  };
  const openSlot = (professionalId: string, window: TimeWindow) => {
    update({ window });
    router.push(`/(patient)/profile/${professionalId}`);
  };

  return <Screen header={false} footer={false} compact bottom={<BottomNavigation active="home" />}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Voltar ao início" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={21} color={theme.colors.ink} /></Pressable>
      <View style={styles.headerText}><Text accessibilityRole="header" style={styles.title}>{serviceChoiceRequired ? 'Escolha o serviço' : service.name}</Text><Text style={styles.subtitle}>{serviceChoiceRequired ? 'Defina o tipo de cuidado' : `Em casa · ${regionLabel(search.regionCode)}`}</Text></View></View>

    {editingIntent ? <View style={styles.intentEditor}><TextInput accessibilityLabel="Editar sua busca" value={intent} onChangeText={setIntent} maxLength={500} multiline autoFocus
        placeholder="Descreva o cuidado que procura" placeholderTextColor={theme.colors.textMuted} style={styles.intentInput} />
      <Pressable accessibilityRole="button" accessibilityLabel="Aplicar busca" accessibilityState={{ disabled: !intent.trim() || applyingIntent, busy: applyingIntent }} disabled={!intent.trim() || applyingIntent}
        onPress={async () => { setApplyingIntent(true); setIntentError(''); try { const result = await suggestIntent(intent); if (result.ok) setEditingIntent(false); else setIntentError(result.error.message); } finally { setApplyingIntent(false); } }} style={[styles.apply, (!intent.trim() || applyingIntent) && styles.applyDisabled]}><Text style={styles.applyText}>Aplicar busca</Text>{applyingIntent ? <ActivityIndicator color={theme.colors.ink} /> : <Ionicons name="arrow-forward" size={17} color={theme.colors.ink} />}</Pressable>
      {!!intentError && <Text accessibilityRole="alert" style={styles.error}>{intentError}</Text>}
    </View> : <Pressable accessibilityRole="button" accessibilityLabel="Editar sua busca" onPress={() => setEditingIntent(true)} style={styles.intentCompact}><Text numberOfLines={2} style={[styles.intentSummary, !intent && styles.intentPlaceholder]}>{intent || 'Descreva o cuidado que procura'}</Text><Ionicons name="create-outline" size={20} color={theme.colors.ink} /></Pressable>}
    {!!conciergeNotice && <View style={styles.notice}><Ionicons name="information-circle-outline" size={18} color={theme.colors.ink} /><Text accessibilityRole="alert" style={styles.noticeText}>{conciergeNotice}</Text></View>}

    <View style={styles.filterBar}>
      <Pressable accessibilityRole="button" accessibilityLabel="Data" accessibilityState={{ expanded: panel === 'date' }} onPress={() => setPanel(panel === 'date' ? null : 'date')} style={[styles.filterButton, panel === 'date' && styles.filterActive]}><Ionicons name="calendar-outline" size={16} color={theme.colors.ink} /><Text style={styles.filterText}>Data</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Preço" accessibilityState={{ expanded: panel === 'price' }} onPress={() => setPanel(panel === 'price' ? null : 'price')} style={[styles.filterButton, panel === 'price' && styles.filterActive]}><Text style={styles.filterText}>Preço</Text><Ionicons name="chevron-down" size={15} color={theme.colors.ink} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Mais filtros" accessibilityState={{ expanded: panel === 'more' }} onPress={() => setPanel(panel === 'more' ? null : 'more')} style={[styles.filterButton, panel === 'more' && styles.filterActive]}><Ionicons name="options-outline" size={16} color={theme.colors.ink} /><Text style={styles.filterText}>Mais filtros</Text></Pressable>
    </View>
    {panel && <View style={styles.filterPanel}>
      {panel === 'date' && <><Text style={styles.filterTitle}>Quando você precisa?</Text><View style={styles.chips}>
        <Chip label={`Manhã · ${windowLabel(fixture.suggestedWindow).split('·')[1]?.trim() ?? ''}`} selected={search.window.startsAt === fixture.suggestedWindow.startsAt} onPress={() => update({ window: fixture.suggestedWindow })} />
        <Chip label={`Tarde · ${windowLabel(fixture.alternateWindow).split('·')[1]?.trim() ?? ''}`} selected={search.window.startsAt === fixture.alternateWindow.startsAt} onPress={() => update({ window: fixture.alternateWindow })} />
      </View></>}
      {panel === 'price' && <><Field label="Valor máximo por hora (R$, opcional)" value={budget} onChangeText={setBudgetFromText} placeholder="Ex.: 100" />{!!budgetError && <Text accessibilityRole="alert" style={styles.error}>{budgetError}</Text>}</>}
      {panel === 'more' && <><Text style={styles.filterTitle}>Tipo de serviço</Text><View style={styles.chips}>{fixture.services.map(item => <Chip key={item.id} label={item.name} selected={!serviceChoiceRequired && item.id === search.serviceId} onPress={() => chooseService(item.id)} />)}</View>
        <Text style={styles.filterTitle}>Região</Text><View style={styles.chips}>{regions.map(item => <Chip key={item.code} label={item.label} selected={item.code === search.regionCode} onPress={() => update({ regionCode: item.code })} />)}</View>
        <Text style={styles.filterTitle}>Acessibilidade</Text><View style={styles.chips}><Chip label="Apoio à mobilidade" selected={search.accessibilityTags.includes('mobilidade')} onPress={() => update({ accessibilityTags: search.accessibilityTags.includes('mobilidade') ? [] : ['mobilidade'] })} /></View>
        <Field label="Buscar por nome" value={query} onChangeText={setQuery} placeholder="Nome do profissional" />
      </>}
    </View>}

    {serviceChoiceRequired ? <View style={styles.clarify}><Text accessibilityRole="header" style={styles.clarifyTitle}>Qual cuidado você procura?</Text><Text style={styles.body}>Escolha um serviço para consultar disponibilidade. O texto informado não define um cuidado clínico automaticamente.</Text><View style={styles.chips}>{fixture.services.map(item => <Chip key={item.id} label={item.name} onPress={() => chooseService(item.id)} />)}</View></View> : <>
      <View style={styles.resultsHead}><View style={styles.resultsCopy}><Text accessibilityRole="header" style={styles.resultsTitle}>{budgetError ? 'Revise o preço' : `${visible.length} ${visible.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}`}</Text><Text style={styles.body}>{regionLabel(search.regionCode)} · {windowLabel(search.window)}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={sort === 'low' ? 'Ordenar do maior para o menor preço' : 'Ordenar do menor para o maior preço'} onPress={() => setSort(sort === 'low' ? 'high' : 'low')} style={styles.sort}><Text style={styles.sortText}>Ordenar</Text><Ionicons name="chevron-down" size={16} color={theme.colors.ink} /></Pressable></View>
      {budgetError ? <StateMessage title="Confira o valor máximo" message="Use apenas números em reais ou apague o campo para remover o limite." action="Ajustar preço" onAction={() => setPanel('price')} /> : visible.length ? visible.map((match, index) => {
        const professional = fixture.professionals.find(item => item.id === match.professionalId);
        if (!professional) return null;
        const slots = [fixture.suggestedWindow, fixture.alternateWindow].filter(window => evaluateProfessional(requestFor(window), service, professional).eligible);
        return <View key={professional.id} style={styles.profileCard}>
          <View style={styles.profileTop}><Avatar name={professional.displayName} source={portraitFor(professional.id)} tone={index % 2 ? 'blue' : 'peach'} size={52} /><View style={styles.profileIdentity}><Text style={styles.profileName}>{professional.displayName}</Text><Text style={styles.profileService}>{service.name}</Text><Text style={styles.profileRegion}>{regionLabel(search.regionCode)} · Atendimento em casa</Text></View></View>
          <View style={styles.badges}>
            <Badge label="Ainda sem avaliações" tone="neutral" /></View>
          <Text style={styles.slotLabel}>HORÁRIOS DISPONÍVEIS</Text><View style={styles.slots}>{slots.map(window => <Pressable key={window.startsAt} accessibilityRole="button" accessibilityLabel={`Escolher ${windowLabel(window)} com ${professional.displayName}`} onPress={() => openSlot(professional.id, window)} style={[styles.slot, window.startsAt === search.window.startsAt && styles.slotSelected]}><Text style={styles.slotText}>{windowLabel(window).split('·')[1]?.trim()}</Text></Pressable>)}</View>
          <View style={[styles.cardFoot, largeText && styles.cardFootLarge]}><View><Text style={styles.price}>{money(professional.hourlyPriceCents)}<Text style={styles.perHour}> / hora</Text></Text><Text style={styles.demoNote}>Deslocamento incluído</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Ver perfil de ${professional.displayName}`} onPress={() => router.push(`/(patient)/profile/${professional.id}`)} style={[styles.profileAction, largeText && styles.profileActionLarge]}><Text style={styles.profileActionText}>Ver perfil</Text><Ionicons name="arrow-forward" size={17} color={theme.colors.white} /></Pressable></View>
        </View>;
      }) : <StateMessage icon="search-outline" title={ranked.length ? 'Nome não encontrado' : 'Não encontramos horários com esses filtros.'} message={ranked.length ? 'Tente outro nome ou remova o filtro.' : 'Ajuste serviço, região, horário ou preço. Você também pode registrar seu interesse.'} action={ranked.length ? 'Limpar nome' : 'Ajustar busca'} onAction={() => ranked.length ? setQuery('') : setPanel('more')} />}
      {!ranked.length && !budgetError && <Pressable accessibilityRole="button" onPress={() => router.push('/(patient)/demand')} style={styles.demand}><Text style={styles.demandText}>Registrar demanda voluntariamente</Text><Ionicons name="arrow-forward" size={17} color={theme.colors.ink} /></Pressable>}
      <Text style={styles.disclaimer}>Resultados baseados em serviço, região e horário. Escolha o profissional que melhor atende você.</Text>
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, back: { width: 44, height: 44, borderRadius: 11, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderStrong, alignItems: 'center', justifyContent: 'center' }, headerText: { flex: 1, gap: 3 }, title: { color: theme.colors.ink, fontSize: 21, lineHeight: 27, fontWeight: '700', letterSpacing: -0.5 }, subtitle: { color: theme.colors.muted, fontSize: 13 },
  intentCompact: { minHeight: 58, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface, paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 9 }, intentSummary: { flex: 1, color: theme.colors.ink, fontSize: 15, lineHeight: 22 }, intentPlaceholder: { color: theme.colors.muted }, intentEditor: { borderRadius: 12, borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface, padding: 12, gap: 6 }, intentInput: { minHeight: 42, color: theme.colors.ink, fontSize: 15, lineHeight: 22, textAlignVertical: 'top' }, apply: { alignSelf: 'flex-end', minHeight: 44, paddingHorizontal: 12, borderRadius: 10, backgroundColor: theme.colors.accent, flexDirection: 'row', alignItems: 'center', gap: 7 }, applyDisabled: { opacity: 0.45 }, applyText: { color: theme.colors.ink, fontSize: 13, fontWeight: '700' },
  notice: { flexDirection: 'row', gap: 8, padding: 9, borderRadius: 11, backgroundColor: theme.colors.surfaceMuted }, noticeText: { flex: 1, color: theme.colors.ink, fontSize: 12, lineHeight: 17 }, filterBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, filterButton: { minHeight: 44, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface }, filterActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.ink }, filterText: { color: theme.colors.ink, fontSize: 13, fontWeight: '700' }, filterPanel: { padding: 15, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, gap: 13 }, filterTitle: { color: theme.colors.ink, fontSize: 14, fontWeight: '700' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, error: { color: theme.colors.error, fontSize: 13 },
  clarify: { borderRadius: 16, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, padding: 18, gap: 13 }, clarifyTitle: { color: theme.colors.ink, fontSize: 19, fontWeight: '700' }, body: { color: theme.colors.muted, fontSize: 13, lineHeight: 19 }, resultsHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, resultsCopy: { flex: 1, gap: 5 }, resultsTitle: { color: theme.colors.ink, fontSize: 19, lineHeight: 24, fontWeight: '700' }, sort: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 3 }, sortText: { color: theme.colors.ink, fontSize: 12, fontWeight: '700' },
  profileCard: { borderRadius: 16, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, padding: 16, gap: 14 }, profileTop: { flexDirection: 'row', gap: 11, alignItems: 'center' }, profileIdentity: { flex: 1, gap: 2 }, profileName: { color: theme.colors.ink, fontSize: 17, fontWeight: '700' }, profileService: { color: theme.colors.muted, fontSize: 13 }, profileRegion: { color: theme.colors.muted, fontSize: 12 }, badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, slotLabel: { color: theme.colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 }, slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, slot: { minHeight: 44, paddingHorizontal: 13, borderRadius: 9, borderWidth: 1, borderColor: theme.colors.borderStrong, justifyContent: 'center' }, slotSelected: { backgroundColor: theme.colors.accent, borderColor: theme.colors.ink }, slotText: { color: theme.colors.ink, fontSize: 13, fontWeight: '700' }, cardFoot: { borderTopWidth: 1, borderColor: theme.colors.line, paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, cardFootLarge: { flexDirection: 'column', alignItems: 'stretch' }, price: { color: theme.colors.ink, fontSize: 19, fontWeight: '700' }, perHour: { color: theme.colors.muted, fontSize: 12, fontWeight: '400' }, demoNote: { color: theme.colors.muted, fontSize: 11, marginTop: 3 }, profileAction: { minHeight: 44, paddingHorizontal: 11, borderRadius: 10, backgroundColor: theme.colors.ink, flexDirection: 'row', alignItems: 'center', gap: 5 }, profileActionLarge: { alignSelf: 'stretch', justifyContent: 'center' }, profileActionText: { color: theme.colors.white, fontSize: 13, fontWeight: '700' }, demand: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, borderRadius: 11, backgroundColor: theme.colors.accent }, demandText: { color: theme.colors.ink, fontSize: 13, fontWeight: '700' }, disclaimer: { color: theme.colors.muted, fontSize: 11, lineHeight: 17 }
});
