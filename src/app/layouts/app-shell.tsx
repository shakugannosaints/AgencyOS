import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, BriefcaseBusiness, Atom, ScrollText, Orbit, Settings, Notebook, BookOpen, Book, Eye, Mail, CheckSquare, Tornado, Trash2, Volume2 } from 'lucide-react'
import { CommandStrip } from '@/components/ui/command-strip'
import { cn } from '@/lib/utils'
import { getAgencySnapshot, useCampaignStore } from '@/stores/campaign-store'
import { useCampaignPersistence } from '@/stores/hooks/use-campaign-persistence'
import { createSnapshotEnvelope, parseSnapshotFile } from '@/services/db/repository'
import { useThemeStore } from '@/stores/theme-store'
import { getWeatherRuleForCount } from '@/lib/weather-utils'
import { useNavTranslations, useCommonTranslations, useTrans } from '@/lib/i18n-utils'
import type { MissionSummary } from '@/lib/types'
import { EmergencyChat } from '@/modules/emergency/components/emergency-chat'
import { DomController } from '@/modules/emergency/components/dom-controller'
import { EmergencyManager } from '@/modules/emergency/components/emergency-manager'
import { DesktopNotepad } from '@/modules/desktop/components/notepad'
import { VoidSchedule } from '@/modules/desktop/components/void-schedule'
import { CommendationClicker } from '@/modules/desktop/components/commendation'
import { EmergencyInbox } from '@/modules/desktop/components/emergency-inbox'
import { ChaosController } from '@/modules/desktop/components/chaos-controller'
import { StartMenu } from '@/modules/desktop/components/start-menu'
import { LoginScreen } from '@/modules/system/components/login-screen'
import { IconWin98Manual } from '@/components/icons/win98/icon-manual'
import { IconWin98Antivirus } from '@/components/icons/win98/icon-antivirus'
import { IconWin98Emergency } from '@/components/icons/win98/icon-emergency'
import { IconWin98Commendation } from '@/components/icons/win98/icon-commendation'
import { IconWin98Chaos } from '@/components/icons/win98/icon-chaos'
import { IconWin98Schedule } from '@/components/icons/win98/icon-schedule'

interface DesktopItem {
  id: string
  icon: React.ElementType
}

const DESKTOP_ITEMS: DesktopItem[] = [
  { id: 'manual', icon: Book },
  { id: 'antivirus', icon: Eye },
  { id: 'emergency', icon: Mail },
  { id: 'commendation', icon: CheckSquare },
  { id: 'chaos', icon: Tornado },
  { id: 'schedule', icon: Trash2 },
]

export function AppShell() {
  useCampaignPersistence()
  const t = useTrans()
  const { dashboard, agents, missions: navMissions, anomalies, reports, notes, tracks, settings, rules } = useNavTranslations()
  const { edit, divisionName, divisionCode, status, tags, cancel, save, current, chaos, looseEnds, session, nextBriefing, weather, snapshot, export: exportText, import: importText, importing: importingText, importSuccess, importError } = useCommonTranslations()
  
  const campaign = useCampaignStore((state) => state.campaign)
  const missionsStore = useCampaignStore((state) => state.missions)
  const updateCampaign = useCampaignStore((state) => state.updateCampaign)
  const activeMission = missionsStore.find((mission) => mission.status === 'active') ?? missionsStore[0]
  const chaosValue = activeMission?.chaos ?? 0
  const looseEndsValue = missionsStore.reduce((sum, mission: MissionSummary) => sum + (mission.looseEnds ?? 0), 0)
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
  const win98TitleBarColor = useThemeStore((state) => state.win98TitleBarColor)
  const isWin98 = themeMode === 'win98'
  const isRetro = themeMode === 'retro'
  const isSquare = isWin98 || isRetro

  const emergency = useCampaignStore((state) => state.emergency)
  const toggleEmergencyChat = useCampaignStore((state) => state.toggleEmergencyChat)

  const [openPrograms, setOpenPrograms] = useState<string[]>([])
  const [minimizedPrograms, setMinimizedPrograms] = useState<string[]>([])
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  const toggleProgram = (id: string) => {
    if (id === 'antivirus') {
      if (emergency.isEnabled) {
        toggleEmergencyChat()
      }
      return
    }
    if (id === 'logoff') {
      setIsLoggedIn(false)
      return
    }
    
    // If program is not open, open it
    if (!openPrograms.includes(id)) {
      setOpenPrograms(prev => [...prev, id])
      setMinimizedPrograms(prev => prev.filter(p => p !== id))
      return
    }

    // If program is open, toggle minimize/restore
    if (minimizedPrograms.includes(id)) {
      setMinimizedPrograms(prev => prev.filter(p => p !== id))
    } else {
      setMinimizedPrograms(prev => [...prev, id])
    }
  }

  const closeProgram = (id: string) => {
    setOpenPrograms(prev => prev.filter(p => p !== id))
    setMinimizedPrograms(prev => prev.filter(p => p !== id))
  }

  const navItems = [
    { label: dashboard, path: '/', icon: LayoutDashboard },
    { label: agents, path: '/agents', icon: Users },
    { label: navMissions, path: '/missions', icon: BriefcaseBusiness },
    { label: anomalies, path: '/anomalies', icon: Atom },
  { label: reports, path: '/reports', icon: ScrollText },
  { label: rules, path: '/rules', icon: BookOpen },
    { label: notes, path: '/notes', icon: Notebook },
    { label: tracks, path: '/tracks', icon: Orbit },
    { label: settings, path: '/settings', icon: Settings },
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
    setImportMessage(importSuccess)
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
      setImportMessage(error instanceof Error ? error.message : importError)
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

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />
  }

  // Note: CSS vars are now provided by the `.app-shell` class in CSS; they can be overridden
  // via CSS or by adding inline style on this wrapper if needed for special cases.

  return (
    <div className="app-shell min-h-screen overflow-hidden bg-agency-ink/95 px-4 py-6 text-agency-cyan pb-16">
      {/* Desktop Icons */}
      <div className="fixed left-4 top-4 z-0 flex flex-col gap-6">
        {DESKTOP_ITEMS.map((item) => {
          const isActive = item.id === 'antivirus' ? emergency.isChatOpen : openPrograms.includes(item.id)
          
          let Icon = item.icon
          if (isWin98) {
            switch (item.id) {
              case 'manual': Icon = IconWin98Manual; break
              case 'antivirus': Icon = IconWin98Antivirus; break
              case 'emergency': Icon = IconWin98Emergency; break
              case 'commendation': Icon = IconWin98Commendation; break
              case 'chaos': Icon = IconWin98Chaos; break
              case 'schedule': Icon = IconWin98Schedule; break
            }
          }

          return (
            <button
              key={item.id}
              type="button"
              onDoubleClick={() => toggleProgram(item.id)}
              className={cn(
                "group flex w-24 flex-col items-center gap-1 text-center focus:outline-none ghost",
              )}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center transition-colors",
                isWin98 
                  ? "text-[#ffffff] drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]" 
                  : (isActive ? "text-agency-cyan" : "text-agency-muted group-hover:text-agency-cyan")
              )}>
                <Icon className={isWin98 ? "h-10 w-10" : "h-8 w-8"} strokeWidth={1.5} />
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-tight transition-colors",
                isWin98 ? "text-[#ffffff] drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]" : "text-agency-muted group-hover:text-agency-cyan",
                isActive && !isWin98 && "text-agency-cyan"
              )}>
                {t(`desktop.icons.${item.id}`)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Taskbar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 flex h-10 items-center justify-between border-t px-2",
        isWin98 
          ? "border-t-[#dfdfdf] bg-[#c0c0c0] text-black shadow-[inset_0_1px_0_#ffffff]" 
          : "border-agency-border bg-agency-panel/95 backdrop-blur"
      )}>
        <StartMenu 
          isOpen={isStartMenuOpen} 
          onClose={() => setIsStartMenuOpen(false)}
          onOpenProgram={toggleProgram}
        />

        <div className="flex items-center gap-2">
          {/* Start Button */}
          <button
            type="button"
            onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
            data-start-button
            className={cn(
              "flex items-center gap-2 px-3 pt-1.5 pb-0.5 font-bold uppercase tracking-wider",
              isWin98 
                ? cn(
                    "win98-raised border-2 border-b-[#404040] border-l-[#ffffff] border-r-[#404040] border-t-[#ffffff] bg-[#c0c0c0]",
                    isStartMenuOpen 
                      ? "border-b-[#ffffff] border-l-[#404040] border-r-[#ffffff] border-t-[#404040] bg-[#dfdfdf] shadow-[inset_1px_1px_#000000]"
                      : "active:border-b-[#ffffff] active:border-l-[#404040] active:border-r-[#ffffff] active:border-t-[#404040]"
                  )
                : cn(
                    "rounded hover:bg-agency-cyan/10",
                    isStartMenuOpen && "bg-agency-cyan/20"
                  )
            )}
          >
            <div className="flex flex-col gap-[1px]">
              <div className="h-0 w-0 border-b-[4px] border-l-[3px] border-r-[3px] border-b-red-500 border-l-transparent border-r-transparent" />
              <div className="flex gap-[1px]">
                <div className="h-0 w-0 border-b-[4px] border-l-[3px] border-r-[3px] border-b-red-500 border-l-transparent border-r-transparent" />
                <div className="h-0 w-0 border-b-[4px] border-l-[3px] border-r-[3px] border-b-red-500 border-l-transparent border-r-transparent" />
              </div>
            </div>
            <span className="text-xs">{t('desktop.taskbar.start')}</span>
          </button>

          {/* Taskbar Items */}
          <div className="ml-2 flex gap-1">
            {/* Emergency Protocol Item (if enabled) */}
            {emergency.isEnabled && (
                <button
                  type="button"
                  onClick={toggleEmergencyChat}
                  className={cn(
                    "flex w-32 items-center gap-2 px-2 pt-1.5 pb-0.5 text-xs text-left ghost",
                    isWin98
                      ? cn(
                          "win98-raised border-2 border-b-[#404040] border-l-[#ffffff] border-r-[#404040] border-t-[#ffffff] bg-[#c0c0c0] font-bold",
                          emergency.isChatOpen && "border-b-[#ffffff] border-l-[#404040] border-r-[#ffffff] border-t-[#404040] bg-[#dfdfdf] shadow-[inset_1px_1px_#000000]"
                        )
                      : cn(
                          "rounded text-agency-cyan",
                          emergency.isChatOpen ? "bg-agency-cyan/20" : "bg-agency-cyan/10 hover:bg-agency-cyan/20"
                        )
                  )}
                >
                  <Eye className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{t('desktop.taskbar.emergency')}</span>
                </button>
            )}

            {openPrograms.map((id) => {
              const item = DESKTOP_ITEMS.find(i => i.id === id)
              if (!item) return null
              const isMinimized = minimizedPrograms.includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleProgram(id)}
                  className={cn(
                    "flex w-32 items-center gap-2 px-2 pt-1.5 pb-0.5 text-xs text-left ghost",
                    isWin98
                      ? cn(
                          "border-2 border-b-[#404040] border-l-[#ffffff] border-r-[#404040] border-t-[#ffffff] bg-[#dfdfdf] font-bold",
                          isMinimized 
                            ? "win98-raised" // Minimized = Raised (Not pressed)
                            : "border-b-[#ffffff] border-l-[#404040] border-r-[#ffffff] border-t-[#404040] bg-[#dfdfdf] shadow-[inset_1px_1px_#000000]" // Active = Sunken (Pressed)
                        )
                      : cn(
                          "rounded text-agency-cyan",
                          isMinimized ? "bg-agency-cyan/10 hover:bg-agency-cyan/20" : "bg-agency-cyan/20"
                        )
                  )}
                >
                  <item.icon className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{t(`desktop.icons.${item.id}`)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tray */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-1",
          isWin98 
            ? "border-2 border-b-[#ffffff] border-l-[#808080] border-r-[#ffffff] border-t-[#808080] shadow-[inset_1px_1px_#000000]" 
            : ""
        )}>
          <Eye className="h-3 w-3" />
          <Volume2 className="h-3 w-3" />
          <span className="ml-1 font-mono text-xs">{chaosValue}</span>
        </div>
      </div>

      {/*
        Set a fixed content area height and prevent grid items from stretching.
        The page scrollbar is disabled; instead the right-side `main` will scroll internally.
        We subtract the explicit top/bottom padding (24px top from py-6 and 64px bottom from pb-16 = 88px) as a simple approximation.
      */}
      <div className="mx-auto grid max-w-[1400px] gap-6 lg:grid-cols-[260px_1fr] relative z-10 items-start" style={{ height: 'calc(100vh - var(--app-vertical-offset))' }}>
        <aside
          className={`self-start space-y-6 border border-agency-border bg-agency-panel/80 p-4 max-h-full overflow-y-auto ${isSquare ? 'rounded-none' : 'rounded-3xl shadow-panel'} ${isWin98 ? 'win98-raised' : ''}`}
        >
          {isWin98 && (
            <div 
              className="win98-title-bar -mx-3 -mt-3 mb-4 flex items-center justify-between px-2 py-1"
              style={{
                background: win98TitleBarColor === 'red' 
                  ? 'linear-gradient(90deg, #800000, #d01010)' 
                  : undefined
              }}
            >
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
                className={`rounded-full border border-agency-border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.25em] text-agency-muted hover:border-agency-cyan hover:text-agency-cyan ${isWin98 ? 'rounded-none bg-[#c0c0c0] text-black shadow-[inset_-1px_-1px_#000000,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] active:shadow-[inset_1px_1px_#000000,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]' : ''} ${isRetro ? 'rounded-none' : ''}`}
              >
                {edit}
              </button>
            </div>
            {isEditingHeader ? (
              <div className="space-y-2 text-xs text-agency-muted">
                <div>
                  <label className="block text-[0.6rem] uppercase tracking-[0.25em]">{divisionName}</label>
                  <input
                    className={`mt-1 w-full border border-agency-border bg-agency-ink/40 px-2 py-1 text-sm text-agency-cyan outline-none focus:border-agency-cyan ${isSquare ? 'rounded-none' : 'rounded-xl'}`}
                    value={headerDraft.name}
                    onChange={(e) => setHeaderDraft((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[0.6rem] uppercase tracking-[0.25em]">{divisionCode}</label>
                  <input
                    className={`mt-1 w-full border border-agency-border bg-agency-ink/40 px-2 py-1 text-sm text-agency-cyan outline-none focus:border-agency-cyan ${isSquare ? 'rounded-none' : 'rounded-xl'}`}
                    value={headerDraft.divisionCode}
                    onChange={(e) => setHeaderDraft((prev) => ({ ...prev, divisionCode: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[0.6rem] uppercase tracking-[0.25em]">{status}</label>
                  <input
                    className={`mt-1 w-full border border-agency-border bg-agency-ink/40 px-2 py-1 text-sm text-agency-cyan outline-none focus:border-agency-cyan ${isSquare ? 'rounded-none' : 'rounded-xl'}`}
                    value={headerDraft.status}
                    onChange={(e) => setHeaderDraft((prev) => ({ ...prev, status: e.target.value }))}
                    placeholder={campaign.status}
                  />
                </div>
                <div>
                  <label className="block text-[0.6rem] uppercase tracking-[0.25em]">{tags}</label>
                  <input
                    className={`mt-1 w-full border border-agency-border bg-agency-ink/40 px-2 py-1 text-sm text-agency-cyan outline-none focus:border-agency-cyan ${isSquare ? 'rounded-none' : 'rounded-xl'}`}
                    value={headerDraft.styleText}
                    onChange={(e) => setHeaderDraft((prev) => ({ ...prev, styleText: e.target.value }))}
                    placeholder={campaign.styleTags.join(' / ')}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cancelHeaderEdit}
                    className={`border border-agency-border px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-agency-muted hover:border-agency-amber hover:text-agency-amber ${isSquare ? 'rounded-none' : 'rounded-xl'}`}
                  >
                    {cancel}
                  </button>
                  <button
                    type="button"
                    onClick={confirmHeaderEdit}
                    className={`border border-agency-cyan px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-agency-cyan hover:bg-agency-cyan/10 ${isSquare ? 'rounded-none' : 'rounded-xl'}`}
                  >
                    {save}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xl font-semibold text-white">{campaign.name}</p>
                <p className="text-xs text-agency-muted">
                  {status}：{campaign.status} · {campaign.styleTags.join(' / ')}
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
                  `flex items-center justify-between border px-4 py-3 font-mono text-xs uppercase tracking-[0.35em] transition ${
                    isActive
                      ? `border-agency-cyan/80 bg-agency-ink text-white ${
                          isWin98 ? 'rounded-none shadow-none win98-active' : (isRetro ? 'rounded-none shadow-none' : 'rounded-2xl shadow-panel')
                        }`
                      : `border-agency-border/60 text-agency-muted hover:border-agency-cyan/40 hover:text-agency-cyan ${
                          isWin98 ? 'win98-raised' : (isSquare ? 'rounded-none' : 'rounded-2xl')
                        }`
                  }`
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

          <div className="space-y-2 text-[1 rem] text-agency-muted">
            <p className="uppercase tracking-[0.5em]">{current}</p>
            <div
              className={`border border-agency-magenta/40 p-3 font-mono ${isSquare ? 'rounded-none' : 'rounded-2xl'}`}
            >
              <p>{chaos}：{chaosValue}</p>
              <p>{looseEnds}：{looseEndsValue}</p>
            </div>
          </div>
        </aside>

        {/*
          Make the right-hand content area take the remaining height and be scrollable.
          `min-h-0` is important to enable the overflow-y-auto behavior inside flex/grid containers.
        */}
        <main className="min-w-0 min-h-0 h-full overflow-y-auto overscroll-contain space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <CommandStrip label={session} value={campaign.divisionCode} />
            <CommandStrip label={nextBriefing} value={activeMission?.code ?? '—'} />
            <CommandStrip
              label={weather}
              value={`${looseEnds}×${looseEndsValue}`}
              tooltip={(() => {
                const rule = getWeatherRuleForCount(looseEndsValue)
                const key = rule.key
                const startChaos = t(`app.common.weatherRules.rules.${key}.startChaos`)
                const weatherEvent = t(`app.common.weatherRules.rules.${key}.weatherEvent`)
                const restriction = t(`app.common.weatherRules.rules.${key}.restriction`)
                return (
                  <div className="max-w-[260px]">
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <div className="text-xs text-agency-muted">{t('app.common.weatherRules.startChaos')}</div>
                      <div className="text-xs font-mono text-agency-cyan">{startChaos}</div>
                    </div>
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <div className="text-xs text-agency-muted">{t('app.common.weatherRules.weatherEvent')}</div>
                      <div className="text-xs font-mono text-agency-cyan">{weatherEvent}</div>
                    </div>
                    <div className="text-xs text-agency-muted">{t('app.common.weatherRules.restriction')}</div>
                    <div className="mt-1 text-xs text-white">{restriction}</div>
                  </div>
                )
              })()}
            />
          </div>
          <div
            className={`border border-agency-border/60 p-4 text-[0.65rem] uppercase tracking-[0.4em] text-agency-muted ${isSquare ? 'rounded-none bg-agency-panel' : 'rounded-3xl bg-agency-ink/40'} ${isWin98 ? 'win98-raised' : ''}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span>{snapshot}</span>
              <div className="flex flex-wrap gap-2 text-xs normal-case">
                <button
                  type="button"
                  onClick={handleExportSnapshot}
                  className={`border border-agency-cyan px-3 py-1 font-mono text-agency-cyan hover:border-agency-cyan ${isSquare ? 'rounded-none' : 'rounded-xl'} ${isWin98 ? 'win98-raised' : ''}`}
                >
                  {exportText}
                </button>
                <button
                  type="button"
                  onClick={handleImportClick}
                  className={`border border-agency-border px-3 py-1 font-mono text-agency-muted hover:border-agency-cyan hover:text-agency-cyan ${isSquare ? 'rounded-none' : 'rounded-xl'} ${isWin98 ? 'win98-raised' : ''}`}
                  disabled={importing}
                >
                  {importing ? importingText : importText}
                </button>
                <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportChange} />
              </div>
            </div>
            {importMessage ? <p className="mt-2 text-[0.65rem] normal-case text-agency-amber">{importMessage}</p> : null}
          </div>
          <div
            className={`border border-agency-border/80 bg-agency-panel/70 p-6 backdrop-blur ${isSquare ? 'rounded-none' : 'rounded-3xl shadow-panel'} ${isWin98 ? 'win98-raised' : ''}`}
          >
            <Outlet />
          </div>
        </main>
      </div>
      <DomController />
      <EmergencyManager />
      <EmergencyChat />
      
      <DesktopNotepad 
        isOpen={openPrograms.includes('manual') && !minimizedPrograms.includes('manual')} 
        onClose={() => closeProgram('manual')} 
      />
      <VoidSchedule 
        isOpen={openPrograms.includes('schedule') && !minimizedPrograms.includes('schedule')} 
        onClose={() => closeProgram('schedule')} 
      />
      <CommendationClicker 
        isOpen={openPrograms.includes('commendation') && !minimizedPrograms.includes('commendation')} 
        onClose={() => closeProgram('commendation')} 
      />
      <EmergencyInbox 
        isOpen={openPrograms.includes('emergency') && !minimizedPrograms.includes('emergency')} 
        onClose={() => closeProgram('emergency')} 
      />
      <ChaosController 
        isOpen={openPrograms.includes('chaos') && !minimizedPrograms.includes('chaos')} 
        onClose={() => closeProgram('chaos')} 
      />
    </div>
  )
}
