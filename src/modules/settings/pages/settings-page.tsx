import { useState, useRef, type ChangeEvent } from 'react'
import { Github, Download, Upload, Monitor, Moon, Sun, Laptop, Languages, Layout } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import { useCampaignStore } from '@/stores/campaign-store'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { PermissionSettings } from '../components/permission-settings'

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const themeMode = useThemeStore((state) => state.mode)
  const setThemeMode = useThemeStore((state) => state.setMode)
  const win98TitleBarColor = useThemeStore((state) => state.win98TitleBarColor)
  const setWin98TitleBarColor = useThemeStore((state) => state.setWin98TitleBarColor)
  const notesAllowHtml = useCampaignStore((state) => state.notesAllowHtml)
  const setNotesAllowHtml = useCampaignStore((state) => state.setNotesAllowHtml)
  const dashboardReadOnlyStyle = useCampaignStore((state) => state.dashboardReadOnlyStyle)
  const setDashboardReadOnlyStyle = useCampaignStore((state) => state.setDashboardReadOnlyStyle)
  const isWin98 = themeMode === 'win98'
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const handleExportSettings = () => {
    const settings = {
      theme: themeMode,
      settings: {
        notesAllowHtml,
        dashboardReadOnlyStyle,
      },
      // Future settings can be added here
      version: '1.0.0'
    }
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const filename = `agency-settings-${Date.now()}.json`
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setImportMessage(t('settings.exportSuccess'))
  }

  const handleImportSettings = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const settings = JSON.parse(text)
        
        if (settings.theme) {
          setThemeMode(settings.theme)
        }
        if (settings?.settings?.notesAllowHtml !== undefined) {
          setNotesAllowHtml(Boolean(settings.settings.notesAllowHtml))
        }
        if (settings?.settings?.dashboardReadOnlyStyle !== undefined) {
          setDashboardReadOnlyStyle(Boolean(settings.settings.dashboardReadOnlyStyle))
        }
        
        setImportMessage(t('settings.importSuccess'))
      } catch (error) {
        console.error('Failed to import settings', error)
        setImportMessage(t('settings.importError'))
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className={cn("text-2xl font-bold tracking-tight", isWin98 ? "font-mono" : "")}>{t('settings.title')}</h1>
        <p className="text-agency-muted">{t('settings.description')}</p>
      </div>

      {/* Language Settings */}
      <section className={cn(
        "space-y-4 border border-agency-border/60 p-6",
        isWin98 ? "bg-agency-ink" : "rounded-2xl bg-agency-ink/40"
      )}>
        <h2 className="text-lg font-semibold text-agency-cyan flex items-center gap-2">
          <Languages className="h-5 w-5" />
          {t('settings.language.title')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <button
            onClick={() => changeLanguage('zh-CN')}
            className={cn(
              "flex flex-col items-center justify-center gap-3 border p-4 transition-all hover:border-agency-cyan hover:bg-agency-cyan/5",
              i18n.language === 'zh-CN' 
                ? "border-agency-cyan bg-agency-cyan/10 text-agency-cyan" 
                : "border-agency-border text-agency-muted",
              isWin98 ? "rounded-none" : "rounded-xl"
            )}
          >
            <span className="text-2xl">🇨🇳</span>
            <span className="text-sm font-medium">简体中文</span>
          </button>
          <button
            onClick={() => changeLanguage('en-US')}
            className={cn(
              "flex flex-col items-center justify-center gap-3 border p-4 transition-all hover:border-agency-cyan hover:bg-agency-cyan/5",
              i18n.language === 'en-US' 
                ? "border-agency-cyan bg-agency-cyan/10 text-agency-cyan" 
                : "border-agency-border text-agency-muted",
              isWin98 ? "rounded-none" : "rounded-xl"
            )}
          >
            <span className="text-2xl">🇺🇸</span>
            <span className="text-sm font-medium">English</span>
          </button>
        </div>
      </section>

      {/* Theme Settings */}
      <section className={cn(
        "space-y-4 border border-agency-border/60 p-6",
        isWin98 ? "bg-agency-ink" : "rounded-2xl bg-agency-ink/40"
      )}>
        <h2 className="text-lg font-semibold text-agency-cyan flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          {t('settings.theme.title')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <button
            onClick={() => setThemeMode('night')}
            className={cn(
              "flex flex-col items-center justify-center gap-3 border p-4 transition-all hover:border-agency-cyan hover:bg-agency-cyan/5",
              themeMode === 'night' 
                ? "border-agency-cyan bg-agency-cyan/10 text-agency-cyan" 
                : "border-agency-border text-agency-muted",
              isWin98 ? "rounded-none" : "rounded-xl"
            )}
          >
            <Moon className="h-6 w-6" />
            <span className="text-sm font-medium">{t('settings.theme.night')}</span>
          </button>
          <button
            onClick={() => setThemeMode('day')}
            className={cn(
              "flex flex-col items-center justify-center gap-3 border p-4 transition-all hover:border-agency-cyan hover:bg-agency-cyan/5",
              themeMode === 'day' 
                ? "border-agency-cyan bg-agency-cyan/10 text-agency-cyan" 
                : "border-agency-border text-agency-muted",
              isWin98 ? "rounded-none" : "rounded-xl"
            )}
          >
            <Sun className="h-6 w-6" />
            <span className="text-sm font-medium">{t('settings.theme.day')}</span>
          </button>
          <button
            onClick={() => setThemeMode('win98')}
            className={cn(
              "flex flex-col items-center justify-center gap-3 border p-4 transition-all hover:border-agency-cyan hover:bg-agency-cyan/5",
              themeMode === 'win98' 
                ? "border-agency-cyan bg-agency-cyan/10 text-agency-cyan" 
                : "border-agency-border text-agency-muted",
              isWin98 ? "rounded-none" : "rounded-xl"
            )}
          >
            <Laptop className="h-6 w-6" />
            <span className="text-sm font-medium">{t('settings.theme.win98')}</span>
          </button>
          <button
            onClick={() => setThemeMode('retro')}
            className={cn(
              "flex flex-col items-center justify-center gap-3 border p-4 transition-all hover:border-agency-cyan hover:bg-agency-cyan/5",
              themeMode === 'retro' 
                ? "border-agency-cyan bg-agency-cyan/10 text-agency-cyan" 
                : "border-agency-border text-agency-muted",
              isWin98 ? "rounded-none" : "rounded-xl"
            )}
          >
            <Monitor className="h-6 w-6" />
            <span className="text-sm font-medium">{t('settings.theme.retro')}</span>
          </button>
          <button
            onClick={() => setThemeMode('fluent')}
            className={cn(
              "flex flex-col items-center justify-center gap-3 border p-4 transition-all hover:border-agency-cyan hover:bg-agency-cyan/5",
              themeMode === 'fluent' 
                ? "border-agency-cyan bg-agency-cyan/10 text-agency-cyan" 
                : "border-agency-border text-agency-muted",
              isWin98 ? "rounded-none" : "rounded-xl"
            )}
          >
            <Layout className="h-6 w-6" />
            <span className="text-sm font-medium">{t('settings.theme.fluent')}</span>
          </button>
        </div>

        {isWin98 && (
          <div className="mt-4 border-t border-agency-border/40 pt-4">
            <h3 className="mb-3 text-sm font-medium text-agency-muted">{t('settings.theme.win98TitleBarColor')}</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setWin98TitleBarColor('blue')}
                className={cn(
                  "flex items-center gap-2 border px-4 py-2 transition-all hover:border-agency-cyan hover:bg-agency-cyan/5",
                  win98TitleBarColor === 'blue'
                    ? "border-agency-cyan bg-agency-cyan/10 text-agency-cyan"
                    : "border-agency-border text-agency-muted",
                  "rounded-none"
                )}
              >
                <div className="h-3 w-3 bg-[#000080]" />
                <span className="text-sm">{t('settings.theme.colors.blue')}</span>
              </button>
              <button
                onClick={() => setWin98TitleBarColor('red')}
                className={cn(
                  "flex items-center gap-2 border px-4 py-2 transition-all hover:border-agency-cyan hover:bg-agency-cyan/5",
                  win98TitleBarColor === 'red'
                    ? "border-agency-cyan bg-agency-cyan/10 text-agency-cyan"
                    : "border-agency-border text-agency-muted",
                  "rounded-none"
                )}
              >
                <div className="h-3 w-3 bg-[#800000]" />
                <span className="text-sm">{t('settings.theme.colors.red')}</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Notes Settings */}
      <section className={cn(
        "space-y-4 border border-agency-border/60 p-6",
        isWin98 ? "bg-agency-ink" : "rounded-2xl bg-agency-ink/40"
      )}>
        <h2 className="text-lg font-semibold text-agency-cyan">{t('settings.notes.title')}</h2>
        <p className="text-sm text-agency-muted">{t('settings.notes.description')}</p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notesAllowHtml}
              onChange={(e) => setNotesAllowHtml(e.target.checked)}
              className={cn('w-4 h-4', isWin98 ? 'border-none' : 'rounded')}
            />
            <span className="text-sm">{t('settings.notes.allowHtml')}</span>
          </label>
        </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dashboardReadOnlyStyle}
                onChange={(e) => setDashboardReadOnlyStyle(e.target.checked)}
                className={cn('w-4 h-4', isWin98 ? 'border-none' : 'rounded')}
              />
              <span className="text-sm">{t('settings.dashboard.readOnlyStyle')}</span>
            </label>
          </div>
      </section>

      {/* Emergency Settings */}
      <section className={cn(
        "space-y-4 border border-agency-border/60 p-6",
        isWin98 ? "bg-agency-ink" : "rounded-2xl bg-agency-ink/40"
      )}>
         <PermissionSettings />
      </section>

      {/* Instructions */}
      <section className={cn(
        "space-y-4 border border-agency-border/60 p-6",
        isWin98 ? "bg-agency-ink" : "rounded-2xl bg-agency-ink/40"
      )}>
        <h2 className="text-lg font-semibold text-agency-cyan">{t('settings.instructions.title')}</h2>
        <div className="space-y-4 text-sm text-agency-muted leading-relaxed">
          <p>
            {t('settings.instructions.intro')}
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              {t('settings.instructions.dashboard')}
            </li>
            <li>
              {t('settings.instructions.agents')}
            </li>
            <li>
              {t('settings.instructions.missions')}
            </li>
            <li>
              {t('settings.instructions.persistence')}
            </li>
          </ul>
        </div>
      </section>

      {/* Settings Persistence */}
      <section className={cn(
        "space-y-4 border border-agency-border/60 p-6",
        isWin98 ? "bg-agency-ink" : "rounded-2xl bg-agency-ink/40"
      )}>
        <h2 className="text-lg font-semibold text-agency-cyan">{t('settings.management.title')}</h2>
        <p className="text-sm text-agency-muted">
          {t('settings.management.description')}
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleExportSettings}
            className={cn(
              "flex items-center gap-2 border border-agency-cyan px-4 py-2 text-sm text-agency-cyan transition-colors hover:bg-agency-cyan/10",
              isWin98 ? "rounded-none" : "rounded-lg"
            )}
          >
            <Download className="h-4 w-4" />
            {t('settings.management.exportSettings')}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex items-center gap-2 border border-agency-border px-4 py-2 text-sm text-agency-muted transition-colors hover:border-agency-cyan hover:text-agency-cyan",
              isWin98 ? "rounded-none" : "rounded-lg"
            )}
          >
            <Upload className="h-4 w-4" />
            {t('settings.management.importSettings')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportSettings}
          />
        </div>
        {importMessage && (
          <p className="text-xs text-agency-cyan animate-pulse">{importMessage}</p>
        )}
      </section>

      {/* Community */}
      <section className={cn(
        "space-y-4 border border-agency-border/60 p-6",
        isWin98 ? "bg-agency-ink" : "rounded-2xl bg-agency-ink/40"
      )}>
        <h2 className="text-lg font-semibold text-agency-cyan flex items-center gap-2">
          <Github className="h-5 w-5" />
          {t('settings.community.title')}
        </h2>
        <p className="text-sm text-agency-muted">
          {t('settings.community.description')}
        </p>
        <a
          href="https://github.com/shakugannosaints/AgencyOS"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-2 border border-agency-border px-4 py-2 text-sm text-agency-muted transition-colors hover:border-agency-cyan hover:text-agency-cyan",
            isWin98 ? "win98-raised rounded-none" : "rounded-lg"
          )}
        >
          <Github className="h-4 w-4" />
          {t('settings.community.visitGithub')}
        </a>
      </section>
    </div>
  )
}
