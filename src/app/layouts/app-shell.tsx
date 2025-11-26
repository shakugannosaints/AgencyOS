import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, BriefcaseBusiness, Atom, ScrollText, Orbit, Settings } from 'lucide-react'
import { CommandStrip } from '@/components/ui/command-strip'
import { cn } from '@/lib/utils'
import { getAgencySnapshot, useCampaignStore } from '@/stores/campaign-store'
import { useCampaignPersistence } from '@/stores/hooks/use-campaign-persistence'
import { createSnapshotEnvelope, parseSnapshotFile } from '@/services/db/repository'
import { useThemeStore } from '@/stores/theme-store'
import { useTranslation } from 'react-i18next'

export function AppShell() {
  const { t } = useTranslation()
  useCampaignPersistence()
  const campaign = useCampaignStore((state) => state.campaign)
  const missions = useCampaignStore((state) => state.missions)
  const updateCampaign = useCampaignStore((state) => state.updateCampaign)
  const activeMission = missions.find((mission) => mission.status === 'active') ?? missions[0]
  const chaosValue = activeMission?.chaos ?? 0
  const looseEndsValue = missions.reduce((sum, mission) => sum + (mission.looseEnds ?? 0), 0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [isEditingHeader, setIsEditingHeader] = useState(false)
  const [headerDraft, setHeaderDraft] = useState({
    name: '',
    divisionCode: '',
    status: '',
    styleText: '',
  })
  const themeMode = useThemeStore((state) => state.mode)
  const isWin98 = themeMode === 'win98'
  const isRetro = themeMode === 'retro'
  const isSquare = isWin98 || isRetro

  const navItems = [
    { label: t('app.nav.dashboard'), path: '/', icon: LayoutDashboard },
    { label: t('app.nav.agents'), path: '/agents', icon: Users },
    { label: t('app.nav.missions'), path: '/missions', icon: BriefcaseBusiness },
    { label: t('app.nav.anomalies'), path: '/anomalies', icon: Atom },
    { label: t('app.nav.reports'), path: '/reports', icon: ScrollText },
    { label: t('app.nav.tracks'), path: '/tracks', icon: Orbit },
    { label: t('app.nav.settings'), path: '/settings', icon: Settings },
  ]

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.theme = themeMode
  }, [themeMode])

  const handleExportSnapshot = () => {
    const snapshot = getAgencySnapshot()
    const envelope = createSnapshotEnvelope(snapshot)
    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const filename = `agency-os-${snapshot.campaign.divisionCode}-${Date.now()}.json`
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setImportMessage(t('app.common.exportSuccess'))
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportMessage(null)
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const snapshot = parseSnapshotFile(parsed)
      useCampaignStore.getState().hydrate(snapshot)
      setImportMessage(t('app.common.importSuccess'))
    } catch (error) {
      console.error('[AgencyOS] 导入失败', error)
      setImportMessage(error instanceof Error ? error.message : t('app.common.importError'))
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  const openHeaderEditor = () => {
    setHeaderDraft({
      name: campaign.name,
      divisionCode: campaign.divisionCode,
      status: campaign.status,
      styleText: campaign.styleTags.join(' / '),
    })
    setIsEditingHeader(true)
  }

  const cancelHeaderEdit = () => {
    setIsEditingHeader(false)
  }

  const confirmHeaderEdit = () => {
    const styleTags = headerDraft.styleText
      .split('/')
      .map((tag) => tag.trim())
      .filter(Boolean)
    updateCampaign({
      name: headerDraft.name.trim() || campaign.name,
      divisionCode: headerDraft.divisionCode.trim() || campaign.divisionCode,
      status: (headerDraft.status.trim() as typeof campaign.status) || campaign.status,
      styleTags,
    })
    setIsEditingHeader(false)
  }

  return (
    <div className="min-h-screen bg-agency-ink/95 px-4 py-6 text-agency-cyan">
      <div className="mx-auto grid max-w-[1400px] gap-6 lg:grid-cols-[260px_1fr]">
        <aside
          className={cn(
            'space-y-6 border border-agency-border bg-agency-panel/80 p-4',
            isSquare ? 'rounded-none' : 'rounded-3xl shadow-panel',
          )}
        >
          {isWin98 && (
            <div className="win98-title-bar -mx-3 -mt-3 mb-4 flex items-center justify-between px-2 py-1">
              <span className="text-sm font-bold">Agency OS</span>
              <div className="flex gap-1">
                <div className="flex h-4 w-4 items-center justify-center bg-[#c0c0c0] text-[10px] text-black shadow-[inset_-1px_-1px_#000000,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] active:shadow-[inset_1px_1px_#000000,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]">
                  ?
                </div>
                <div className="flex h-4 w-4 items-center justify-center bg-[#c0c0c0] text-[10px] text-black shadow-[inset_-1px_-1px_#000000,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] active:shadow-[inset_1px_1px_#000000,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]">
                  X
                </div>
              </div>
            </div>
          )}
          <header className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className={cn("text-xs uppercase tracking-[0.4em]", isWin98 ? "text-black" : "text-red-500")}>Agency OS</p>
              <button
                type="button"
                onClick={openHeaderEditor}
                className={cn(
                  "rounded-full border border-agency-border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.25em] text-agency-muted hover:border-agency-cyan hover:text-agency-cyan",
                  isWin98 && "rounded-none bg-[#c0c0c0] text-black shadow-[inset_-1px_-1px_#000000,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] active:shadow-[inset_1px_1px_#000000,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]",
                  isRetro && "rounded-none"
                )}
              >
                {t('app.common.edit')}
              </button>
            </div>
            {isEditingHeader ? (
              <div className="space-y-2 text-xs text-agency-muted">
                <div>
                  <label className="block text-[0.6rem] uppercase tracking-[0.25em]">{t('app.common.divisionName')}</label>
                  <input
                    className={cn(
                      'mt-1 w-full border border-agency-border bg-agency-ink/40 px-2 py-1 text-sm text-agency-cyan outline-none focus:border-agency-cyan',
                      isSquare ? 'rounded-none' : 'rounded-xl',
                    )}
                    value={headerDraft.name}
                    onChange={(e) => setHeaderDraft((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[0.6rem] uppercase tracking-[0.25em]">{t('app.common.divisionCode')}</label>
                  <input
                    className={cn(
                      'mt-1 w-full border border-agency-border bg-agency-ink/40 px-2 py-1 text-sm text-agency-cyan outline-none focus:border-agency-cyan',
                      isSquare ? 'rounded-none' : 'rounded-xl',
                    )}
                    value={headerDraft.divisionCode}
                    onChange={(e) => setHeaderDraft((prev) => ({ ...prev, divisionCode: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[0.6rem] uppercase tracking-[0.25em]">{t('app.common.status')}</label>
                  <input
                    className={cn(
                      'mt-1 w-full border border-agency-border bg-agency-ink/40 px-2 py-1 text-sm text-agency-cyan outline-none focus:border-agency-cyan',
                      isSquare ? 'rounded-none' : 'rounded-xl',
                    )}
                    value={headerDraft.status}
                    onChange={(e) => setHeaderDraft((prev) => ({ ...prev, status: e.target.value }))}
                    placeholder={campaign.status}
                  />
                </div>
                <div>
                  <label className="block text-[0.6rem] uppercase tracking-[0.25em]">{t('app.common.tags')}</label>
                  <input
                    className={cn(
                      'mt-1 w-full border border-agency-border bg-agency-ink/40 px-2 py-1 text-sm text-agency-cyan outline-none focus:border-agency-cyan',
                      isSquare ? 'rounded-none' : 'rounded-xl',
                    )}
                    value={headerDraft.styleText}
                    onChange={(e) => setHeaderDraft((prev) => ({ ...prev, styleText: e.target.value }))}
                    placeholder={campaign.styleTags.join(' / ')}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cancelHeaderEdit}
                    className={cn(
                      'border border-agency-border px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-agency-muted hover:border-agency-amber hover:text-agency-amber',
                      isSquare ? 'rounded-none' : 'rounded-xl',
                    )}
                  >
                    {t('app.common.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={confirmHeaderEdit}
                    className={cn(
                      'border border-agency-cyan px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-agency-cyan hover:bg-agency-cyan/10',
                      isSquare ? 'rounded-none' : 'rounded-xl',
                    )}
                  >
                    {t('app.common.save')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xl font-semibold text-white">{campaign.name}</p>
                <p className="text-xs text-agency-muted">
                  {t('app.common.status')}：{campaign.status} · {campaign.styleTags.join(' / ')}
                </p>
              </>
            )}
          </header>

          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between border px-4 py-3 font-mono text-xs uppercase tracking-[0.35em] transition',
                    isActive
                      ? cn(
                          'border-agency-cyan/80 bg-agency-ink text-white',
                          isWin98 ? 'rounded-none shadow-none win98-active' : (isRetro ? 'rounded-none shadow-none' : 'rounded-2xl shadow-panel'),
                        )
                      : cn(
                          'border-agency-border/60 text-agency-muted hover:border-agency-cyan/40 hover:text-agency-cyan',
                          isSquare ? 'rounded-none' : 'rounded-2xl',
                        ),
                  )
                }
              >
                <span className="flex items-center gap-3 text-base tracking-normal">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                {/* 浏览器环境下快捷键不可用，隐藏原有提示 */}
                <span className="text-[0.65rem] text-agency-muted" />
              </NavLink>
            ))}
          </div>

          <div className="space-y-2 text-[0.65rem] text-agency-muted">
            <p className="uppercase tracking-[0.5em]">{t('app.common.chaos')}</p>
            <div
              className={cn(
                'border border-agency-magenta/40 bg-gradient-to-r from-agency-magenta/20 to-transparent p-3 font-mono',
                isSquare ? 'rounded-none' : 'rounded-2xl',
              )}
            >
              <p>{t('app.common.current')}：{chaosValue}</p>
              <p>{t('app.common.looseEnds')}：{looseEndsValue}</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <CommandStrip label={t('app.common.session')} value={campaign.divisionCode} />
            <CommandStrip label={t('app.common.nextBriefing')} value={activeMission?.code ?? '—'} />
            <CommandStrip label={t('app.common.weather')} value={`${t('app.common.looseEnds')}×${looseEndsValue}`} />
          </div>
          <div
            className={cn(
              'border border-agency-border/60 p-4 text-[0.65rem] uppercase tracking-[0.4em] text-agency-muted',
              isSquare ? 'rounded-none bg-agency-panel' : 'rounded-3xl bg-agency-ink/40',
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span>{t('app.common.snapshot')}</span>
              <div className="flex flex-wrap gap-2 text-xs normal-case">
                <button
                  type="button"
                  onClick={handleExportSnapshot}
                  className={cn(
                    'border border-agency-cyan/40 px-3 py-1 font-mono text-agency-cyan hover:border-agency-cyan',
                    isSquare ? 'rounded-none' : 'rounded-xl',
                  )}
                >
                  {t('app.common.export')}
                </button>
                <button
                  type="button"
                  onClick={handleImportClick}
                  className={cn(
                    'border border-agency-border px-3 py-1 font-mono text-agency-muted hover:border-agency-cyan hover:text-agency-cyan',
                    isSquare ? 'rounded-none' : 'rounded-xl',
                  )}
                  disabled={importing}
                >
                  {importing ? t('app.common.importing') : t('app.common.import')}
                </button>
                <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportChange} />
              </div>
            </div>
            {importMessage ? <p className="mt-2 text-[0.65rem] normal-case text-agency-amber">{importMessage}</p> : null}
          </div>
          <div
            className={cn(
              'border border-agency-border/80 bg-agency-panel/70 p-6 backdrop-blur',
              isSquare ? 'rounded-none' : 'rounded-3xl shadow-panel',
            )}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
