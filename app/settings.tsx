import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Linking, Modal, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { Press, Screen, Txt } from '@/src/components/ui';
import { APP_INTENTS_ENABLED, CONTACT_EMAIL } from '@/src/config';
import { localeChoices } from '@/src/i18n';
import { useI18n } from '@/src/i18n/useI18n';
import { notificationPermission, requestNotificationPermission } from '@/src/services/notifications';
import { useUpdates } from '@/src/services/updates';
import { actions, useApp } from '@/src/store/store';
import { useTheme } from '@/src/theme/theme';
import { themeOrder } from '@/src/theme/themes';

export default function SettingsScreen() {
  const { settings } = useApp();
  const { t } = useI18n();
  const { palette } = useTheme();
  const updates = useUpdates();
  const [perm, setPerm] = useState('undetermined');
  const [langOpen, setLangOpen] = useState(false);
  const [restoreNote, setRestoreNote] = useState<'restored' | 'none' | 'failed' | null>(null);
  useEffect(() => {
    void notificationPermission().then(setPerm);
  }, []);
  const currentLanguage =
    settings.locale === 'system' ? t('system') : (localeChoices.find((item) => item.id === settings.locale)?.nativeName ?? t('system'));

  return (
    <Screen scroll>
      <Press onPress={() => router.back()}>
        <Txt color={palette.muted}>{t('close')}</Txt>
      </Press>
      <Txt size={32} weight="extra">
        {t('settings')}
      </Txt>

      <Section title={t('sectionFocus')}>
        <Row label={t('sound')} value={settings.sound} onChange={(sound) => actions.setSettings({ sound })} />
        <Row label={t('haptics')} value={settings.haptics} onChange={(haptics) => actions.setSettings({ haptics })} />
        <Txt weight="bold">{t('checkins')}</Txt>
        <Txt color={palette.muted} size={14}>
          {t('checkinsHint')}
        </Txt>
        <Row label={t('checkins')} value={settings.checkIns} onChange={(checkIns) => actions.setSettings({ checkIns })} />
        <Txt weight="bold">{t('metronome')}</Txt>
        <Txt color={palette.muted} size={14}>
          {t('metronomeHint')}
        </Txt>
        <Row label={t('metronome')} value={settings.metronome} onChange={(metronome) => actions.setSettings({ metronome })} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {([30, 60, 90] as const).map((sec) => (
            <Press
              key={sec}
              onPress={() => actions.setSettings({ metronomeSec: sec })}
              style={{ padding: 10, borderRadius: 12, backgroundColor: settings.metronomeSec === sec ? palette.accent : palette.bg }}>
              <Txt color={settings.metronomeSec === sec ? palette.accentInk : palette.ink}>{sec}s</Txt>
            </Press>
          ))}
        </View>
      </Section>

      <Section title={t('notifications')}>
        <Txt>{perm === 'granted' ? t('notifOn') : t('notifOff')}</Txt>
        <Press
          onPress={() => {
            void (async () => {
              const ok = await requestNotificationPermission();
              setPerm(ok ? 'granted' : 'denied');
              actions.markNotifPrompted();
              if (!ok) void Linking.openSettings();
            })();
          }}>
          <Txt color={palette.accent}>{perm === 'denied' ? t('notifSettings') : t('notifEnable')}</Txt>
        </Press>
        <Row label={t('planReminder')} value={settings.planReminder} onChange={(planReminder) => actions.setSettings({ planReminder })} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Txt>{t('reminderHour')}</Txt>
          <Press onPress={() => actions.setSettings({ planHour: (settings.planHour + 23) % 24 })}>
            <Txt size={20}>−</Txt>
          </Press>
          <Txt weight="bold">{String(settings.planHour).padStart(2, '0')}:00</Txt>
          <Press onPress={() => actions.setSettings({ planHour: (settings.planHour + 1) % 24 })}>
            <Txt size={20}>+</Txt>
          </Press>
        </View>
        <Row label={t('streakReminder')} value={settings.streakReminder} onChange={(streakReminder) => actions.setSettings({ streakReminder })} />
      </Section>

      <Section title={t('sectionLook')}>
        <Txt weight="bold">{t('theme')}</Txt>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {themeOrder.map((id) => (
            <Press
              key={id}
              onPress={() => {
                const result = actions.setSettings({ themeId: id });
                if (result === 'locked') router.push('/paywall');
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: id === 'justora' ? '#F0A88A' : id === 'tide' ? '#7EB8B0' : id === 'grove' ? '#8FAF86' : id === 'dusk' ? '#B7A4D6' : '#2C2825',
                borderWidth: settings.themeId === id ? 3 : 0,
                borderColor: palette.ink,
              }}
            />
          ))}
        </View>
        <Press
          onPress={() => setLangOpen(true)}
          style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Txt>{t('language')}</Txt>
          <Txt weight="bold" color={palette.accent}>
            {currentLanguage}
          </Txt>
        </Press>
      </Section>

      <Section title={t('sectionPro')}>
        <Press
          onPress={() => {
            void actions.restore().then((result) => setRestoreNote(result));
          }}>
          <Txt weight="bold">{t('restore')}</Txt>
        </Press>
        {restoreNote === 'restored' ? <Txt>{t('restored')}</Txt> : null}
        {restoreNote === 'none' ? <Txt>{t('restoreNone', { account: Platform.OS === 'android' ? t('accountGoogle') : t('accountApple') })}</Txt> : null}
        {restoreNote === 'failed' ? <Txt>{t('restoreFail')}</Txt> : null}
      </Section>

      <Section title={t('sectionAbout')}>
        <Press onPress={() => router.push('/privacy')}>
          <Txt>{t('privacy')}</Txt>
        </Press>
        <Press onPress={() => router.push('/terms')}>
          <Txt>{t('terms')}</Txt>
        </Press>
        <Txt weight="bold">{t('contact')}</Txt>
        <Press onPress={() => void Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
          <Txt color={palette.accent}>{CONTACT_EMAIL}</Txt>
        </Press>
        <Txt weight="bold">{t('widgetTitle')}</Txt>
        <Txt color={palette.muted}>{Platform.OS === 'ios' ? t('widgetBody') : t('widgetBodyAndroid')}</Txt>
        {APP_INTENTS_ENABLED ? (
          <>
            <Txt weight="bold">{t('intentsTitle')}</Txt>
            <Txt color={palette.muted}>{t('intentsBody')}</Txt>
          </>
        ) : null}
        <Press onPress={() => void updates.check(true)}>
          <Txt>{t('updatesCheck')}</Txt>
        </Press>
        <Txt color={palette.muted}>
          {updates.phase === 'ready'
            ? t('updatesReady')
            : updates.phase === 'placeholder'
              ? t('updatesPlaceholder')
              : updates.phase === 'dev'
                ? t('updatesDev')
                : t('updatesNone')}
        </Txt>
        {__DEV__ ? <Row label={t('previewPro')} value={settings.previewPro} onChange={(previewPro) => actions.setSettings({ previewPro })} /> : null}
        <Txt color={palette.muted}>
          {t('version')} {Constants.expoConfig?.version ?? '1.0.0'}
        </Txt>
      </Section>

      <Modal visible={langOpen} transparent animationType="slide" onRequestClose={() => setLangOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(28,23,20,0.4)' }]} onPress={() => setLangOpen(false)} />
          <View style={{ backgroundColor: palette.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 4, paddingBottom: 28 }}>
            <Txt size={20} weight="extra">
              {t('language')}
            </Txt>
            <Press
              onPress={() => {
                actions.setSettings({ locale: 'system' });
                setLangOpen(false);
              }}
              style={{ minHeight: 48, justifyContent: 'center' }}>
              <Txt weight={settings.locale === 'system' ? 'extra' : 'body'}>{t('system')}</Txt>
            </Press>
            {localeChoices.map((item) => (
              <Press
                key={item.id}
                onPress={() => {
                  actions.setSettings({ locale: item.id });
                  setLangOpen(false);
                }}
                style={{ minHeight: 48, justifyContent: 'center' }}>
                <Txt weight={settings.locale === item.id ? 'extra' : 'body'}>{item.nativeName}</Txt>
              </Press>
            ))}
            <Press onPress={() => setLangOpen(false)} style={{ minHeight: 44, justifyContent: 'center' }}>
              <Txt color={palette.muted}>{t('close')}</Txt>
            </Press>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { palette } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <Txt weight="extra" size={18}>
        {title}
      </Txt>
      <View style={{ backgroundColor: palette.card, borderRadius: 20, padding: 14, gap: 10 }}>{children}</View>
    </View>
  );
}

function Row({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  const { palette } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48 }}>
      <Txt style={{ flex: 1, paddingRight: 12 }}>{label}</Txt>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: palette.accent, false: palette.line }} />
    </View>
  );
}
