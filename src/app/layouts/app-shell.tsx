import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, BriefcaseBusiness, Atom, ScrollText, Orbit } from 'lucide-react'
import { CommandStrip } from '@/components/ui/command-strip'
import { cn } from '@/lib/utils'
import { getAgencySnapshot, useCampaignStore } from '@/stores/campaign-store'
import { useCampaignPersistence } from '@/stores/hooks/use-campaign-persistence'
import { createSnapshotEnvelope, parseSnapshotFile } from '@/services/db/repository'
import { useThemeStore } from '@/stores/theme-store'

const navItems = [
  { label: '仪表板', path: '/', icon: LayoutDashboard },
  { label: '特工档案', path: '/agents', icon: Users },
  { label: '任务控制', path: '/missions', icon: BriefcaseBusiness },
  { label: '异常体库', path: '/anomalies', icon: Atom },
  { label: '任务报告', path: '/reports', icon: ScrollText },
  { label: '自定义轨道', path: '/tracks', icon: Orbit },
]

export function AppShell() {
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
  const setThemeMode = useThemeStore((state) => state.setMode)
  const isWin98 = themeMode === 'win98'

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
    setImportMessage('已导出当前快照。')
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
      setImportMessage('导入完成，数据已更新。')
    } catch (error) {
      console.error('[AgencyOS] 导入失败', error)
      setImportMessage(error instanceof Error ? error.message : '导入失败，请检查文件格式。')
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
            isWin98 ? 'rounded-none' : 'rounded-3xl shadow-panel',
          )}
        >
          <header className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.4em] text-red-500">Agency OS</p>
              <button
                type="button"
                onClick={openHeaderEditor}
                className="rounded-full border border-agency-border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.25em] text-agency-muted hover:border-agency-cyan hover:text-agency-cyan"
              >
                编辑
              </button>
            </div>
            {isEditingHeader ? (
              <div className="space-y-2 text-xs text-agency-muted">
                <div>
                  <label className="block text-[0.6rem] uppercase tracking-[0.25em]">分部名称</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-agency-border bg-agency-ink/40 px-2 py-1 text-sm text-agency-cyan outline-none focus:border-agency-cyan"
                    value={headerDraft.name}
                    onChange={(e) => setHeaderDraft((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[0.6rem] uppercase tracking-[0.25em]">Session / 代号</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-agency-border bg-agency-ink/40 px-2 py-1 text-sm text-agency-cyan outline-none focus:border-agency-cyan"
                    value={headerDraft.divisionCode}
                    onChange={(e) => setHeaderDraft((prev) => ({ ...prev, divisionCode: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[0.6rem] uppercase tracking-[0.25em]">状态</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-agency-border bg-agency-ink/40 px-2 py-1 text-sm text-agency-cyan outline-none focus:border-agency-cyan"
                    value={headerDraft.status}
                    onChange={(e) => setHeaderDraft((prev) => ({ ...prev, status: e.target.value }))}
                    placeholder={campaign.status}
                  />
                </div>
                <div>
                  <label className="block text-[0.6rem] uppercase tracking-[0.25em]">标签（用 / 分隔）</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-agency-border bg-agency-ink/40 px-2 py-1 text-sm text-agency-cyan outline-none focus:border-agency-cyan"
                    value={headerDraft.styleText}
                    onChange={(e) => setHeaderDraft((prev) => ({ ...prev, styleText: e.target.value }))}
                    placeholder={campaign.styleTags.join(' / ')}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cancelHeaderEdit}
                    className="rounded-xl border border-agency-border px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-agency-muted hover:border-agency-amber hover:text-agency-amber"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={confirmHeaderEdit}
                    className="rounded-xl border border-agency-cyan px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-agency-cyan hover:bg-agency-cyan/10"
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xl font-semibold text-white">{campaign.name}</p>
                <p className="text-xs text-agency-muted">
                  状态：{campaign.status} · {campaign.styleTags.join(' / ')}
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
                    'flex items-center justify-between rounded-2xl border px-4 py-3 font-mono text-xs uppercase tracking-[0.35em] transition',
                    isActive
                      ? 'border-agency-cyan/80 bg-agency-ink text-white shadow-panel'
                      : 'border-agency-border/60 text-agency-muted hover:border-agency-cyan/40 hover:text-agency-cyan',
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
            <p className="uppercase tracking-[0.5em]">混沌警戒</p>
            <div className="rounded-2xl border border-agency-magenta/40 bg-gradient-to-r from-agency-magenta/20 to-transparent p-3 font-mono">
              <p>当前：{chaosValue}</p>
              <p>散逸端：{looseEndsValue}</p>
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <CommandStrip label="SESSION" value={campaign.divisionCode} />
            <CommandStrip label="NEXT BRIEFING" value={activeMission?.code ?? '—'} />
            <CommandStrip label="WEATHER" value={`散逸端×${looseEndsValue}`} />
          </div>
          <div
            className={cn(
              'border border-agency-border/60 bg-agency-ink/40 p-4 text-[0.65rem] uppercase tracking-[0.4em] text-agency-muted',
              isWin98 ? 'rounded-none' : 'rounded-3xl',
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span>数据快照</span>
              <div className="flex flex-wrap gap-2 text-xs normal-case">
                <button
                  type="button"
                  onClick={handleExportSnapshot}
                  className="rounded-xl border border-agency-cyan/40 px-3 py-1 font-mono text-agency-cyan hover:border-agency-cyan"
                >
                  导出内容
                </button>
                <button
                  type="button"
                  onClick={handleImportClick}
                  className="rounded-xl border border-agency-border px-3 py-1 font-mono text-agency-muted hover:border-agency-cyan hover:text-agency-cyan"
                  disabled={importing}
                >
                  {importing ? '导入中…' : '导入内容'}
                </button>
                <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportChange} />
                <select
                  value={themeMode}
                  onChange={(e) => setThemeMode(e.target.value as typeof themeMode)}
                  className="rounded-xl border border-agency-border bg-agency-panel/60 px-3 py-1 font-mono text-xs text-agency-muted hover:border-agency-cyan hover:text-agency-cyan focus:outline-none"
                >
                  <option value="night">夜间模式</option>
                  <option value="day">白天模式</option>
                  <option value="win98">Win98 模式</option>
                </select>
              </div>
            </div>
            {importMessage ? <p className="mt-2 text-[0.65rem] normal-case text-agency-amber">{importMessage}</p> : null}
          </div>
          <div
            className={cn(
              'border border-agency-border/80 bg-agency-panel/70 p-6 backdrop-blur',
              isWin98 ? 'rounded-none' : 'rounded-3xl shadow-panel',
            )}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
