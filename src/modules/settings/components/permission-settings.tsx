import { useState, useEffect } from 'react'
import { useCampaignStore } from '@/stores/campaign-store'
import { useTranslation } from 'react-i18next'
import { Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme-store'

export function PermissionSettings() {
  const { t } = useTranslation()
  const themeMode = useThemeStore((state) => state.mode)
  const isWin98 = themeMode === 'win98'
  
  const emergency = useCampaignStore((state) => state.emergency)
  const setEmergencyEnabled = useCampaignStore((state) => state.setEmergencyEnabled)
  const setEmergencyPermissions = useCampaignStore((state) => state.setEmergencyPermissions)
  const setEmergencyLlmConfig = useCampaignStore((state) => state.setEmergencyLlmConfig)
  const setEmergencyPollingInterval = useCampaignStore((state) => state.setEmergencyPollingInterval)
  
  // Local state for form handling
  const [localEnabled, setLocalEnabled] = useState(emergency.isEnabled)
  const [localConfig, setLocalConfig] = useState(emergency.llmConfig)
  const [localPermissions, setLocalPermissions] = useState(emergency.permissions)
  const [localPollingInterval, setLocalPollingInterval] = useState(emergency.pollingInterval)
  const [isDirty, setIsDirty] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  // Sync local state when store changes (initial load)
  useEffect(() => {
    if (localEnabled !== emergency.isEnabled) setLocalEnabled(emergency.isEnabled)
    if (JSON.stringify(localConfig) !== JSON.stringify(emergency.llmConfig)) setLocalConfig(emergency.llmConfig)
    if (JSON.stringify(localPermissions) !== JSON.stringify(emergency.permissions)) setLocalPermissions(emergency.permissions)
    if (localPollingInterval !== emergency.pollingInterval) setLocalPollingInterval(emergency.pollingInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emergency.isEnabled, emergency.llmConfig, emergency.permissions, emergency.pollingInterval])

  const handleSave = () => {
    setEmergencyEnabled(localEnabled)
    setEmergencyLlmConfig(localConfig)
    setEmergencyPermissions(localPermissions)
    setEmergencyPollingInterval(localPollingInterval)
    setIsDirty(false)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  const handleChange = (updater: () => void) => {
    updater()
    setIsDirty(true)
    setShowSaved(false)
  }

  return (
    <div className={cn(
    )}>
      <div className="flex items-center justify-between">
        <div className={cn(isWin98 ? "pl-2" : "")}>
            <h3 className="text-lg font-medium text-[#0047BB]">{t('settings.emergency.title')}</h3>
            <p className="text-xs text-agency-muted">{t('settings.emergency.description')}</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
            <span className="text-sm text-agency-muted font-mono">
                {localEnabled ? t('settings.emergency.status.active') : t('settings.emergency.status.inactive')}
            </span>
            <input 
                type="checkbox" 
                checked={localEnabled} 
                onChange={e => {
                    const newValue = e.target.checked
                    setLocalEnabled(newValue)
                    setEmergencyEnabled(newValue)
                }}
                className={cn(
                    "accent-[#0047BB] w-5 h-5",
                    isWin98 ? "border-2 border-gray-400 mr-5" : ""
                )}
            />
        </label>
      </div>

      {localEnabled && (
        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className={cn(
                "space-y-4 border border-agency-border p-4",
                isWin98 ? "bg-agency-ink" : "rounded-lg bg-agency-ink/50"
            )}>
                <h4 className="text-sm font-mono uppercase tracking-wider text-agency-muted border-b border-agency-border pb-1 pl-2">
                    {t('settings.emergency.llmConfig.title')}
                </h4>
                <div className="grid gap-4">
                    <div>
                        <label className="text-xs text-agency-muted block mb-1">{t('settings.emergency.llmConfig.apiUrl')}</label>
                        <input 
                            className={cn(
                                "w-full bg-agency-ink border border-agency-border px-3 py-2 text-sm text-agency-cyan focus:border-[#0047BB] outline-none",
                                isWin98 ? "" : "rounded"
                            )}
                            value={localConfig.apiUrl}
                            onChange={e => handleChange(() => setLocalConfig(prev => ({ ...prev, apiUrl: e.target.value })))}
                            placeholder="https://api.openai.com/v1/chat/completions"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-agency-muted block mb-1">{t('settings.emergency.llmConfig.model')}</label>
                        <input 
                            className={cn(
                                "w-full bg-agency-ink border border-agency-border px-3 py-2 text-sm text-agency-cyan focus:border-[#0047BB] outline-none",
                                isWin98 ? "" : "rounded"
                            )}
                            value={localConfig.model}
                            onChange={e => handleChange(() => setLocalConfig(prev => ({ ...prev, model: e.target.value })))}
                            placeholder="gpt-4-turbo"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-agency-muted block mb-1">{t('settings.emergency.llmConfig.apiKey')}</label>
                        <input 
                            type="password"
                            className={cn(
                                "w-full bg-agency-ink border border-agency-border px-3 py-2 text-sm text-agency-cyan focus:border-[#0047BB] outline-none",
                                isWin98 ? "" : "rounded"
                            )}
                            value={localConfig.apiKey || ''}
                            onChange={e => handleChange(() => setLocalConfig(prev => ({ ...prev, apiKey: e.target.value })))}
                            placeholder="sk-..."
                        />
                    </div>
                </div>
            </div>

            <div className={cn(
                "space-y-4 border border-agency-border p-4",
                isWin98 ? "bg-agency-ink" : "rounded-lg bg-agency-ink/50"
            )}>
                <h4 className="text-sm font-mono uppercase tracking-wider text-agency-muted border-b border-agency-border pb-1 pl-2">
                    {t('settings.emergency.permissions.title')}
                </h4>
                <div className="grid gap-3">
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-agency-cyan/5 p-2 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={localPermissions.canReadDom}
                            onChange={e => handleChange(() => setLocalPermissions(prev => ({ ...prev, canReadDom: e.target.checked })))}
                            className="accent-[#0047BB]"
                        />
                        <span className="text-sm text-agency-cyan">{t('settings.emergency.permissions.readDom')}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-agency-cyan/5 p-2 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={localPermissions.canWriteDom}
                            onChange={e => handleChange(() => setLocalPermissions(prev => ({ ...prev, canWriteDom: e.target.checked })))}
                            className="accent-[#0047BB]"
                        />
                        <span className="text-sm text-agency-cyan">{t('settings.emergency.permissions.writeDom')}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-agency-cyan/5 p-2 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={localPermissions.canWriteCampaignData}
                            onChange={e => handleChange(() => setLocalPermissions(prev => ({ ...prev, canWriteCampaignData: e.target.checked })))}
                            className="accent-[#0047BB]"
                        />
                        <span className="text-sm text-agency-cyan">{t('settings.emergency.permissions.writeCampaign')}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-agency-cyan/5 p-2 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={localPermissions.canWriteSettingsData}
                            onChange={e => handleChange(() => setLocalPermissions(prev => ({ ...prev, canWriteSettingsData: e.target.checked })))}
                            className="accent-[#0047BB]"
                        />
                        <span className="text-sm text-agency-cyan">{t('settings.emergency.permissions.writeSettings')}</span>
                    </label>
                </div>
            </div>

            <div className={cn(
                "space-y-4 border border-agency-border p-4",
                isWin98 ? "bg-agency-ink" : "rounded-lg bg-agency-ink/50"
            )}>
                <h4 className="text-sm font-mono uppercase tracking-wider text-agency-muted border-b border-agency-border pb-1 pl-2">
                    {t('settings.emergency.automation.title')}
                </h4>
                <div>
                    <label className="text-xs text-agency-muted block mb-1">{t('settings.emergency.automation.pollingInterval')}</label>
                    <input 
                        type="number"
                        className={cn(
                            "w-full bg-agency-ink border border-agency-border px-3 py-2 text-sm text-agency-cyan focus:border-[#0047BB] outline-none",
                            isWin98 ? "" : "rounded"
                        )}
                        value={localPollingInterval || 0}
                        onChange={e => handleChange(() => setLocalPollingInterval(Number(e.target.value) || null))}
                        placeholder="0"
                    />
                    <p className="text-[10px] text-agency-muted mt-1">
                        {t('settings.emergency.automation.description')}
                    </p>
                </div>
            </div>
        </div>
      )}

      {/* Save Button Area */}
      {localEnabled && (
          <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={!isDirty}
                className={cn(
                    "flex items-center gap-2 px-6 py-2 text-sm font-medium transition-all",
                    isDirty 
                        ? "bg-[#0047BB] text-white hover:bg-[#003aa0]" 
                        : "bg-agency-border/50 text-agency-muted cursor-not-allowed",
                    isWin98 ? "border-2 border-white shadow-[2px_2px_0_0_#000]" : "rounded-lg shadow-lg"
                )}
              >
                  <Save className="w-4 h-4" />
                  {showSaved ? t('settings.emergency.saved') : t('settings.emergency.save')}
              </button>
          </div>
      )}
    </div>
  )
}
